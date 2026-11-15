import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { buttonClass } from "@/components/ui/button";
import { FULFILLMENT_LABEL } from "@/lib/catalog";
import { toPayload } from "@/lib/contract";
import { formatVnd, formatWhen } from "@/lib/format";
import { useShop, type WebOrder } from "@/lib/store";

type WorkspaceSearch = { don?: string };

export const Route = createFileRoute("/workspace")({
  validateSearch: (search: Record<string, unknown>): WorkspaceSearch => ({
    don: typeof search.don === "string" ? search.don : undefined,
  }),
  component: WorkspacePage,
});

const syncLabel = {
  queued: "Trong hàng đợi",
  sent: "Đã gửi API",
  error: "API lỗi",
} as const;

function WorkspacePage() {
  const { don } = Route.useSearch();
  const orders = useShop((state) => state.orders);
  const status = useShop((state) => state.connection.status);
  const markReceived = useShop((state) => state.markReceived);
  const retrySync = useShop((state) => state.retrySync);
  const [picked, setPicked] = useState<string | null>(don ?? null);
  const [retryNote, setRetryNote] = useState<string | null>(null);

  const activeId = picked && orders.some((order) => order.id === picked) ? picked : orders[0]?.id;
  const order = orders.find((item) => item.id === activeId) ?? null;
  const fresh = don && order?.id === don;

  const payload = useMemo(() => (order ? JSON.stringify(toPayload(order), null, 2) : ""), [order]);

  return (
    <>
      <PageHeader
        eyebrow="RF Workspace Pro · cửa sổ tiếp nhận"
        title="Hộp đơn từ website"
        lede="Đơn và phiếu tư vấn xuất hiện ở đây ngay khi khách gửi. Đây là hàng đợi trên trình duyệt. API chỉ chạy khi trang Kết nối đã đọc kho thành công."
      />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:px-6 lg:grid-cols-12">
        <section className="border border-mute bg-paper lg:col-span-5">
          <div className="flex items-center justify-between border-b border-mute px-4 py-3">
            <h2 className="font-display text-xl">Phiếu</h2>
            <p className="text-sm text-graphite">{orders.length} phiếu</p>
          </div>
          {orders.length === 0 ? (
            <p className="p-4 text-graphite">
              Chưa có đơn.{" "}
              <Link to="/kho" className="underline">
                Chọn hàng
              </Link>{" "}
              rồi đặt, phiếu sẽ nhảy vào danh sách này.
            </p>
          ) : (
            <ul>
              {orders.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setPicked(item.id)}
                    className={
                      item.id === activeId
                        ? "flex w-full flex-col gap-1 border-b border-mute bg-mist px-4 py-3 text-left"
                        : "flex w-full flex-col gap-1 border-b border-mute px-4 py-3 text-left hover:bg-mist"
                    }
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-sans text-sm tabular-nums">{item.id}</span>
                      <span className="text-xs text-graphite">{item.kind === "lead" ? "Phiếu" : "Đơn"}</span>
                    </span>
                    <span className="text-ink">{item.customerName}</span>
                    <span className="text-sm text-graphite">
                      {formatWhen(item.createdAt)} · {syncLabel[item.syncStatus]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="border border-mute bg-paper p-4 lg:col-span-7">
          {fresh ? (
            <p className="mb-4 border border-cyan bg-cyan px-3 py-3 text-sm text-ink" role="status">
              Phiếu {don} vừa vào hộp RF Workspace Pro.
            </p>
          ) : null}
          <p className="text-sm text-graphite">
            Trạng thái kết nối:{" "}
            {status === "active" ? "đang hoạt động" : status === "in_progress" ? "đã nạp kho thủ công" : "đề xuất"}.
          </p>
          {order ? <OrderDetail order={order} payload={payload} onReceived={() => markReceived(order.id)} onRetry={() => {
            setRetryNote("Đang gửi lại…");
            void retrySync(order.id).then(() => setRetryNote("Đã thử gửi lại."));
          }} retryNote={retryNote} /> : (
            <p className="mt-4 text-graphite">Chọn một phiếu để xem nội dung sẽ gửi sang Workspace Pro.</p>
          )}
          <Link to="/ket-noi" className={`${buttonClass("line")} mt-6`}>
            Mở trang kết nối
          </Link>
        </section>
      </div>
    </>
  );
}

function OrderDetail({
  order,
  payload,
  onReceived,
  onRetry,
  retryNote,
}: {
  order: WebOrder;
  payload: string;
  onReceived: () => void;
  onRetry: () => void;
  retryNote: string | null;
}) {
  return (
    <div className="mt-4">
      <h2 className="font-display text-3xl text-ink">{order.customerName}</h2>
      <p className="mt-2 text-sm text-graphite">
        {order.phone || "Không có số"} · {order.email || "Không có email"} · {FULFILLMENT_LABEL[order.fulfillment]}
      </p>
      {order.address ? <p className="mt-2 text-sm text-ink">{order.address}</p> : null}
      {order.note ? <p className="mt-2 text-ink">{order.note}</p> : null}
      <ul className="mt-4 divide-y divide-mute border-y border-mute">
        {order.lines.length === 0 ? (
          <li className="py-3 text-sm text-graphite">Phiếu không kèm dòng hàng.</li>
        ) : (
          order.lines.map((line) => (
            <li key={line.sku} className="flex justify-between gap-3 py-3 text-sm">
              <span>
                {line.name} · {line.sku} × {line.qty}
              </span>
              <span className="tabular-nums">{formatVnd(line.unitPrice * line.qty)}</span>
            </li>
          ))
        )}
      </ul>
      <p className="mt-4 font-display text-2xl tabular-nums">{formatVnd(order.total)}</p>
      <p className="mt-3 text-sm text-ink">
        {syncLabel[order.syncStatus]}
        {order.workspaceRef ? ` · ${order.workspaceRef}` : ""}. {order.syncMessage}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className={buttonClass("dark")} onClick={onReceived} disabled={order.received}>
          {order.received ? "Đã đánh dấu xem" : "Đánh dấu đã xem"}
        </button>
        <button type="button" className={buttonClass("line")} onClick={onRetry}>
          Gửi lại API
        </button>
      </div>
      {retryNote ? <p className="mt-3 text-sm text-ink">{retryNote}</p> : null}
      <p className="mt-3 text-xs text-graphite">Đánh dấu đã xem chỉ lưu trên trình duyệt này.</p>
      <h3 className="mt-8 font-display text-xl">Payload hợp đồng</h3>
      <pre className="mt-3 max-h-80 overflow-auto border border-mute bg-mist p-3 text-xs text-ink">{payload}</pre>
    </div>
  );
}

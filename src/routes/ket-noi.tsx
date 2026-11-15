import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { buttonClass } from "@/components/ui/button";
import { MIRROR_CATALOG } from "@/lib/catalog";
import { CONTRACT_VERSION } from "@/lib/contract";
import { formatWhen } from "@/lib/format";
import { useShop } from "@/lib/store";

export const Route = createFileRoute("/ket-noi")({
  component: ConnectPage,
});

const sample = {
  items: [
    {
      sku: "BK-RF-60",
      name: "Bể kính RF 60",
      category: "be-kinh",
      line: "RF Standard",
      stock: 4,
      price: 1850000,
      unit: "chiếc",
      status: "in_stock",
      promo: false,
      summary: "Dòng ví dụ đúng hợp đồng kho.",
    },
  ],
};

function ConnectPage() {
  const connection = useShop((state) => state.connection);
  const hydrated = useShop((state) => state.hydrated);
  const saveConnection = useShop((state) => state.saveConnection);
  const tryPull = useShop((state) => state.tryPull);
  const resetCatalog = useShop((state) => state.resetCatalog);
  const importCatalogJson = useShop((state) => state.importCatalogJson);
  const [baseUrl, setBaseUrl] = useState("");
  const [token, setToken] = useState("");
  const [raw, setRaw] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const seeded = useRef(false);

  useEffect(() => {
    if (!hydrated || seeded.current) return;
    seeded.current = true;
    const current = useShop.getState().connection;
    setBaseUrl(current.baseUrl);
    setToken(current.token);
  }, [hydrated]);

  return (
    <>
      <PageHeader
        eyebrow={`Hợp đồng ${CONTRACT_VERSION}`}
        title="Nối RF Workspace Pro"
        lede="Điền địa chỉ gốc của Workspace Pro khi hệ thống đó sẵn sàng. Website sẽ đọc kho tại /api/rf/inventory và đẩy đơn tới /api/rf/orders. Khóa API chỉ nằm trên trình duyệt này."
      />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:px-6 lg:grid-cols-12">
        <form
          className="flex flex-col gap-4 border border-mute bg-paper p-4 lg:col-span-7"
          onSubmit={(event) => {
            event.preventDefault();
            saveConnection({ baseUrl, token });
            setMessage("Đã lưu địa chỉ trên trình duyệt này. Bấm thử đọc kho để kiểm tra.");
          }}
        >
          <p className="text-sm text-graphite">
            Trạng thái:{" "}
            {connection.status === "active"
              ? "hoạt động"
              : connection.status === "in_progress"
                ? "đã nạp thủ công"
                : "đề xuất"}
            {connection.lastSyncAt ? ` · lần đọc gần nhất ${formatWhen(connection.lastSyncAt)}` : ""}.
          </p>
          <p className="text-sm text-ink">{connection.catalogNote}</p>
          {connection.lastError ? (
            <p role="alert" className="border border-ink px-3 py-3 text-sm">
              {connection.lastError}
            </p>
          ) : null}
          <label className="flex flex-col gap-2 text-sm text-graphite">
            Địa chỉ gốc Workspace Pro
            <input
              value={baseUrl}
              onChange={(event) => setBaseUrl(event.target.value)}
              placeholder="https://xuong.example.com"
              className="min-h-11 border border-mute bg-paper px-3 text-base text-ink"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-graphite">
            Khóa API
            <input
              type="password"
              value={token}
              autoComplete="off"
              onChange={(event) => setToken(event.target.value)}
              className="min-h-11 border border-mute bg-paper px-3 text-base text-ink"
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button type="submit" className={buttonClass("line")}>
              Lưu trên trình duyệt
            </button>
            <button
              type="button"
              className={buttonClass("dark")}
              disabled={pending}
              onClick={() => {
                saveConnection({ baseUrl, token });
                setPending(true);
                setMessage(null);
                void tryPull().then((result) => {
                  setMessage(result.message);
                  setPending(false);
                });
              }}
            >
              {pending ? "Đang đọc kho…" : "Thử đọc kho"}
            </button>
            <button
              type="button"
              className={buttonClass("line")}
              onClick={() => {
                resetCatalog();
                setMessage("Đã trở về bản gương đề xuất.");
              }}
            >
              Về bản gương
            </button>
          </div>
          {message ? (
            <p role="status" className="text-sm text-ink">
              {message}
            </p>
          ) : null}
        </form>
        <aside className="border border-mute bg-paper p-4 lg:col-span-5">
          <h2 className="font-display text-2xl">Hai đường API</h2>
          <ul className="mt-4 space-y-3 text-sm text-graphite">
            <li>GET {"{gốc}"}/api/rf/inventory — trả {"{ items: [...] }"} hoặc một mảng.</li>
            <li>POST {"{gốc}"}/api/rf/orders — nhận payload đơn, trả {"{ id }"} nếu có mã nội bộ.</li>
            <li>Header tùy chọn: Authorization: Bearer khóa.</li>
          </ul>
          <p className="mt-4 text-sm text-graphite">
            Máy chủ cần cho phép trình duyệt gọi (CORS). Chưa có API thì dán JSON kho bên dưới — website đổi kho ngay, trạng thái vẫn là đang nối, chưa coi là sống.
          </p>
        </aside>
        <section className="border border-mute bg-paper p-4 lg:col-span-12">
          <h2 className="font-display text-2xl">Nạp JSON kho</h2>
          <p className="mt-2 text-sm text-graphite">
            Bản gương gốc có {MIRROR_CATALOG.length} dòng. Có thể tải file mẫu rồi sửa số tồn trước khi nạp lại.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              className={buttonClass("line")}
              onClick={() => {
                const blob = new Blob(
                  [JSON.stringify({ items: MIRROR_CATALOG.map(({ source: _source, ...item }) => item) }, null, 2)],
                  { type: "application/json" },
                );
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = "rf-inventory-mau.json";
                link.click();
                URL.revokeObjectURL(url);
              }}
            >
              Tải JSON mẫu
            </button>
          </div>
          <textarea
            value={raw}
            onChange={(event) => setRaw(event.target.value)}
            rows={8}
            placeholder={JSON.stringify(sample)}
            className="mt-4 w-full border border-mute bg-mist p-3 font-sans text-sm text-ink"
          />
          <button
            type="button"
            className={`${buttonClass("dark")} mt-3`}
            onClick={() => {
              const result = importCatalogJson(raw);
              setMessage(result.message);
            }}
          >
            Nạp vào kho website
          </button>
        </section>
      </div>
    </>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FULFILLMENT_LABEL } from "@/lib/catalog";
import { formatVnd, formatWhen } from "@/lib/format";
import { useShop } from "@/lib/store";

type TrackSearch = { ma?: string };

export const Route = createFileRoute("/theo-doi-don-hang")({
  validateSearch: (search: Record<string, unknown>): TrackSearch => ({
    ma: typeof search.ma === "string" ? search.ma : undefined,
  }),
  component: TrackPage,
});

function TrackPage() {
  const { ma } = Route.useSearch();
  const orders = useShop((state) => state.orders);
  const [code, setCode] = useState(ma ?? "");
  const [asked, setAsked] = useState(Boolean(ma));
  const found = orders.find((order) => order.id.toLowerCase() === code.trim().toLowerCase());

  return (
    <>
      <section className="page-hero">
        <img src="/images/rf/craft.png" alt="Chế tác layout tại RF" />
        <div className="wrap">
          <p className="eyebrow">TÁC PHẨM CỦA BẠN</p>
          <h1>Theo dõi đơn hàng</h1>
          <p>Tiến độ và hình ảnh chế tác được quản lý tại RF Workspace Pro.</p>
        </div>
      </section>
      <section className="wrap section">
        <div className="section-heading">
          <div>
            <h2>Tra cứu tác phẩm</h2>
            <p>Nhập mã phiếu RFW được tạo khi gửi yêu cầu trên web này.</p>
          </div>
        </div>
        <form
          className="tracking-form"
          onSubmit={(event) => {
            event.preventDefault();
            setAsked(true);
          }}
        >
          <label htmlFor="order-code">Mã đơn hàng</label>
          <input
            id="order-code"
            name="code"
            maxLength={80}
            required
            autoComplete="off"
            placeholder="Nhập mã đơn hàng"
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
          <button className="button primary" type="submit">
            Tra cứu →
          </button>
        </form>
        {asked && found ? (
          <div className="status-message" role="status" style={{ marginTop: 18 }}>
            <strong>
              {found.id} · {found.kind === "lead" ? "Yêu cầu" : "Đơn"}
            </strong>
            <p>
              {found.customerName} · {formatWhen(found.createdAt)} · {FULFILLMENT_LABEL[found.fulfillment]}
            </p>
            <p>{found.syncMessage}</p>
            {found.lines.length > 0 ? (
              <ul>
                {found.lines.map((line) => (
                  <li key={line.sku}>
                    {line.name} × {line.qty} · {formatVnd(line.unitPrice * line.qty)}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
        {asked && !found ? (
          <p className="status-message" role="status" style={{ marginTop: 18 }}>
            Chưa thấy mã này trên trình duyệt đang mở. Liên hệ RF để nhận tiến độ và ảnh chế tác của đơn hàng.
          </p>
        ) : null}
        {!asked ? (
          <p className="status-message" style={{ marginTop: 18 }}>
            Tra cứu tự động với RF Workspace Pro hiện theo mã phiếu trên web. Nếu đơn đặt ở kênh khác, liên hệ RF để
            nhận tiến độ.
          </p>
        ) : null}
      </section>
      <section className="wrap section" style={{ paddingTop: 0 }}>
        <div className="support-row">
          <div>
            <strong>Cần hỗ trợ về đơn hàng?</strong>
            <p>Liên hệ RF để nhận thông tin tiến độ và mã truy cập của bạn.</p>
          </div>
          <a className="button" href="https://zalo.me/1393615274620008533" target="_blank" rel="noreferrer">
            Trao đổi qua Zalo ↗
          </a>
        </div>
      </section>
    </>
  );
}

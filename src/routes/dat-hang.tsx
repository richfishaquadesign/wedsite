import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { buttonClass } from "@/components/ui/button";
import { FULFILLMENT_LABEL, resolveCatalog, salePrice, type Fulfillment } from "@/lib/catalog";
import { formatVnd } from "@/lib/format";
import { useShop } from "@/lib/store";

export const Route = createFileRoute("/dat-hang")({
  component: CheckoutPage,
});

const options: Fulfillment[] = ["giao-hang", "nhan-xuong", "thi-cong"];

function CheckoutPage() {
  const navigate = useNavigate();
  const cart = useShop((state) => state.cart);
  const catalog = useShop((state) => resolveCatalog(state.liveCatalog));
  const placeOrder = useShop((state) => state.placeOrder);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [fulfillment, setFulfillment] = useState<Fulfillment>("nhan-xuong");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const lines = cart
    .map((line) => {
      const item = catalog.find((entry) => entry.sku === line.sku);
      return item ? { ...line, name: item.name, price: salePrice(item) } : null;
    })
    .filter((line): line is NonNullable<typeof line> => line !== null);
  const total = lines.reduce((sum, line) => sum + line.price * line.qty, 0);

  if (lines.length === 0) {
    return (
      <>
        <PageHeader eyebrow="Đặt hàng" title="Giỏ đang trống" lede="Chọn hàng trong kho trước khi tạo đơn." />
        <div className="mx-auto max-w-3xl px-4 py-8">
          <Link to="/kho" className={buttonClass("dark")}>
            Về kho
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Đặt hàng"
        title="Thông tin nhận đơn"
        lede="Sau khi gửi, đơn xuất hiện ngay trong hộp RF Workspace Pro. Nếu kết nối API đang hoạt động, đơn cũng được đẩy sang máy chủ."
      />
      <form
        className="mx-auto grid max-w-7xl gap-8 px-4 py-8 md:px-6 lg:grid-cols-12"
        onSubmit={(event) => {
          event.preventDefault();
          setError(null);
          if (name.trim().length < 2) {
            setError("Cần họ tên.");
            return;
          }
          const normalized = phone.replace(/[^\d+]/g, "");
          if (!/^(\+?84|0)\d{8,10}$/.test(normalized)) {
            setError("Số điện thoại chưa đúng.");
            return;
          }
          if (fulfillment === "giao-hang" && address.trim().length < 6) {
            setError("Cần địa chỉ khi chọn giao hàng.");
            return;
          }
          setPending(true);
          void placeOrder({
            customerName: name,
            phone: normalized,
            email,
            address,
            note,
            fulfillment,
          })
            .then((order) => {
              void navigate({ to: "/theo-doi-don-hang", search: { ma: order.id } });
            })
            .catch((reason: unknown) => {
              setError(reason instanceof Error ? reason.message : "Không tạo được đơn.");
              setPending(false);
            });
        }}
      >
        <div className="flex flex-col gap-4 lg:col-span-7">
          <Field label="Họ tên" value={name} onChange={setName} required />
          <Field label="Điện thoại" value={phone} onChange={setPhone} required inputMode="tel" />
          <Field label="Email (không bắt buộc)" value={email} onChange={setEmail} type="email" />
          <label className="flex flex-col gap-2 text-sm text-graphite">
            Cách nhận
            <select
              value={fulfillment}
              onChange={(event) => setFulfillment(event.target.value as Fulfillment)}
              className="min-h-11 border border-mute bg-paper px-3 text-base text-ink"
            >
              {options.map((option) => (
                <option key={option} value={option}>
                  {FULFILLMENT_LABEL[option]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-graphite">
            Địa chỉ
            <input
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              className="min-h-11 border border-mute bg-paper px-3 text-base text-ink"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-graphite">
            Ghi chú
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={4}
              className="border border-mute bg-paper px-3 py-3 text-base text-ink"
            />
          </label>
          {error ? (
            <p role="alert" className="border border-ink bg-paper px-3 py-3 text-sm text-ink">
              {error}
            </p>
          ) : null}
          <button type="submit" className={buttonClass("dark")} disabled={pending}>
            {pending ? "Đang chuyển đơn…" : "Gửi đơn về xưởng"}
          </button>
        </div>
        <aside className="h-fit border border-mute bg-paper p-4 lg:col-span-5">
          <h2 className="font-display text-2xl">Đơn</h2>
          <ul className="mt-4 divide-y divide-mute">
            {lines.map((line) => (
              <li key={line.sku} className="flex justify-between gap-4 py-3 text-sm">
                <span>
                  {line.name} × {line.qty}
                </span>
                <span className="tabular-nums">{formatVnd(line.price * line.qty)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex justify-between font-display text-2xl tabular-nums">
            <span>Tổng</span>
            <span>{formatVnd(total)}</span>
          </p>
          <p className="mt-3 text-sm text-graphite">Giá lấy tại lúc gửi. Bản gương vẫn ghi rõ là số đề xuất.</p>
        </aside>
      </form>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  inputMode?: "tel" | "text";
}) {
  return (
    <label className="flex flex-col gap-2 text-sm text-graphite">
      {label}
      <input
        required={required}
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 border border-mute bg-paper px-3 text-base text-ink"
      />
    </label>
  );
}

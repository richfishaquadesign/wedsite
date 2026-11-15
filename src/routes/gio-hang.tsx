import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { buttonClass } from "@/components/ui/button";
import { availableStock, resolveCatalog, salePrice } from "@/lib/catalog";
import { formatVnd } from "@/lib/format";
import { useShop } from "@/lib/store";

export const Route = createFileRoute("/gio-hang")({
  component: CartPage,
});

function CartPage() {
  const cart = useShop((state) => state.cart);
  const catalog = useShop((state) => resolveCatalog(state.liveCatalog));
  const stockAdjust = useShop((state) => state.stockAdjust);
  const setQty = useShop((state) => state.setQty);
  const removeLine = useShop((state) => state.removeLine);
  const lines = cart
    .map((line) => {
      const item = catalog.find((entry) => entry.sku === line.sku);
      return item ? { line, item, price: salePrice(item) } : null;
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
  const total = lines.reduce((sum, entry) => sum + entry.price * entry.line.qty, 0);

  return (
    <>
      <PageHeader
        eyebrow="Giỏ hàng"
        title="Đơn đang soạn"
        lede="Số lượng không vượt tồn của bản kho đang mở. Bấm đặt hàng để phiếu nhảy sang hộp RF Workspace Pro."
      />
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
        {lines.length === 0 ? (
          <div className="border border-mute bg-paper p-6">
            <p className="text-graphite">Giỏ đang trống.</p>
            <Link to="/kho" className={`${buttonClass("dark")} mt-4`}>
              Vào kho
            </Link>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-mute border border-mute bg-paper">
              {lines.map(({ line, item, price }) => {
                const stock = availableStock(item, stockAdjust);
                return (
                  <li key={item.sku} className="flex gap-4 p-4">
                    <img src={item.image} alt="" className="size-16 object-cover" />
                    <div className="min-w-0 flex-1">
                      <Link to="/san-pham/$sku" params={{ sku: item.sku }} className="font-display text-xl hover:underline">
                        {item.name}
                      </Link>
                      <p className="text-sm text-graphite tabular-nums">
                        {item.sku} · {formatVnd(price)}
                        {item.status !== "made_to_order" ? ` · còn ${stock}` : ""}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          className="inline-flex size-11 items-center justify-center border border-mute"
                          onClick={() => void setQty(item.sku, line.qty - 1)}
                          aria-label="Giảm số lượng"
                        >
                          −
                        </button>
                        <span className="w-8 text-center tabular-nums">{line.qty}</span>
                        <button
                          type="button"
                          className="inline-flex size-11 items-center justify-center border border-mute"
                          onClick={() => void setQty(item.sku, line.qty + 1)}
                          aria-label="Tăng số lượng"
                        >
                          +
                        </button>
                        <button type="button" className="ml-auto text-sm underline" onClick={() => removeLine(item.sku)}>
                          Xóa
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 flex items-center justify-between border border-mute bg-paper p-4">
              <p className="text-graphite">Tạm tính</p>
              <p className="font-display text-2xl tabular-nums">{formatVnd(total)}</p>
            </div>
            <Link to="/dat-hang" className={`${buttonClass("dark")} mt-4 w-full`}>
              Đặt hàng
            </Link>
          </>
        )}
      </div>
    </>
  );
}

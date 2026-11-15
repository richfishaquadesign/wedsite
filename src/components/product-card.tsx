import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { buttonClass } from "@/components/ui/button";
import {
  availableStock,
  canBuy,
  CATEGORY_LABEL,
  salePrice,
  stockLabel,
  type InventoryItem,
} from "@/lib/catalog";
import { formatVnd } from "@/lib/format";
import { useShop } from "@/lib/store";

export function ProductCard({ item }: { item: InventoryItem }) {
  const stockAdjust = useShop((state) => state.stockAdjust);
  const hydrated = useShop((state) => state.hydrated);
  const addToCart = useShop((state) => state.addToCart);
  const stock = availableStock(item, stockAdjust);
  const price = salePrice(item);
  const [note, setNote] = useState<string | null>(null);
  const buyable = canBuy(item, stock);

  return (
    <article className="flex h-full flex-col border border-mute bg-paper">
      <Link to="/san-pham/$sku" params={{ sku: item.sku }} className="block">
        <img
          src={item.image}
          alt=""
          className="aspect-[4/3] w-full object-cover"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="text-xs text-graphite">
          {CATEGORY_LABEL[item.category]} · {item.line}
        </p>
        <h3 className="font-display text-xl text-ink">
          <Link to="/san-pham/$sku" params={{ sku: item.sku }} className="hover:underline">
            {item.name}
          </Link>
        </h3>
        <p className="flex-1 text-sm text-graphite">{item.summary}</p>
        <p className="text-xs text-graphite">Ảnh xưởng, minh họa nhóm hàng.</p>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            {item.promo ? (
              <p className="text-xs text-graphite line-through tabular-nums">{formatVnd(item.price)}</p>
            ) : null}
            <p className="font-sans text-base text-ink tabular-nums">{formatVnd(price)}</p>
          </div>
          {item.promo ? (
            <span className="bg-cyan px-2 py-1 text-xs text-ink">−10% chọn lọc</span>
          ) : null}
        </div>
        <p className="text-sm text-graphite">{stockLabel(item, stock)}</p>
        <button
          type="button"
          className={buttonClass("dark")}
          disabled={!hydrated || !buyable}
          onClick={() => {
            void addToCart(item.sku).then((result) => setNote(result.message));
          }}
        >
          {buyable ? "Thêm vào giỏ" : "Hết hàng"}
        </button>
        {note ? (
          <p className="text-sm text-ink" role="status">
            {note}
          </p>
        ) : null}
      </div>
    </article>
  );
}

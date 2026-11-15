import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { buttonClass } from "@/components/ui/button";
import {
  availableStock,
  canBuy,
  CATEGORY_LABEL,
  resolveCatalog,
  salePrice,
  stockLabel,
} from "@/lib/catalog";
import { formatVnd } from "@/lib/format";
import { useShop } from "@/lib/store";
import {
  loadVaultCatalog,
  mapVaultCategoryToInventory,
  resolveVaultVideoUrl,
  updatePageSeo,
  type VaultProduct,
} from "@/lib/vault-catalog";

export const Route = createFileRoute("/san-pham/$sku")({
  component: ProductPage,
});

function ProductPage() {
  const { sku } = Route.useParams();
  const catalog = useShop((state) => resolveCatalog(state.liveCatalog));
  const stockAdjust = useShop((state) => state.stockAdjust);
  const hydrated = useShop((state) => state.hydrated);
  const addToCart = useShop((state) => state.addToCart);
  const [vaultItem, setVaultItem] = useState<VaultProduct | null>(null);
  const [activeImg, setActiveImg] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    void loadVaultCatalog()
      .then((payload) => {
        if (!alive) return;
        const target = sku.trim().toLowerCase();
        const found =
          payload.products.find(
            (p) => p.sku.toLowerCase() === target || p.seo_slug.toLowerCase() === target,
          ) ?? null;
        setVaultItem(found);
        if (found) {
          setActiveImg(found.images[0] || "");
          updatePageSeo(
            found.seo_title || `${found.title} | RF Aquarium`,
            found.meta_description || "",
          );
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [sku]);

  const liveMatch = catalog.find(
    (entry) =>
      entry.sku.toLowerCase() === sku.toLowerCase() ||
      (vaultItem ? entry.sku.toLowerCase() === vaultItem.sku.toLowerCase() : false),
  );

  const item =
    liveMatch ??
    (vaultItem
      ? {
          sku: vaultItem.sku,
          name: vaultItem.title,
          category: mapVaultCategoryToInventory(vaultItem.category),
          line: "RF Artisan Collection" as const,
          stock: 0,
          price: vaultItem.price_vnd,
          unit: "bộ",
          warehouse: "RF Knowledge OS",
          status: "made_to_order" as const,
          image: vaultItem.images[0] || "/media/xuong-khong-gian.webp",
          summary: vaultItem.meta_description || vaultItem.web_description,
          promo: false,
          source: "mirror" as const,
          updatedAt: new Date().toISOString().slice(0, 10),
        }
      : undefined);

  if (!item) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
        <h1 className="font-display text-3xl text-ink">Không có mã này</h1>
        <p className="mt-3 text-graphite">Mã {sku} không nằm trong kho đang hiển thị.</p>
        <Link to="/kho" className={`${buttonClass("dark")} mt-6`}>
          Về kho
        </Link>
      </div>
    );
  }

  const gallery = vaultItem && vaultItem.images.length > 0 ? vaultItem.images : [item.image];
  const mainImage = activeImg && gallery.includes(activeImg) ? activeImg : gallery[0];
  const videoUrls = (vaultItem?.videos ?? [])
    .map((v) => resolveVaultVideoUrl(v))
    .filter((v): v is string => Boolean(v));
  const stock = availableStock(item, stockAdjust);
  const max = item.status === "made_to_order" ? 20 : stock;
  const buyable = canBuy(item, stock);
  const related = catalog.filter((entry) => entry.category === item.category && entry.sku !== item.sku).slice(0, 3);

  return (
    <article className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:px-6 lg:grid-cols-12 lg:py-16">
      <div className="lg:col-span-7">
        <img src={mainImage} alt={item.name} className="aspect-[4/3] w-full border border-mute object-cover" />
        {gallery.length > 1 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {gallery.map((src, idx) => (
              <button
                key={src}
                type="button"
                onClick={() => setActiveImg(src)}
                className={`border p-0 ${src === mainImage ? "border-ink border-2" : "border-mute"}`}
                aria-label={`Xem ảnh ${idx + 1}`}
              >
                <img src={src} alt={`${item.name} ${idx + 1}`} className="h-16 w-16 object-cover" />
              </button>
            ))}
          </div>
        ) : null}
        {videoUrls.length > 0 ? (
          <div className="mt-4 grid gap-3">
            {videoUrls.map((vUrl) => (
              <video
                key={vUrl}
                src={vUrl}
                controls
                playsInline
                preload="metadata"
                className="w-full border border-mute bg-black"
              />
            ))}
          </div>
        ) : null}
      </div>
      <div className="lg:col-span-5">
        <p className="text-sm text-graphite">
          <Link to="/kho" className="underline">
            Kho
          </Link>
          {" · "}
          {item.sku}
        </p>
        <h1 className="mt-3 font-display text-3xl text-ink md:text-5xl">{item.name}</h1>
        <p className="mt-3 text-graphite">
          {CATEGORY_LABEL[item.category]} · {item.line}
          {vaultItem?.dimensions ? ` · ${vaultItem.dimensions} cm` : ""}
        </p>
        <p className="mt-4 whitespace-pre-line text-base text-ink">
          {vaultItem?.web_description || item.summary}
        </p>
        <p className="mt-4 text-sm text-graphite">
          Kho ghi nhận: {item.warehouse}. Cập nhật {item.updatedAt}. Nguồn:{" "}
          {item.source === "workspace" ? "RF Workspace Pro" : "bản gương đề xuất"}.
        </p>
        <div className="mt-6 flex items-end gap-4">
          <p className="font-display text-3xl tabular-nums">{formatVnd(salePrice(item))}</p>
          {item.promo ? (
            <p className="text-sm text-graphite line-through tabular-nums">{formatVnd(item.price)}</p>
          ) : null}
        </div>
        {item.promo ? <p className="mt-2 bg-cyan px-2 py-1 text-xs text-ink inline-block">−10% chọn lọc theo banner XanhDeal</p> : null}
        <p className="mt-4 text-graphite">{stockLabel(item, stock)}</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-graphite">
            Số lượng
            <input
              type="number"
              min={1}
              max={Math.max(max, 1)}
              value={qty}
              disabled={!buyable}
              onChange={(event) => setQty(Number(event.target.value))}
              className="h-11 w-20 border border-mute bg-paper px-3 text-base text-ink tabular-nums"
            />
          </label>
          <button
            type="button"
            className={buttonClass("dark")}
            disabled={!hydrated || !buyable}
            onClick={() => {
              const amount = Number.isFinite(qty) ? Math.max(1, qty) : 1;
              void addToCart(item.sku, amount).then((result) => setNote(result.message));
            }}
          >
            {buyable ? "Thêm vào giỏ" : "Hết hàng"}
          </button>
        </div>
        {note ? (
          <p className="mt-3 text-sm text-ink" role="status">
            {note}{" "}
            <Link to="/gio-hang" className="underline">
              Mở giỏ
            </Link>
          </p>
        ) : null}
      </div>
      {related.length > 0 ? (
        <div className="lg:col-span-12">
          <h2 className="font-display text-2xl text-ink">Cùng nhóm</h2>
          <ul className="mt-4 divide-y divide-mute border-y border-mute">
            {related.map((entry) => (
              <li key={entry.sku} className="flex items-center justify-between gap-4 py-3">
                <Link to="/san-pham/$sku" params={{ sku: entry.sku }} className="hover:underline">
                  {entry.name}
                </Link>
                <span className="tabular-nums">{formatVnd(salePrice(entry))}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}

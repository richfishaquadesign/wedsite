import { salePrice, type InventoryItem, type StockStatus } from "@/lib/catalog";
import { formatVnd } from "@/lib/format";
import {
  formatVaultCategoryLabel,
  indexLiveBySku,
  loadVaultCatalog,
  type VaultProduct,
} from "@/lib/vault-catalog";

export type WorkVariant = {
  sku: string;
  label: string;
  price: number | null;
  dimensions?: string | null;
  packageDimensionsCm?: string;
  packageWeightG?: number;
  seoSlug?: string;
  seoTitle?: string;
  metaDescription?: string;
  stock?: number;
  stockStatus?: StockStatus;
  warehouse?: string;
};

export type Work = {
  id: string;
  sku: string;
  name: string;
  image: string;
  thumbnail?: string;
  price: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  images?: string[];
  videos?: string[];
  category: string;
  description?: string;
  seoSlug?: string;
  seoTitle?: string;
  metaDescription?: string;
  dimensions?: string | null;
  packageDimensionsCm?: string;
  packageWeightG?: number;
  stock?: number;
  stockStatus?: StockStatus;
  warehouse?: string;
  variants?: WorkVariant[];
  source?: "vault" | "workspace";
};

export const COLLECTION_CATEGORIES = [
  "Tất cả",
  "BONSAI",
  "CỔNG VÒM",
  "ĐẢO BAY",
  "HANG ĐỘNG",
  "HẺM NÚI",
  "LINH THÚ",
  "NATURE",
  "NHẤT TRỤ",
  "RỪNG",
  "TRĂNG",
  "VÁCH SUỐI",
  "BIOTOP CUỘI",
  "CẦU VỒNG",
  "BỂ SIÊU TRONG",
  "BỂ BÁN CẠN",
  "BỂ TERRARIUM",
  "BỂ MINI",
  "ĐÈN LED",
  "LỌC & BƠM",
  "XỬ LÝ NƯỚC",
  "CÁT, PHÂN NỀN",
  "ĐÁ LŨA",
  "PHỤ KIỆN KHÁC",
] as const;

let pending: Promise<Work[]> | null = null;

function stripSizeSuffix(title: string): string {
  return title.replace(/\s*[—–-]\s*(?:Size\s+)?[SMLX]{1,3}\s*\([^)]+\)\s*$/i, "").trim();
}

function extractVariantLabel(p: VaultProduct): string {
  const m = p.title.match(/[—–-]\s*((?:Size\s+)?[SMLX]{1,3}\s*\([^)]+\))\s*$/i);
  if (m) return m[1].trim();
  if (p.dimensions) return `${p.dimensions} cm`;
  return p.sku;
}

function stripSlugSize(slug: string): string {
  return slug.replace(/-(?:s|m|l|xl)-\d+x\d+x\d+$/i, "").trim();
}

function getLayoutGroupKey(p: VaultProduct): string | null {
  if (p.category !== "01_LAYOUT" || !p.source_file) return null;
  const parts = p.source_file.split("/");
  if (parts.length >= 6) return parts.slice(2, -2).join("/");
  if (parts.length >= 4) return parts.slice(2, -1).join("/");
  return null;
}

function toVariant(p: VaultProduct): WorkVariant {
  return {
    sku: p.sku,
    label: extractVariantLabel(p),
    price: p.price_vnd > 0 ? p.price_vnd : null,
    dimensions: p.dimensions,
    packageDimensionsCm: p.package_dimensions_cm,
    packageWeightG: p.package_weight_g,
    seoSlug: p.seo_slug,
    seoTitle: p.seo_title,
    metaDescription: p.meta_description,
  };
}

function mapSingleVaultProduct(p: VaultProduct): Work {
  const firstImg = p.images[0] || "/images/rf/craft.png";
  const price = p.price_vnd > 0 ? p.price_vnd : null;
  return {
    id: p.seo_slug || p.sku,
    sku: p.sku,
    name: p.title,
    image: firstImg,
    thumbnail: firstImg,
    price,
    minPrice: price,
    maxPrice: price,
    images: p.images,
    videos: p.videos,
    category: formatVaultCategoryLabel(p.category, p.sub_category),
    description: p.web_description,
    seoSlug: p.seo_slug,
    seoTitle: p.seo_title,
    metaDescription: p.meta_description,
    dimensions: p.dimensions,
    packageDimensionsCm: p.package_dimensions_cm,
    packageWeightG: p.package_weight_g,
    variants: [toVariant(p)],
    source: "vault",
  };
}

function groupVaultProducts(products: VaultProduct[]): Work[] {
  const result: Work[] = [];
  const layoutBuckets = new Map<string, VaultProduct[]>();

  for (const p of products) {
    const gKey = getLayoutGroupKey(p);
    if (!gKey) {
      result.push(mapSingleVaultProduct(p));
      continue;
    }
    const list = layoutBuckets.get(gKey);
    if (list) list.push(p);
    else layoutBuckets.set(gKey, [p]);
  }

  const groupedLayouts: Work[] = [];
  for (const items of layoutBuckets.values()) {
    const sorted = [...items].sort((a, b) => (a.price_vnd || 0) - (b.price_vnd || 0));
    const first = sorted[0];
    const variants = sorted.map(toVariant);
    const prices = variants.map((v) => v.price).filter((x): x is number => x != null && x > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : null;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : null;
    const firstImg = first.images[0] || "/images/rf/craft.png";
    const groupName = variants.length > 1 ? stripSizeSuffix(first.title) : first.title;
    const groupSlug =
      variants.length > 1 && first.seo_slug
        ? stripSlugSize(first.seo_slug)
        : first.seo_slug || first.sku;

    groupedLayouts.push({
      id: groupSlug,
      sku: first.sku,
      name: groupName,
      image: firstImg,
      thumbnail: firstImg,
      price: minPrice,
      minPrice,
      maxPrice,
      images: first.images,
      videos: first.videos,
      category: formatVaultCategoryLabel(first.category, first.sub_category),
      description: first.web_description,
      seoSlug: groupSlug,
      seoTitle: `${groupName} | RF Aquarium`,
      metaDescription: first.meta_description,
      dimensions: first.dimensions,
      packageDimensionsCm: first.package_dimensions_cm,
      packageWeightG: first.package_weight_g,
      variants,
      source: "vault",
    });
  }

  return [...groupedLayouts, ...result];
}

export function loadWorks(): Promise<Work[]> {
  if (!pending) {
    pending = loadVaultCatalog()
      .then((payload) => groupVaultProducts(payload.products))
      .catch(() =>
        fetch("/catalog.json").then((response) => {
          if (!response.ok) throw new Error("catalog");
          return response.json() as Promise<Work[]>;
        }),
      );
  }
  return pending;
}

export function mergeWorksWithLive(
  vaultWorks: Work[] | null,
  live: InventoryItem[] | null,
  liveActive: boolean,
): Work[] | null {
  if (!vaultWorks && (!liveActive || !live)) return null;
  const liveBySku = liveActive ? indexLiveBySku(live) : new Map<string, InventoryItem>();
  const seen = new Set<string>();
  const merged: Work[] = [];

  for (const w of vaultWorks ?? []) {
    seen.add(w.sku.toUpperCase());
    const updatedVariants = w.variants?.map((v) => {
      seen.add(v.sku.toUpperCase());
      const inv = liveBySku.get(v.sku.toUpperCase());
      if (!inv) return v;
      const p = salePrice(inv);
      return {
        ...v,
        price: p > 0 ? p : v.price,
        stock: inv.stock,
        stockStatus: inv.status,
        warehouse: inv.warehouse,
      };
    });

    const firstLive = liveBySku.get(w.sku.toUpperCase());
    const prices = (updatedVariants ?? [])
      .map((v) => v.price)
      .filter((x): x is number => x != null && x > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : w.price;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : w.price;
    const hasAnyLive = Boolean(firstLive) || (updatedVariants ?? []).some((v) => v.warehouse != null);

    merged.push({
      ...w,
      price: minPrice,
      minPrice,
      maxPrice,
      variants: updatedVariants,
      stock: firstLive ? firstLive.stock : w.stock,
      stockStatus: firstLive ? firstLive.status : w.stockStatus,
      warehouse: firstLive ? firstLive.warehouse : w.warehouse,
      source: hasAnyLive ? "workspace" : w.source,
    });
  }

  if (liveActive && live) {
    for (const inv of live) {
      if (seen.has(inv.sku.toUpperCase())) continue;
      const p = salePrice(inv);
      merged.push({
        id: inv.sku,
        sku: inv.sku,
        name: inv.name,
        image: inv.image,
        price: p,
        minPrice: p,
        maxPrice: p,
        category: inv.category,
        description: inv.summary,
        stock: inv.stock,
        stockStatus: inv.status,
        warehouse: inv.warehouse,
        source: "workspace",
      });
    }
  }

  return merged;
}

export function findWorkByParam(items: Work[], param: string): Work | null {
  const target = param.trim().toLowerCase();
  return (
    items.find(
      (item) =>
        item.seoSlug?.toLowerCase() === target ||
        item.sku.toLowerCase() === target ||
        item.id.toLowerCase() === target ||
        item.variants?.some(
          (v) => v.seoSlug?.toLowerCase() === target || v.sku.toLowerCase() === target,
        ),
    ) ?? null
  );
}

export function workPrice(price: number | null, maxPrice?: number | null) {
  if (price == null) return "Giá liên hệ";
  if (maxPrice != null && maxPrice > price) return `Từ ${formatVnd(price)}`;
  return formatVnd(price);
}

export function workImage(work: Work, thumb = false) {
  if (thumb && work.thumbnail) return work.thumbnail;
  return work.image || work.thumbnail || "/images/rf/craft.png";
}

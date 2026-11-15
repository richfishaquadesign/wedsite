import type { Category, InventoryItem } from "@/lib/catalog";

export type VaultProduct = {
  sku: string;
  title: string;
  category: "01_LAYOUT" | "02_BE_KINH" | "03_PHU_KIEN" | string;
  sub_category: string;
  price_vnd: number;
  dimensions?: string | null;
  package_dimensions_cm?: string;
  package_weight_g?: number;
  seo_slug: string;
  seo_title: string;
  meta_description: string;
  web_description: string;
  images: string[];
  videos: string[];
  source_file?: string;
};

export type VaultCatalogPayload = {
  generated_at: string;
  total: number;
  products: VaultProduct[];
};

const SUBCAT_LABEL: Record<string, string> = {
  BONSAI: "BONSAI",
  CONG_VOM: "CỔNG VÒM",
  DAO_BAY: "ĐẢO BAY",
  HANG_DONG: "HANG ĐỘNG",
  HEM_NUI: "HẺM NÚI",
  LINH_THU: "LINH THÚ",
  NATURE: "NATURE",
  NHAT_TRU: "NHẤT TRỤ",
  RUNG: "RỪNG",
  TRANG: "TRĂNG",
  VACH_SUOI: "VÁCH SUỐI",
  "BIOTOP CUỘI": "BIOTOP CUỘI",
  "CẦU VỒNG": "CẦU VỒNG",
  "01_BE_SIEU_TRONG": "BỂ SIÊU TRONG",
  "02_BE_BAN_CAN": "BỂ BÁN CẠN",
  "03_BE_TERRARIUM": "BỂ TERRARIUM",
  "04_BE_MINI_KHAC": "BỂ MINI",
  "01_DEN_LED": "ĐÈN LED",
  "02_LOC_BOM": "LỌC & BƠM",
  "03_XU_LY_NUOC_VI_SINH": "XỬ LÝ NƯỚC",
  "04_CAT_SAN_PHAN_NEN": "CÁT, PHÂN NỀN",
  "05_DA_GO_LUA_REU": "ĐÁ LŨA",
  "06_PHU_KIEN_KHAC": "PHỤ KIỆN KHÁC",
};

export function formatVaultCategoryLabel(category: string, subCategory: string): string {
  const key = subCategory.trim();
  if (SUBCAT_LABEL[key]) return SUBCAT_LABEL[key];
  if (SUBCAT_LABEL[key.toUpperCase()]) return SUBCAT_LABEL[key.toUpperCase()];
  if (category === "02_BE_KINH") return "BỂ KÍNH";
  if (category === "03_PHU_KIEN") return "PHỤ KIỆN KHÁC";
  return key || "LAYOUT";
}

export function mapVaultCategoryToInventory(category: string): Category {
  if (category === "02_BE_KINH") return "be-kinh";
  if (category === "03_PHU_KIEN") return "phu-kien";
  return "hardscape";
}

export function resolveVaultVideoUrl(relPath: string): string | null {
  if (/^https?:\/\//i.test(relPath)) return relPath;
  const base = (import.meta.env.VITE_MEDIA_BASE_URL as string | undefined)?.trim();
  if (!base) return null;
  return `${base.replace(/\/$/, "")}/${relPath.replace(/^\//, "")}`;
}

export function updatePageSeo(title: string, description: string) {
  if (typeof document === "undefined") return;
  if (title) document.title = title;
  if (description) {
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.append(meta);
    }
    meta.content = description;
  }
}

let vaultPending: Promise<VaultCatalogPayload> | null = null;

export function loadVaultCatalog(): Promise<VaultCatalogPayload> {
  if (!vaultPending) {
    vaultPending = fetch("/data/catalog_public.json")
      .then((response) => {
        if (!response.ok) throw new Error("vault-catalog");
        return response.json() as Promise<VaultCatalogPayload>;
      })
      .catch((err) => {
        vaultPending = null;
        throw err;
      });
  }
  return vaultPending;
}

export function indexLiveBySku(live: InventoryItem[] | null): Map<string, InventoryItem> {
  const map = new Map<string, InventoryItem>();
  if (!live) return map;
  for (const item of live) {
    map.set(item.sku.toUpperCase(), item);
  }
  return map;
}

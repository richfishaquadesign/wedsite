export type Category = "be-kinh" | "hardscape" | "phu-kien" | "dich-vu";
export type ProductLine = "RF Standard" | "RF Artisan Collection";
export type StockStatus = "in_stock" | "low" | "made_to_order";
export type Fulfillment = "giao-hang" | "nhan-xuong" | "thi-cong";

export type InventoryItem = {
  sku: string;
  name: string;
  category: Category;
  line: ProductLine;
  stock: number;
  price: number;
  unit: string;
  warehouse: string;
  status: StockStatus;
  image: string;
  summary: string;
  promo: boolean;
  source: "mirror" | "workspace";
  updatedAt: string;
};

export const CATEGORY_LABEL: Record<Category, string> = {
  "be-kinh": "Bể kính",
  hardscape: "Hardscape",
  "phu-kien": "Phụ kiện",
  "dich-vu": "Dịch vụ",
};

export const FULFILLMENT_LABEL: Record<Fulfillment, string> = {
  "giao-hang": "Giao hàng",
  "nhan-xuong": "Nhận tại xưởng",
  "thi-cong": "Thi công / tư vấn",
};

const mirror = (
  item: Omit<InventoryItem, "warehouse" | "source" | "updatedAt">,
): InventoryItem => ({
  ...item,
  warehouse: "Kho xưởng · bản gương",
  source: "mirror",
  updatedAt: "2026-11-08",
});

/** Bản gương đề xuất — không phải tồn kho sống của RF Workspace Pro. */
export const MIRROR_CATALOG: InventoryItem[] = [
  mirror({
    sku: "BK-RF-60",
    name: "Bể kính RF 60",
    category: "be-kinh",
    line: "RF Standard",
    stock: 4,
    price: 1850000,
    unit: "chiếc",
    status: "in_stock",
    image: "/media/xuong-khong-gian.webp",
    summary: "Kích thước mẫu 60×36×36 cm. Giá niêm yết mẫu, chờ kho sống ghi đè.",
    promo: false,
  }),
  mirror({
    sku: "BK-RF-90",
    name: "Bể kính RF 90",
    category: "be-kinh",
    line: "RF Standard",
    stock: 2,
    price: 3450000,
    unit: "chiếc",
    status: "low",
    image: "/media/xuong-rong.webp",
    summary: "Kích thước mẫu 90×45×45 cm. Nằm trong nhóm được chọn của banner XanhDeal.",
    promo: true,
  }),
  mirror({
    sku: "BK-RF-120",
    name: "Bể kính RF 120",
    category: "be-kinh",
    line: "RF Standard",
    stock: 1,
    price: 6200000,
    unit: "chiếc",
    status: "low",
    image: "/media/xuong-ban.webp",
    summary: "Kích thước mẫu 120×50×50 cm. Ảnh là không gian xưởng, không phải ảnh đóng thùng.",
    promo: false,
  }),
  mirror({
    sku: "HS-LUA-VONG",
    name: "Lũa ghép vòng cung",
    category: "hardscape",
    line: "RF Artisan Collection",
    stock: 2,
    price: 2800000,
    unit: "bố cục",
    status: "in_stock",
    image: "/media/lua-vong-cung.webp",
    summary: "Lũa ghép đang chế tác tại bàn. Ảnh là hiện vật trong xưởng, chưa phải ảnh bán lẻ.",
    promo: true,
  }),
  mirror({
    sku: "HS-BONSAI",
    name: "Bố cục bonsai lũa",
    category: "hardscape",
    line: "RF Artisan Collection",
    stock: 0,
    price: 5400000,
    unit: "tác phẩm",
    status: "made_to_order",
    image: "/media/bonsai-lua.webp",
    summary: "Làm theo yêu cầu. Quyền và phạm vi theo hợp đồng, không phải tuyên bố độc bản.",
    promo: false,
  }),
  mirror({
    sku: "HS-DA-THAN",
    name: "Bộ đá layout than",
    category: "hardscape",
    line: "RF Standard",
    stock: 8,
    price: 890000,
    unit: "bộ",
    status: "in_stock",
    image: "/media/ban-den.webp",
    summary: "Bộ đá cho bố cục. Ảnh minh họa bàn chế tác, không phải ảnh đá thành phẩm.",
    promo: true,
  }),
  mirror({
    sku: "PK-NEN",
    name: "Nền trải hoàn thiện",
    category: "phu-kien",
    line: "RF Standard",
    stock: 11,
    price: 420000,
    unit: "bao",
    status: "in_stock",
    image: "/media/xuong-ban.webp",
    summary: "Vật tư nền cho bố cục. Tồn và giá là số mẫu trong bản gương.",
    promo: false,
  }),
  mirror({
    sku: "DV-TUVAN",
    name: "Tư vấn bố cục",
    category: "dich-vu",
    line: "RF Standard",
    stock: 0,
    price: 500000,
    unit: "buổi",
    status: "made_to_order",
    image: "/media/xuong-khong-gian.webp",
    summary: "Một buổi chốt hướng bố cục. Giá mẫu, phạm vi chốt sau khi trao đổi.",
    promo: false,
  }),
  mirror({
    sku: "DV-LAYOUT",
    name: "Thi công layout tại xưởng",
    category: "dich-vu",
    line: "RF Artisan Collection",
    stock: 0,
    price: 8500000,
    unit: "gói",
    status: "made_to_order",
    image: "/media/xuong-che-tac.webp",
    summary: "Thi công bố cục tại xưởng. Chưa gồm vận chuyển. Không phải báo giá đã chốt.",
    promo: false,
  }),
];

export function resolveCatalog(live: InventoryItem[] | null) {
  return live ?? MIRROR_CATALOG;
}

export function availableStock(item: InventoryItem, adjust: Record<string, number>) {
  return Math.max(0, item.stock - (adjust[item.sku] ?? 0));
}

export function canBuy(item: InventoryItem, stock: number) {
  return item.status === "made_to_order" || stock > 0;
}

export function salePrice(item: InventoryItem) {
  if (!item.promo) return item.price;
  const discounted = Math.floor((item.price * 9) / 10);
  return Math.round(discounted / 1000) * 1000;
}

export function stockLabel(item: InventoryItem, stock: number) {
  if (item.status === "made_to_order") return "Làm theo yêu cầu";
  if (stock <= 0) return "Hết trong bản kho này";
  if (stock <= 2) return `Sắp hết · còn ${stock} ${item.unit}`;
  return `Còn ${stock} ${item.unit}`;
}

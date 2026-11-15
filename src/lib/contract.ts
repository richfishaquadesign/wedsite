import { z } from "zod";
import type { Fulfillment, InventoryItem } from "@/lib/catalog";

export const CONTRACT_VERSION = "1.0-proposed";

export type ConnectionStatus = "proposed" | "in_progress" | "active";

export type OrderPayload = {
  source: "rf-aquarium-web";
  contractVersion: typeof CONTRACT_VERSION;
  sentAt: string;
  order: {
    externalId: string;
    channel: "website";
    kind: "order" | "lead";
    createdAt: string;
    customer: {
      name: string;
      phone: string;
      email: string;
      address: string;
      note: string;
    };
    fulfillment: Fulfillment;
    currency: "VND";
    lines: { sku: string; name: string; qty: number; unitPrice: number }[];
    total: number;
  };
};

const itemSchema = z.object({
  sku: z.string().trim().min(1),
  name: z.string().trim().min(1),
  category: z.enum(["be-kinh", "hardscape", "phu-kien", "dich-vu"]),
  line: z.enum(["RF Standard", "RF Artisan Collection"]),
  stock: z.coerce.number().int().nonnegative(),
  price: z.coerce.number().int().nonnegative(),
  unit: z.string().trim().min(1).optional(),
  warehouse: z.string().trim().optional(),
  status: z.enum(["in_stock", "low", "made_to_order"]).optional(),
  image: z.string().trim().optional(),
  summary: z.string().trim().optional(),
  promo: z.boolean().optional(),
  updatedAt: z.string().optional(),
});

export function parseInventoryPayload(data: unknown): InventoryItem[] {
  const wrapped = z.object({ items: z.array(z.unknown()) }).safeParse(data);
  const rows = wrapped.success ? wrapped.data.items : z.array(z.unknown()).parse(data);
  if (rows.length === 0) throw new Error("Kho trả về không có dòng hàng nào.");
  return rows.map((row) => {
    const parsed = itemSchema.parse(row);
    const status =
      parsed.status ??
      (parsed.stock === 0 ? "made_to_order" : parsed.stock <= 2 ? "low" : "in_stock");
    return {
      sku: parsed.sku,
      name: parsed.name,
      category: parsed.category,
      line: parsed.line,
      stock: parsed.stock,
      price: parsed.price,
      unit: parsed.unit || "cái",
      warehouse: parsed.warehouse || "RF Workspace Pro",
      status,
      image: parsed.image || "/media/xuong-khong-gian.webp",
      summary: parsed.summary || "Dòng kho đọc từ RF Workspace Pro.",
      promo: parsed.promo ?? false,
      source: "workspace",
      updatedAt: parsed.updatedAt || new Date().toISOString().slice(0, 10),
    };
  });
}

export function explainSyncError(error: unknown) {
  if (error instanceof z.ZodError) {
    return "Dữ liệu kho chưa khớp hợp đồng: mỗi dòng cần sku, name, category, line, stock và price.";
  }
  if (error instanceof Error) return error.message;
  return "Không đọc được dữ liệu.";
}

export function normalizeBase(input: string) {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("Chưa có địa chỉ RF Workspace Pro.");
  const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let url: URL;
  try {
    url = new URL(withProto);
  } catch {
    throw new Error("Địa chỉ RF Workspace Pro không hợp lệ.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Chỉ chấp nhận địa chỉ http hoặc https.");
  }
  const path = url.pathname.replace(/\/$/, "");
  return `${url.origin}${path === "/" ? "" : path}`;
}

function endpoint(baseUrl: string, path: string) {
  return `${normalizeBase(baseUrl)}${path}`;
}

function authHeader(token: string): Record<string, string> {
  const value = token.trim();
  return value ? { Authorization: `Bearer ${value}` } : {};
}

export async function pullInventory(baseUrl: string, token: string) {
  const url = endpoint(baseUrl, "/api/rf/inventory");
  let response: Response;
  try {
    response = await fetch(url, { headers: { Accept: "application/json", ...authHeader(token) } });
  } catch {
    throw new Error("Không gọi được RF Workspace Pro. Kiểm tra địa chỉ và CORS.");
  }
  if (!response.ok) throw new Error(`Workspace Pro trả mã ${response.status} khi đọc kho.`);
  return parseInventoryPayload(await response.json());
}

export async function pushOrder(baseUrl: string, token: string, payload: OrderPayload) {
  const url = endpoint(baseUrl, "/api/rf/orders");
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...authHeader(token),
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("Không gọi được RF Workspace Pro. Kiểm tra địa chỉ và CORS.");
  }
  if (!response.ok) throw new Error(`Workspace Pro trả mã ${response.status} khi nhận đơn.`);
  const text = await response.text();
  if (!text) return { workspaceRef: null as string | null };
  try {
    const json = JSON.parse(text) as { id?: unknown; workspaceRef?: unknown };
    const ref =
      typeof json.workspaceRef === "string"
        ? json.workspaceRef
        : typeof json.id === "string"
          ? json.id
          : null;
    return { workspaceRef: ref };
  } catch {
    return { workspaceRef: null as string | null };
  }
}

export function toPayload(order: {
  id: string;
  createdAt: string;
  kind: "order" | "lead";
  customerName: string;
  phone: string;
  email: string;
  address: string;
  note: string;
  fulfillment: Fulfillment;
  lines: OrderPayload["order"]["lines"];
  total: number;
}): OrderPayload {
  return {
    source: "rf-aquarium-web",
    contractVersion: CONTRACT_VERSION,
    sentAt: new Date().toISOString(),
    order: {
      externalId: order.id,
      channel: "website",
      kind: order.kind,
      createdAt: order.createdAt,
      customer: {
        name: order.customerName,
        phone: order.phone,
        email: order.email,
        address: order.address,
        note: order.note,
      },
      fulfillment: order.fulfillment,
      currency: "VND",
      lines: order.lines,
      total: order.total,
    },
  };
}

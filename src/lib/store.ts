import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  availableStock,
  canBuy,
  resolveCatalog,
  salePrice,
  type Fulfillment,
  type InventoryItem,
} from "@/lib/catalog";
import {
  explainSyncError,
  parseInventoryPayload,
  pullInventory,
  pushOrder,
  toPayload,
  type ConnectionStatus,
} from "@/lib/contract";

export type CartLine = { sku: string; qty: number };

export type WebOrder = {
  id: string;
  createdAt: string;
  kind: "order" | "lead";
  customerName: string;
  phone: string;
  email: string;
  address: string;
  note: string;
  fulfillment: Fulfillment;
  lines: { sku: string; name: string; qty: number; unitPrice: number }[];
  total: number;
  syncStatus: "queued" | "sent" | "error";
  syncMessage: string;
  workspaceRef: string | null;
  received: boolean;
};

export type Connection = {
  baseUrl: string;
  token: string;
  status: ConnectionStatus;
  lastSyncAt: string | null;
  lastError: string | null;
  catalogNote: string;
};

type LeadInput = {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  note: string;
  fulfillment: Fulfillment;
  sku?: string;
  line?: { sku: string; name: string; unitPrice: number };
};

type Shop = {
  hydrated: boolean;
  cart: CartLine[];
  orders: WebOrder[];
  liveCatalog: InventoryItem[] | null;
  stockAdjust: Record<string, number>;
  notifyEmails: string[];
  connection: Connection;
  addToCart: (sku: string, qty?: number) => Promise<{ ok: boolean; message: string }>;
  setQty: (sku: string, qty: number) => Promise<void>;
  removeLine: (sku: string) => void;
  placeOrder: (input: LeadInput) => Promise<WebOrder>;
  saveLead: (input: LeadInput) => Promise<WebOrder>;
  markReceived: (id: string) => void;
  retrySync: (id: string) => Promise<void>;
  saveConnection: (partial: Pick<Connection, "baseUrl" | "token">) => void;
  resetCatalog: () => void;
  importCatalogJson: (raw: string) => { ok: boolean; message: string };
  tryPull: () => Promise<{ ok: boolean; message: string }>;
  rememberEmail: (email: string) => Promise<{ ok: boolean; message: string }>;
};

const defaultConnection: Connection = {
  baseUrl: "",
  token: "",
  status: "proposed",
  lastSyncAt: null,
  lastError: null,
  catalogNote: "Bản gương đề xuất — chưa phải tồn kho sống của RF Workspace Pro.",
};

function makeId() {
  const now = new Date();
  const stamp = [
    String(now.getFullYear()).slice(2),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `RFW-${stamp}-${rand}`;
}

async function syncOrder(order: WebOrder) {
  const { connection } = useShop.getState();
  if (connection.status !== "active" || !connection.baseUrl.trim()) return;
  try {
    const ack = await pushOrder(connection.baseUrl, connection.token, toPayload(order));
    useShop.setState((state) => ({
      orders: state.orders.map((item) =>
        item.id === order.id
          ? {
              ...item,
              syncStatus: "sent",
              syncMessage: ack.workspaceRef
                ? `Đã gửi tới RF Workspace Pro · mã ${ack.workspaceRef}.`
                : "Đã gửi tới RF Workspace Pro.",
              workspaceRef: ack.workspaceRef,
            }
          : item,
      ),
    }));
  } catch (error) {
    const message = explainSyncError(error);
    useShop.setState((state) => ({
      orders: state.orders.map((item) =>
        item.id === order.id ? { ...item, syncStatus: "error", syncMessage: message } : item,
      ),
      connection: { ...state.connection, lastError: message },
    }));
  }
}

export const useShop = create<Shop>()(
  persist(
    (set, get) => ({
      hydrated: false,
      cart: [],
      orders: [],
      liveCatalog: null,
      stockAdjust: {},
      notifyEmails: [],
      connection: defaultConnection,
      addToCart: async (sku, qty = 1) => {
        await hydrateShop();
        const state = get();
        const item = resolveCatalog(state.liveCatalog).find((entry) => entry.sku === sku);
        if (!item) return { ok: false, message: "Không có mã này trong kho." };
        const stock = availableStock(item, state.stockAdjust);
        if (!canBuy(item, stock)) return { ok: false, message: "Hết hàng trong bản kho hiện tại." };
        const max = item.status === "made_to_order" ? 20 : stock;
        const current = state.cart.find((line) => line.sku === sku)?.qty ?? 0;
        const next = Math.min(max, current + qty);
        if (next === current) return { ok: false, message: "Đã đạt số lượng tồn." };
        const cart = state.cart.some((line) => line.sku === sku)
          ? state.cart.map((line) => (line.sku === sku ? { ...line, qty: next } : line))
          : [...state.cart, { sku, qty: next }];
        set({ cart });
        return { ok: true, message: "Đã thêm vào giỏ." };
      },
      setQty: async (sku, qty) => {
        await hydrateShop();
        const state = get();
        if (qty <= 0) {
          set({ cart: state.cart.filter((line) => line.sku !== sku) });
          return;
        }
        const item = resolveCatalog(state.liveCatalog).find((entry) => entry.sku === sku);
        if (!item) return;
        const stock = availableStock(item, state.stockAdjust);
        const max = item.status === "made_to_order" ? 20 : Math.max(stock, 0);
        const next = Math.min(max, qty);
        if (next <= 0) {
          set({ cart: state.cart.filter((line) => line.sku !== sku) });
          return;
        }
        set({
          cart: state.cart.map((line) => (line.sku === sku ? { ...line, qty: next } : line)),
        });
      },
      removeLine: (sku) => set({ cart: get().cart.filter((line) => line.sku !== sku) }),
      placeOrder: async (input) => {
        await hydrateShop();
        const state = get();
        const catalog = resolveCatalog(state.liveCatalog);
        const lines: WebOrder["lines"] = [];
        const adjust = { ...state.stockAdjust };
        for (const line of state.cart) {
          const item = catalog.find((entry) => entry.sku === line.sku);
          if (!item) throw new Error(`Mã ${line.sku} không còn trong kho.`);
          const stock = availableStock(item, adjust);
          if (item.status !== "made_to_order" && line.qty > stock) {
            throw new Error(`${item.name} chỉ còn ${stock} ${item.unit}.`);
          }
          if (item.status !== "made_to_order") {
            adjust[item.sku] = (adjust[item.sku] ?? 0) + line.qty;
          }
          lines.push({
            sku: item.sku,
            name: item.name,
            qty: line.qty,
            unitPrice: salePrice(item),
          });
        }
        if (lines.length === 0) throw new Error("Giỏ hàng đang trống.");
        const order: WebOrder = {
          id: makeId(),
          createdAt: new Date().toISOString(),
          kind: "order",
          customerName: input.customerName.trim(),
          phone: input.phone.trim(),
          email: input.email.trim(),
          address: input.address.trim(),
          note: input.note.trim(),
          fulfillment: input.fulfillment,
          lines,
          total: lines.reduce((sum, line) => sum + line.qty * line.unitPrice, 0),
          syncStatus: "queued",
          syncMessage:
            "Đơn đã vào hộp RF Workspace Pro trên trình duyệt này. API chỉ gửi đi khi kết nối ở trạng thái hoạt động.",
          workspaceRef: null,
          received: false,
        };
        set({ cart: [], stockAdjust: adjust, orders: [order, ...state.orders] });
        await syncOrder(order);
        return get().orders.find((item) => item.id === order.id) ?? order;
      },
      saveLead: async (input) => {
        await hydrateShop();
        const state = get();
        const catalog = resolveCatalog(state.liveCatalog);
        const picked = input.sku ? catalog.find((item) => item.sku === input.sku) : undefined;
        const lines = input.line
          ? [{ sku: input.line.sku, name: input.line.name, qty: 1, unitPrice: input.line.unitPrice }]
          : picked
            ? [{ sku: picked.sku, name: picked.name, qty: 1, unitPrice: salePrice(picked) }]
            : [];
        const order: WebOrder = {
          id: makeId(),
          createdAt: new Date().toISOString(),
          kind: "lead",
          customerName: input.customerName.trim(),
          phone: input.phone.trim(),
          email: input.email.trim(),
          address: input.address.trim(),
          note: input.note.trim(),
          fulfillment: input.fulfillment,
          lines,
          total: lines.reduce((sum, line) => sum + line.unitPrice, 0),
          syncStatus: "queued",
          syncMessage:
            "Yêu cầu đã vào hộp RF Workspace Pro trên trình duyệt này. Chưa gửi API vì kết nối chưa hoạt động, trừ khi trạng thái là hoạt động.",
          workspaceRef: null,
          received: false,
        };
        set({ orders: [order, ...state.orders] });
        await syncOrder(order);
        return get().orders.find((item) => item.id === order.id) ?? order;
      },
      markReceived: (id) =>
        set({
          orders: get().orders.map((order) =>
            order.id === id ? { ...order, received: true } : order,
          ),
        }),
      retrySync: async (id) => {
        await hydrateShop();
        const order = get().orders.find((item) => item.id === id);
        if (!order) return;
        await syncOrder(order);
      },
      saveConnection: ({ baseUrl, token }) =>
        set({
          connection: {
            ...get().connection,
            baseUrl: baseUrl.trim(),
            token: token.trim(),
            lastError: null,
          },
        }),
      resetCatalog: () =>
        set({
          liveCatalog: null,
          stockAdjust: {},
          connection: {
            ...get().connection,
            status: "proposed",
            lastError: null,
            catalogNote: defaultConnection.catalogNote,
          },
        }),
      importCatalogJson: (raw) => {
        try {
          const items = parseInventoryPayload(JSON.parse(raw));
          set({
            liveCatalog: items,
            stockAdjust: {},
            connection: {
              ...get().connection,
              status: "in_progress",
              lastSyncAt: new Date().toISOString(),
              lastError: null,
              catalogNote: "Đã nạp file kho thủ công. Chưa phải luồng API sống.",
            },
          });
          return { ok: true, message: `Đã nạp ${items.length} dòng hàng vào kho website.` };
        } catch (error) {
          const message = explainSyncError(error);
          return { ok: false, message };
        }
      },
      tryPull: async () => {
        const { connection } = get();
        try {
          const items = await pullInventory(connection.baseUrl, connection.token);
          set({
            liveCatalog: items,
            stockAdjust: {},
            connection: {
              ...get().connection,
              status: "active",
              lastSyncAt: new Date().toISOString(),
              lastError: null,
              catalogNote: "Kho đang đọc từ RF Workspace Pro.",
            },
          });
          return { ok: true, message: `Đã đọc ${items.length} dòng từ RF Workspace Pro.` };
        } catch (error) {
          const message = explainSyncError(error);
          set({ connection: { ...get().connection, lastError: message } });
          return { ok: false, message };
        }
      },
      rememberEmail: async (email) => {
        await hydrateShop();
        const clean = email.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
          return { ok: false, message: "Email chưa đúng định dạng." };
        }
        if (get().notifyEmails.includes(clean)) {
          return { ok: true, message: "Email này đã được ghi nhận." };
        }
        const order = await get().saveLead({
          customerName: "Đăng ký email",
          phone: "",
          email: clean,
          address: "",
          note: "Xin báo khi kho RF Workspace Pro được nối sống.",
          fulfillment: "thi-cong",
        });
        set({ notifyEmails: [...get().notifyEmails, clean] });
        return { ok: true, message: `Đã chuyển yêu cầu ${order.id} vào hộp đơn.` };
      },
    }),
    {
      name: "rf-aquarium-shop-v1",
      skipHydration: true,
      partialize: (state) => ({
        cart: state.cart,
        orders: state.orders,
        liveCatalog: state.liveCatalog,
        stockAdjust: state.stockAdjust,
        notifyEmails: state.notifyEmails,
        connection: state.connection,
      }),
    },
  ),
);

let hydratePromise: Promise<void> | null = null;

export function hydrateShop() {
  if (typeof window === "undefined") return Promise.resolve();
  if (!hydratePromise) {
    hydratePromise = Promise.resolve(useShop.persist.rehydrate()).then(() => {
      useShop.setState({ hydrated: true });
    });
  }
  return hydratePromise;
}

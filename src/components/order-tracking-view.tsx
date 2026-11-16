import { useCallback, useEffect, useState } from "react";
import { FULFILLMENT_LABEL } from "@/lib/catalog";
import { formatVnd, formatWhen } from "@/lib/format";
import { useShop } from "@/lib/store";
import { key as SUPABASE_KEY, url as SUPABASE_URL } from "@/utils/supabase/config";

type ProductionStage = {
  id?: string;
  name?: string;
  type?: string;
  status?: string;
  qcStatus?: string;
  p1Worker?: string;
  p2Worker?: string;
  workerName?: string;
  stage1Photo?: string;
  stage2Photo?: string;
};

type CustomerNote = {
  id: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  readBy?: string | null;
  readAt?: string | null;
};

type TrackOrderResponse = {
  success: boolean;
  requirePhone?: boolean;
  hasPhone?: boolean;
  hasTrackingCode?: boolean;
  error?: string;
  orderId?: string;
  orderCode?: string;
  channel?: string;
  createdAt?: string;
  customerName?: string;
  status?: string;
  items?: Array<{
    name?: string;
    productName?: string;
    productId?: string;
    sku?: string;
    quantity?: number;
    qty?: number;
  }>;
  trackingCode?: string;
  production?: ProductionStage;
  productions?: ProductionStage[];
  packing?: {
    packerName?: string;
    status?: string;
    packagePhotos?: string[];
  };
  customerNotes?: CustomerNote[];
};

const cleanUrl = SUPABASE_URL.replace(/[\uFEFF\r\n\t ]/g, "");
const cleanKey = SUPABASE_KEY.replace(/[\uFEFF\r\n\t ]/g, "");

async function callTrackRpc<T>(fnName: string, params: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${cleanUrl}/rest/v1/rpc/${fnName}`, {
    method: "POST",
    headers: {
      apikey: cleanKey,
      Authorization: `Bearer ${cleanKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });
  const data = (await res.json()) as T & { message?: string };
  if (!res.ok) {
    throw new Error(data?.message || `HTTP ${res.status}`);
  }
  return data;
}

export function OrderTrackingView({ initialCode = "" }: { initialCode?: string }) {
  const localOrders = useShop((state) => state.orders);
  const [orderCode, setOrderCode] = useState(initialCode);
  const [phoneLast4, setPhoneLast4] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<TrackOrderResponse | null>(null);
  const [localFallback, setLocalFallback] = useState<(typeof localOrders)[number] | null>(null);

  const [newNote, setNewNote] = useState("");
  const [verifyToken, setVerifyToken] = useState("");
  const [sendingNote, setSendingNote] = useState(false);
  const [noteStatus, setNoteStatus] = useState("");

  const runSearch = useCallback(
    async (rawCode: string, rawLast4: string) => {
      const code = rawCode.trim();
      if (!code) return;
      setLoading(true);
      setError("");
      setNoteStatus("");
      setVerifyToken("");
      setLocalFallback(null);
      try {
        const res = await callTrackRpc<TrackOrderResponse>("rf_track_order", {
          p_order_code: code,
          p_phone_last4: rawLast4.trim(),
        });
        if (!res?.success) {
          const localMatch = localOrders.find(
            (o) => o.id.toLowerCase() === code.toLowerCase(),
          );
          if (localMatch) {
            setLocalFallback(localMatch);
            setData(null);
          } else {
            setData(null);
            setError(res?.error || "Không tìm thấy đơn hàng.");
            if (res?.requirePhone && typeof document !== "undefined") {
              document.getElementById("phone-last4")?.focus();
            }
          }
        } else {
          setData(res);
        }
      } catch {
        const localMatch = localOrders.find(
          (o) => o.id.toLowerCase() === code.toLowerCase(),
        );
        if (localMatch) {
          setLocalFallback(localMatch);
          setData(null);
        } else {
          setData(null);
          setError("Không kết nối được tới hệ thống, vui lòng thử lại.");
        }
      } finally {
        setLoading(false);
      }
    },
    [localOrders],
  );

  useEffect(() => {
    if (initialCode.trim()) {
      setOrderCode(initialCode);
      void runSearch(initialCode, "");
    }
  }, [initialCode, runSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void runSearch(orderCode, phoneLast4);
  };

  const handleSendNote = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newNote.trim();
    if (!trimmed || !data?.orderId) return;
    const effectiveToken = data.hasPhone ? phoneLast4.trim() : verifyToken.trim();
    if (!data.hasPhone && !effectiveToken) {
      setNoteStatus("Vui lòng nhập Tên tài khoản đặt hàng hoặc 4 ký tự cuối Mã Vận Đơn để xác thực.");
      return;
    }
    setSendingNote(true);
    setNoteStatus("");
    try {
      const res = await callTrackRpc<{ success: boolean; error?: string }>(
        "rf_add_customer_order_note",
        {
          p_order_code: data.orderId,
          p_note: trimmed,
          p_verify_token: effectiveToken,
        },
      );
      if (res?.success) {
        setNewNote("");
        setNoteStatus("Đã gửi ghi chú về xưởng. Nhân viên phụ trách sẽ xác nhận sớm.");
        const refreshed = await callTrackRpc<TrackOrderResponse>("rf_track_order", {
          p_order_code: data.orderId,
          p_phone_last4: phoneLast4.trim(),
        });
        if (refreshed?.success) setData(refreshed);
      } else {
        setNoteStatus(res?.error || "Không gửi được ghi chú.");
      }
    } catch {
      setNoteStatus("Lỗi kết nối khi gửi ghi chú, vui lòng thử lại.");
    } finally {
      setSendingNote(false);
    }
  };

  const productions =
    Array.isArray(data?.productions) && data.productions.length > 0
      ? data.productions
      : data?.production
        ? [data.production]
        : [];
  const packagePhotos = Array.isArray(data?.packing?.packagePhotos)
    ? data.packing.packagePhotos
    : [];

  return (
    <>
      <section className="page-hero">
        <img src="/images/rf/craft.png" alt="Chế tác layout tại RF" />
        <div className="wrap">
          <p className="eyebrow">TÁC PHẨM CỦA BẠN</p>
          <h1>Theo dõi đơn hàng</h1>
          <p>
            Theo dõi quá trình chế tác, hình ảnh thực tế tại xưởng, tình trạng đóng gói kiện hàng và gửi ghi chú trực tiếp về xưởng.
          </p>
        </div>
      </section>

      <section className="wrap section space-y-8">
        <div className="section-heading">
          <div>
            <h2>Tra cứu hành trình đơn hàng</h2>
            <p>Nhập mã đơn hàng (Shopee, TikTok, bán lẻ hoặc WEB-...) để xem tiến độ trực tiếp.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="tracking-form" style={{ maxWidth: 720 }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 grid gap-1.5">
              <label htmlFor="order-code" className="text-xs uppercase tracking-[0.12em] text-[#b0b0b0]">
                Mã đơn hàng
              </label>
              <input
                id="order-code"
                name="code"
                maxLength={100}
                required
                autoComplete="off"
                placeholder="Nhập mã đơn (VD: 261116EC27JEK1 hoặc WEB-...)"
                value={orderCode}
                onChange={(e) => setOrderCode(e.target.value)}
                className="!min-h-[46px] !rounded-[3px] !border !border-[#333333] !bg-[#0a0a0a] !px-3.5 !py-2.5 text-sm !text-white placeholder:!text-[#666666] focus:!outline-none focus-visible:!outline-none focus:!border-white transition-colors"
              />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="phone-last4" className="text-xs uppercase tracking-[0.12em] text-[#b0b0b0]">
                4 số cuối SĐT (đơn Lẻ / Web)
              </label>
              <input
                id="phone-last4"
                name="phoneLast4"
                maxLength={4}
                inputMode="numeric"
                autoComplete="off"
                placeholder="VD: 5526"
                value={phoneLast4}
                onChange={(e) => setPhoneLast4(e.target.value)}
                className="!min-h-[46px] !rounded-[3px] !border !border-[#333333] !bg-[#0a0a0a] !px-3.5 !py-2.5 text-sm !text-white placeholder:!text-[#666666] focus:!outline-none focus-visible:!outline-none focus:!border-white transition-colors"
              />
            </div>
          </div>

          <button
            className="button light focus-visible:!outline-white"
            type="submit"
            disabled={loading}
          >
            {loading ? "Đang kiểm tra..." : "Xem tiến độ đơn hàng →"}
          </button>

          {error ? (
            <p className="border-l-2 border-white/60 bg-[#111111] px-4 py-3 text-sm text-[#e5e5e5]" role="alert">
              {error}
            </p>
          ) : null}
        </form>

        {localFallback ? (
          <div className="status-message !border-l-white !bg-[#111111] !text-[#e5e5e5]" role="status">
            <strong>
              {localFallback.id} · {localFallback.kind === "lead" ? "Yêu cầu" : "Đơn"}
            </strong>
            <p>
              {localFallback.customerName} · {formatWhen(localFallback.createdAt)} ·{" "}
              {FULFILLMENT_LABEL[localFallback.fulfillment]}
            </p>
            <p>{localFallback.syncMessage}</p>
            {localFallback.lines.length > 0 ? (
              <ul>
                {localFallback.lines.map((line) => (
                  <li key={line.sku}>
                    {line.name} × {line.qty} · {formatVnd(line.unitPrice * line.qty)}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        {data?.success ? (
          <div className="space-y-6">
            {/* 1. Trạng thái & Người thực hiện */}
            <div className="rounded-[4px] border border-[#333333] bg-[#111111] p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#262626] pb-4">
                <div>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-[#b0b0b0]">
                    Mã đơn hàng {data.channel ? `· ${data.channel}` : ""}
                  </span>
                  <h3 className="mt-1 text-xl font-medium tracking-tight text-white">
                    {data.orderCode || data.orderId}
                  </h3>
                  <p className="text-xs text-[#b0b0b0] mt-1">
                    Khách hàng: <span className="text-white">{data.customerName}</span>
                    {data.trackingCode ? ` · Mã vận đơn: ${data.trackingCode}` : ""}
                  </p>
                </div>
                <span className="inline-flex items-center rounded-[3px] border border-[#444444] bg-[#0a0a0a] px-3.5 py-1.5 text-xs font-medium text-white tracking-wide">
                  {data.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="rounded-[4px] border border-[#262626] bg-[#0a0a0a] p-4">
                  <span className="block text-xs text-[#858585] mb-1">Nghệ nhân thực hiện</span>
                  <strong className="text-white font-medium">
                    {productions[0]?.workerName || "Đang phân công"}
                  </strong>
                  {productions[0]?.p1Worker && productions[0]?.p2Worker && productions[0].p1Worker !== productions[0].p2Worker ? (
                    <span className="block text-xs text-[#858585] mt-1">
                      Khâu 1: {productions[0].p1Worker} · Khâu 2: {productions[0].p2Worker}
                    </span>
                  ) : null}
                </div>
                <div className="rounded-[4px] border border-[#262626] bg-[#0a0a0a] p-4">
                  <span className="block text-xs text-[#858585] mb-1">Nhân viên đóng gói</span>
                  <strong className="text-white font-medium">
                    {data.packing?.packerName || "Chưa đến khâu đóng gói"}
                  </strong>
                </div>
              </div>
            </div>

            {/* 2. Hình ảnh thực tế tại xưởng */}
            <div className="rounded-[4px] border border-[#333333] bg-[#111111] p-6 space-y-4">
              <h3 className="text-base font-medium text-white">
                Hình ảnh thực tế quá trình hoàn thiện
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-[4px] border border-[#262626] bg-[#0a0a0a] overflow-hidden">
                  <div className="border-b border-[#262626] bg-[#141414] px-3 py-2 text-xs font-medium text-center text-[#b0b0b0]">
                    Khâu 1: Dựng khung &amp; Cắt dán
                  </div>
                  {productions[0]?.stage1Photo ? (
                    <a href={productions[0].stage1Photo} target="_blank" rel="noreferrer" className="block focus-visible:outline-white">
                      <img
                        src={productions[0].stage1Photo}
                        alt="Ảnh khâu 1"
                        referrerPolicy="no-referrer"
                        className="w-full h-52 object-cover"
                      />
                    </a>
                  ) : (
                    <div className="h-52 flex items-center justify-center text-xs text-[#666666]">
                      Chưa cập nhật ảnh
                    </div>
                  )}
                </div>

                <div className="rounded-[4px] border border-[#262626] bg-[#0a0a0a] overflow-hidden">
                  <div className="border-b border-[#262626] bg-[#141414] px-3 py-2 text-xs font-medium text-center text-[#b0b0b0]">
                    Khâu 2: Gia cố &amp; Hoàn thiện
                  </div>
                  {productions[0]?.stage2Photo ? (
                    <a href={productions[0].stage2Photo} target="_blank" rel="noreferrer" className="block focus-visible:outline-white">
                      <img
                        src={productions[0].stage2Photo}
                        alt="Ảnh khâu 2"
                        referrerPolicy="no-referrer"
                        className="w-full h-52 object-cover"
                      />
                    </a>
                  ) : (
                    <div className="h-52 flex items-center justify-center text-xs text-[#666666]">
                      Chưa cập nhật ảnh
                    </div>
                  )}
                </div>

                <div className="rounded-[4px] border border-[#262626] bg-[#0a0a0a] overflow-hidden">
                  <div className="border-b border-[#262626] bg-[#141414] px-3 py-2 text-xs font-medium text-center text-[#b0b0b0]">
                    Kiện hàng hoàn tất
                  </div>
                  {packagePhotos[0] ? (
                    <a href={packagePhotos[0]} target="_blank" rel="noreferrer" className="block focus-visible:outline-white">
                      <img
                        src={packagePhotos[0]}
                        alt="Ảnh kiện hoàn tất"
                        referrerPolicy="no-referrer"
                        className="w-full h-52 object-cover"
                      />
                    </a>
                  ) : (
                    <div className="h-52 flex items-center justify-center text-xs text-[#666666]">
                      Chưa đóng kiện
                    </div>
                  )}
                </div>
              </div>

              {packagePhotos.length > 1 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {packagePhotos.slice(1).map((photoUrl, idx) => (
                    <a
                      key={idx}
                      href={photoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-[4px] border border-[#262626] overflow-hidden bg-[#0a0a0a] hover:border-[#666666] focus-visible:outline-white transition-colors"
                    >
                      <img
                        src={photoUrl}
                        alt={`Ảnh kiện ${idx + 2}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-28 object-cover"
                      />
                    </a>
                  ))}
                </div>
              ) : null}
            </div>

            {/* 3. Hàng hóa trong kiện */}
            <div className="rounded-[4px] border border-[#333333] bg-[#111111] p-6 space-y-3">
              <h3 className="text-base font-medium text-white">Chi tiết hàng hóa trong kiện</h3>
              {Array.isArray(data.items) && data.items.length > 0 ? (
                <ul className="divide-y divide-[#262626] text-sm">
                  {data.items.map((item, idx) => (
                    <li key={idx} className="py-2.5 flex justify-between items-center gap-4">
                      <span className="text-[#f1f2ee]">
                        {item.name || item.productName || item.sku || item.productId || "Sản phẩm"}
                      </span>
                      <span className="font-normal text-[#b0b0b0] tabular-nums shrink-0">
                        ×{item.quantity || item.qty || 1}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[#858585]">Đang cập nhật danh sách sản phẩm.</p>
              )}
            </div>

            {/* 4. Ô gửi ghi chú trực tiếp về xưởng */}
            <div className="rounded-[4px] border border-[#333333] bg-[#111111] p-6 space-y-4">
              <div>
                <h3 className="text-base font-medium text-white">
                  Gửi lời nhắn / Ghi chú trực tiếp cho xưởng
                </h3>
                <p className="text-xs text-[#b0b0b0] mt-1">
                  {data.hasPhone
                    ? "Đã xác thực qua SĐT đặt hàng. Tối đa 2 ghi chú chờ xử lý cùng lúc, giãn cách 3 phút/lần."
                    : "Để tránh nhầm đơn, vui lòng xác nhận Tên tài khoản đặt hàng hoặc 4 ký tự cuối Mã Vận Đơn trước khi gửi."}
                </p>
              </div>

              <form onSubmit={handleSendNote} className="space-y-3">
                {!data.hasPhone ? (
                  <div>
                    <input
                      type="text"
                      maxLength={80}
                      required
                      autoComplete="off"
                      placeholder="Xác thực: Tên tài khoản đặt hàng hoặc 4 ký tự cuối Mã Vận Đơn"
                      value={verifyToken}
                      onChange={(e) => setVerifyToken(e.target.value)}
                      className="w-full min-h-[42px] rounded-[3px] border border-[#333333] bg-[#0a0a0a] px-4 py-2 text-sm text-white placeholder:text-[#666666] focus:outline-none focus-visible:outline-none focus:border-white transition-colors"
                    />
                  </div>
                ) : null}

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    maxLength={500}
                    placeholder="VD: Nhờ xưởng bọc kỹ phần ngọn lũa hoặc giao giờ hành chính..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-1 min-h-[44px] rounded-[3px] border border-[#333333] bg-[#0a0a0a] px-4 py-2.5 text-sm text-white placeholder:text-[#666666] focus:outline-none focus-visible:outline-none focus:border-white transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={sendingNote || newNote.trim().length < 3 || (!data.hasPhone && !verifyToken.trim())}
                    className="button light shrink-0 focus-visible:!outline-white"
                  >
                    {sendingNote ? "Đang gửi..." : "Gửi ghi chú"}
                  </button>
                </div>
              </form>

              {noteStatus ? <p className="text-xs text-[#d4d4d4]">{noteStatus}</p> : null}

              {Array.isArray(data.customerNotes) && data.customerNotes.length > 0 ? (
                <div className="space-y-2 pt-2">
                  {data.customerNotes.map((n) => (
                    <div
                      key={n.id}
                      className="rounded-[3px] border border-[#262626] bg-[#0a0a0a] px-3.5 py-2.5 text-xs flex flex-wrap justify-between items-center gap-3"
                    >
                      <span className="text-[#f1f2ee]">"{n.content}"</span>
                      {n.isRead ? (
                        <span className="text-white font-medium whitespace-nowrap">
                          ✓ Xưởng đã xác nhận ({n.readBy || "Nhân viên"})
                        </span>
                      ) : (
                        <span className="text-[#858585] whitespace-nowrap">
                          Chờ xưởng xác nhận
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </section>

      <section className="wrap section" style={{ paddingTop: 0 }}>
        <div className="support-row">
          <div>
            <strong>Cần hỗ trợ thêm về đơn hàng?</strong>
            <p>Liên hệ trực tiếp xưởng RichFish qua Zalo để được phản hồi nhanh nhất.</p>
          </div>
          <a
            className="button focus-visible:!outline-white"
            href="https://zalo.me/1393615274620008533"
            target="_blank"
            rel="noreferrer"
          >
            Trao đổi qua Zalo ↗
          </a>
        </div>
      </section>
    </>
  );
}

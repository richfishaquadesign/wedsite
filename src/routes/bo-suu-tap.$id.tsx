import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useShop } from "@/lib/store";
import { resolveVaultVideoUrl, updatePageSeo } from "@/lib/vault-catalog";
import {
  findWorkByParam,
  loadWorks,
  mergeWorksWithLive,
  workImage,
  workPrice,
  type Work,
} from "@/lib/works";

export const Route = createFileRoute("/bo-suu-tap/$id")({
  component: WorkPage,
});

function WorkPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const saveLead = useShop((state) => state.saveLead);
  const live = useShop((state) => state.liveCatalog);
  const liveStatus = useShop((state) => state.connection.status);
  const [work, setWork] = useState<Work | null | undefined>(undefined);
  const [selectedSku, setSelectedSku] = useState<string>("");
  const [activeImg, setActiveImg] = useState<string>("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let alive = true;
    void loadWorks()
      .then((vaultItems) => {
        if (!alive) return;
        const merged = mergeWorksWithLive(vaultItems, live, liveStatus === "active") ?? vaultItems;
        const found = findWorkByParam(merged, id);
        setWork(found);
        if (found) {
          const target = id.trim().toLowerCase();
          const matchedVariant = found.variants?.find(
            (v) => v.seoSlug?.toLowerCase() === target || v.sku.toLowerCase() === target,
          );
          const initialVariant = matchedVariant ?? found.variants?.[0];
          setSelectedSku(initialVariant?.sku ?? found.sku);
          setActiveImg(workImage(found));
          updatePageSeo(
            initialVariant?.seoTitle || found.seoTitle || `${found.name} | RF Aquarium`,
            initialVariant?.metaDescription ||
              found.metaDescription ||
              `${found.name} — chế tác thủ công tại xưởng RF Aquarium.`,
          );
        }
      })
      .catch(() => {
        if (!alive) return;
        const fallback = mergeWorksWithLive(null, live, liveStatus === "active");
        const found = fallback ? findWorkByParam(fallback, id) : null;
        setWork(found);
        if (found) setSelectedSku(found.variants?.[0]?.sku ?? found.sku);
      });
    return () => {
      alive = false;
    };
  }, [id, live, liveStatus]);

  if (work === undefined) {
    return (
      <section className="wrap section">
        <p className="empty-state">Đang mở tác phẩm…</p>
      </section>
    );
  }

  if (!work) {
    return (
      <section className="wrap section">
        <h1>Không thấy tác phẩm này</h1>
        <p className="empty-state">Mã {id} không nằm trong bộ sưu tập đang mở.</p>
        <Link to="/bo-suu-tap" className="button">
          ← Bộ sưu tập
        </Link>
      </section>
    );
  }

  const variants = work.variants ?? [];
  const activeVariant =
    variants.find((v) => v.sku === selectedSku) ?? variants[0] ?? null;
  const activeSku = activeVariant?.sku ?? work.sku;
  const activePrice = activeVariant ? activeVariant.price : work.price;
  const activeDimensions = activeVariant?.dimensions ?? work.dimensions;
  const activePkgDims = activeVariant?.packageDimensionsCm ?? work.packageDimensionsCm;
  const activePkgWeight = activeVariant?.packageWeightG ?? work.packageWeightG;
  const activeStock = activeVariant?.stock ?? work.stock;

  const gallery = work.images && work.images.length > 0 ? work.images : [workImage(work)];
  const mainImage = activeImg && gallery.includes(activeImg) ? activeImg : gallery[0];
  const videoUrls = (work.videos ?? [])
    .map((v) => resolveVaultVideoUrl(v))
    .filter((v): v is string => Boolean(v));

  return (
    <article className="wrap article-body">
      <p>
        <Link to="/bo-suu-tap">← Bộ sưu tập</Link>
      </p>
      <img src={mainImage} alt={work.name} />
      {gallery.length > 1 ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
          {gallery.map((src, idx) => (
            <button
              key={src}
              type="button"
              onClick={() => setActiveImg(src)}
              style={{
                padding: 0,
                border: src === mainImage ? "2px solid #000" : "1px solid #d4d4d4",
                background: "transparent",
                cursor: "pointer",
              }}
              aria-label={`Xem ảnh ${idx + 1}`}
            >
              <img
                src={src}
                alt={`${work.name} - góc ${idx + 1}`}
                style={{ width: 72, height: 72, objectFit: "cover", display: "block" }}
              />
            </button>
          ))}
        </div>
      ) : null}
      {videoUrls.length > 0 ? (
        <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
          {videoUrls.map((vUrl) => (
            <video
              key={vUrl}
              src={vUrl}
              controls
              playsInline
              preload="metadata"
              style={{ width: "100%", maxHeight: 460, background: "#000" }}
            />
          ))}
        </div>
      ) : null}
      <h1>{work.name}</h1>
      <p>
        {activeSku} · {work.category}
        {activeDimensions ? ` · Kích thước: ${activeDimensions} cm` : ""}
        {activeStock != null ? ` · Tồn kho: ${activeStock}` : ""}
      </p>
      {variants.length > 1 ? (
        <div style={{ margin: "16px 0" }}>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Chọn kích thước:</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {variants.map((v) => {
              const selected = v.sku === activeSku;
              return (
                <button
                  key={v.sku}
                  type="button"
                  onClick={() => {
                    setSelectedSku(v.sku);
                    updatePageSeo(
                      v.seoTitle || `${work.name} — ${v.label} | RF Aquarium`,
                      v.metaDescription || work.metaDescription || "",
                    );
                  }}
                  style={{
                    padding: "8px 14px",
                    border: selected ? "2px solid #000" : "1px solid #d4d4d4",
                    background: selected ? "#000" : "#fff",
                    color: selected ? "#fff" : "#111",
                    fontSize: 14,
                    fontWeight: selected ? 600 : 400,
                    cursor: "pointer",
                  }}
                >
                  {v.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
      {activePkgDims || activePkgWeight ? (
        <p style={{ fontSize: 14, color: "#555" }}>
          Đóng gói: {activePkgDims ? `${activePkgDims} cm` : ""}
          {activePkgDims && activePkgWeight ? " · " : ""}
          {activePkgWeight ? `${activePkgWeight}g` : ""}
        </p>
      ) : null}
      <p style={{ whiteSpace: "pre-line" }}>{work.description || "Tác phẩm chế tác tại xưởng RF."}</p>
      <p style={{ fontSize: 22, fontWeight: 700 }}>{workPrice(activePrice)}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, margin: "20px 0" }}>
        <a className="button primary" href="tel:0877445526">
          Trao đổi với RF →
        </a>
        <a className="button" href="https://zalo.me/1393615274620008533" target="_blank" rel="noreferrer">
          Nhắn Zalo ↗
        </a>
      </div>
      <h2>Gửi yêu cầu về xưởng</h2>
      <p>Phiếu vào hộp đơn trên web và được đẩy sang RF Workspace Pro khi kho đã nối.</p>
      <form
        className="tracking-form"
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
          setPending(true);
          void saveLead({
            customerName: name,
            phone: normalized,
            email: "",
            address: "",
            note: note || `Quan tâm ${work.name}${activeVariant ? ` (${activeVariant.label})` : ""}`,
            fulfillment: "nhan-xuong",
            line: {
              sku: activeSku,
              name: activeVariant ? `${work.name} — ${activeVariant.label}` : work.name,
              unitPrice: activePrice ?? 0,
            },
          })
            .then((order) => {
              void navigate({ to: "/theo-doi-don-hang", search: { ma: order.id } });
            })
            .catch((reason: unknown) => {
              setError(reason instanceof Error ? reason.message : "Không gửi được yêu cầu.");
              setPending(false);
            });
        }}
      >
        <label htmlFor="lead-name">Họ tên</label>
        <input id="lead-name" value={name} onChange={(event) => setName(event.target.value)} required />
        <label htmlFor="lead-phone">Điện thoại</label>
        <input id="lead-phone" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} required />
        <label htmlFor="lead-note">Ghi chú</label>
        <input id="lead-note" value={note} onChange={(event) => setNote(event.target.value)} />
        {error ? (
          <p role="alert" className="status-message">
            {error}
          </p>
        ) : null}
        <button className="button primary" type="submit" disabled={pending}>
          {pending ? "Đang gửi…" : "Gửi yêu cầu →"}
        </button>
      </form>
    </article>
  );
}

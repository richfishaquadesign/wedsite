import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useShop } from "@/lib/store";
import {
  COLLECTION_CATEGORIES,
  loadWorks,
  mergeWorksWithLive,
  workImage,
  workPrice,
  type Work,
} from "@/lib/works";

export const Route = createFileRoute("/bo-suu-tap/")({
  component: CollectionPage,
});

const PAGE_SIZE = 24;

function CollectionPage() {
  const live = useShop((state) => state.liveCatalog);
  const status = useShop((state) => state.connection.status);
  const [works, setWorks] = useState<Work[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let alive = true;
    void loadWorks()
      .then((items) => {
        if (alive) setWorks(items);
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const source = useMemo(
    () => mergeWorksWithLive(works, live, status === "active"),
    [works, live, status],
  );
  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("vi");
    return (source ?? []).filter((item) => {
      if (category !== "Tất cả" && item.category !== category) return false;
      if (!q) return true;
      return `${item.name} ${item.sku}`.toLocaleLowerCase("vi").includes(q);
    });
  }, [source, query, category]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const slice = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <>
      <section className="page-hero">
        <img src="/images/brand/rf-limited-black.jpg" alt="Bộ sưu tập thủ công RF" />
        <div className="wrap">
          <p className="eyebrow">RF COLLECTION</p>
          <h1>Bộ sưu tập</h1>
          <p>Một bố cục. Nhiều cách để nhìn thiên nhiên.</p>
        </div>
      </section>
      <section className="wrap section">
        <div className="filter-bar">
          <label className="filter-select">
            Danh mục{" "}
            <select
              aria-label="Danh mục"
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                setPage(1);
              }}
            >
              {COLLECTION_CATEGORIES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label htmlFor="catalog-search">Tìm sản phẩm</label>
          <input
            id="catalog-search"
            aria-label="Tìm layout"
            placeholder="Tên tác phẩm hoặc mã sản phẩm…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
        </div>
        <p className="catalog-count" role="status">
          {failed
            ? "Không tải được bộ lọc. Vui lòng tải lại trang."
            : source
              ? `${filtered.length} sản phẩm${pages > 1 ? ` · Trang ${current}/${pages}` : ""}${
                  status === "active" && live ? " · đang đọc kho RF Workspace Pro" : ""
                }`
              : "Đang tải bộ sưu tập…"}
        </p>
        <div className="catalog-grid grid-three">
          {source && slice.length === 0 ? <p>Chưa có sản phẩm phù hợp với tìm kiếm.</p> : null}
          {slice.map((item) => (
            <Link key={item.sku || item.id} to="/bo-suu-tap/$id" params={{ id: item.seoSlug || item.id }} className="work">
              <div className="image-wrap">
                <img src={workImage(item, true)} alt={item.name} width={480} height={480} />
              </div>
              <div className="work-caption">
                <h3>{item.name}</h3>
                <span>{workPrice(item.price, item.maxPrice)}</span>
              </div>
              <p className="product-category">
                {item.category}
                {item.variants && item.variants.length > 1
                  ? ` · ${item.variants.length} kích thước`
                  : ""}
              </p>
            </Link>
          ))}
        </div>
        {pages > 1 ? (
          <nav className="pagination" aria-label="Phân trang sản phẩm">
            <button className="button" type="button" disabled={current === 1} onClick={() => setPage(current - 1)}>
              Trang trước
            </button>
            <span>
              {current} / {pages}
            </span>
            <button className="button" type="button" disabled={current === pages} onClick={() => setPage(current + 1)}>
              Trang sau
            </button>
          </nav>
        ) : null}
      </section>
    </>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useArticles } from "@/lib/journal";

export const Route = createFileRoute("/bai-viet/")({
  component: JournalPage,
});

function JournalPage() {
  const articles = useArticles();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const categories = useMemo(() => {
    const names = new Set((articles ?? []).map((article) => article.category));
    return ["Tất cả", ...names];
  }, [articles]);
  const items = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("vi");
    return (articles ?? []).filter((article) => {
      if (category !== "Tất cả" && article.category !== category) return false;
      if (!q) return true;
      return `${article.title} ${article.lede} ${article.category}`.toLocaleLowerCase("vi").includes(q);
    });
  }, [articles, query, category]);

  return (
    <>
      <section className="page-hero">
        <img src="/images/rf/workbench.png" alt="Góc chế tác tại xưởng RF" />
        <div className="wrap">
          <p className="eyebrow">KIẾN THỨC · CẢM HỨNG · KINH NGHIỆM</p>
          <h1>Blog Thủy Sinh</h1>
          <p>Để bạn kiến tạo thế giới riêng của mình.</p>
        </div>
      </section>
      <section className="wrap section">
        <form className="article-category-filter" onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="article-category">Danh mục bài viết</label>
          <select id="article-category" value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </form>
        <div className="filter-bar">
          <label htmlFor="article-search">Tìm bài viết</label>
          <input
            id="article-search"
            type="search"
            placeholder="Tìm theo tiêu đề hoặc nội dung…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <p className="catalog-count" role="status">
          {articles ? `${items.length} bài viết` : "Đang tải bài viết…"}
        </p>
        <div className="grid-three">
          {items.map((article) => (
            <Link key={article.slug} to="/bai-viet/$slug" params={{ slug: article.slug }} className="card">
              <img src={article.image} alt={article.title} />
              <div className="card-copy">
                <p className="eyebrow">{article.category}</p>
                <h3>{article.title}</h3>
                <p>{article.lede}</p>
                <p className="eyebrow">ĐỌC CÂU CHUYỆN →</p>
              </div>
            </Link>
          ))}
        </div>
        {articles && items.length === 0 ? (
          <p className="empty-state" role="status">
            Chưa có bài viết phù hợp.
          </p>
        ) : null}
      </section>
    </>
  );
}

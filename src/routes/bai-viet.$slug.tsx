import { createFileRoute, Link } from "@tanstack/react-router";
import { useArticles } from "@/lib/journal";

export const Route = createFileRoute("/bai-viet/$slug")({
  component: ArticlePage,
});

function ArticlePage() {
  const { slug } = Route.useParams();
  const articles = useArticles();
  const article = articles?.find((item) => item.slug === slug);

  if (!articles) {
    return (
      <section className="wrap section">
        <p className="empty-state">Đang mở bài viết…</p>
      </section>
    );
  }

  if (!article) {
    return (
      <section className="wrap section">
        <h1>Không thấy bài viết</h1>
        <Link to="/bai-viet" className="button">
          ← Blog Thủy Sinh
        </Link>
      </section>
    );
  }

  return (
    <article className="wrap article-body">
      <p>
        <Link to="/bai-viet">← Blog Thủy Sinh</Link>
      </p>
      <p className="eyebrow">{article.category}</p>
      <h1>{article.title}</h1>
      <img src={article.image} alt={article.title} />
      <div className="article-html" dangerouslySetInnerHTML={{ __html: article.html }} />
    </article>
  );
}

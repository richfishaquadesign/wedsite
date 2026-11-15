import { createFileRoute, Link } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { useArticles } from "@/lib/journal";
import {
  DEFAULT_THEME_CONFIG,
  fetchRemoteThemeConfig,
  loadThemeConfig,
  type ThemeConfig,
} from "@/lib/theme-config";

export const Route = createFileRoute("/")({
  loader: async () => await fetchRemoteThemeConfig(),
  component: Home,
});

function useLiveThemeConfig(initialRemote: ThemeConfig | null) {
  const [theme, setTheme] = useState<ThemeConfig>(() => initialRemote ?? DEFAULT_THEME_CONFIG);

  useEffect(() => {
    const isPreview = new URLSearchParams(window.location.search).get("preview") === "1";
    if (isPreview) {
      setTheme(loadThemeConfig());
    } else {
      void fetchRemoteThemeConfig().then((remote) => {
        if (remote) setTheme(remote);
        else if (!initialRemote) setTheme(loadThemeConfig());
      });
    }

    const onUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<ThemeConfig>;
      if (customEvent.detail) setTheme(customEvent.detail);
      else setTheme(loadThemeConfig());
    };

    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === "rf-customizer-theme-v2") {
        setTheme(loadThemeConfig());
      }
    };

    const onMessage = (e: MessageEvent) => {
      if (e.origin === window.location.origin && e.data?.type === "rf-theme-preview" && e.data.config) {
        setTheme(e.data.config as ThemeConfig);
      }
    };

    window.addEventListener("rf-theme-updated", onUpdated);
    window.addEventListener("storage", onStorage);
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("rf-theme-updated", onUpdated);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("message", onMessage);
    };
  }, [initialRemote]);

  return theme;
}

function Home() {
  const initialRemote = Route.useLoaderData();
  const articles = useArticles();
  const theme = useLiveThemeConfig(initialRemote);
  const featured = (articles ?? []).slice(0, 3);

  return (
    <div style={{ fontFamily: theme.fontFamily }}>
      {theme.topBanner.enabled && (
        <a
          href={theme.topBanner.link || "tel:0877445526"}
          className="block py-2 px-4 text-center text-xs font-semibold tracking-wide border-b border-white/10 transition hover:brightness-110"
          style={{
            backgroundColor: theme.topBanner.bgColor,
            color: theme.accentColor,
          }}
        >
          {theme.topBanner.text}
        </a>
      )}

      {/* Hero Desktop */}
      <section
        className="hero-art hero-photo single"
        aria-label={theme.hero.heading.replace(/\n/g, " ")}
      >
        <img
          src={theme.hero.image}
          alt={theme.hero.heading.replace(/\n/g, " ")}
          width={2048}
          height={768}
        />
        <div className="hero-desktop-copy hero-copy">
          <p className="eyebrow" style={{ color: theme.accentColor }}>
            {theme.hero.eyebrow}
          </p>
          <h1 style={{ whiteSpace: "pre-line" }}>{theme.hero.heading}</h1>
          <p style={{ whiteSpace: "pre-line" }}>{theme.hero.description}</p>
          <Link
            to={(theme.hero.buttonLink || "/bo-suu-tap") as "/bo-suu-tap"}
            className="button"
            style={{ borderColor: theme.accentColor }}
          >
            {theme.hero.buttonText}
          </Link>
        </div>
        <p className="rf-hero-caption">{theme.hero.caption}</p>
      </section>

      {/* Hero Mobile */}
      <section
        className="hero-mobile"
        style={{ "--rf-hero-image": `url("${theme.hero.image}")` } as CSSProperties}
      >
        <div className="wrap hero-copy">
          <p className="eyebrow" style={{ color: theme.accentColor }}>
            {theme.hero.eyebrow}
          </p>
          <h1 style={{ whiteSpace: "pre-line" }}>{theme.hero.heading}</h1>
          <p style={{ whiteSpace: "pre-line" }}>{theme.hero.description}</p>
          <Link
            to={(theme.hero.buttonLink || "/bo-suu-tap") as "/bo-suu-tap"}
            className="button light"
          >
            {theme.hero.buttonText}
          </Link>
          <p className="rf-hero-caption">{theme.hero.caption}</p>
        </div>
      </section>

      {/* Nhóm hàng hoá (Categories) */}
      {theme.categories.enabled && (
        <section className="wrap section">
          <div className="section-heading">
            <div>
              <h2>{theme.categories.title}</h2>
              <p>{theme.categories.subtitle}</p>
            </div>
            <Link to="/bo-suu-tap" style={{ color: theme.accentColor }}>
              Xem tất cả →
            </Link>
          </div>
          <div className="grid-three">
            {theme.categories.items.map((cat) => (
              <Link
                key={cat.id}
                to={(cat.link || "/bo-suu-tap") as "/bo-suu-tap"}
                className="card"
              >
                <img src={cat.image} alt={cat.name} />
                <div className="card-copy">
                  <h3>{cat.name}</h3>
                  <p>{cat.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Sàn TMĐT & Mạng xã hội */}
      {theme.ecommerceChannels.enabled && (
        <section className="wrap section" style={{ paddingTop: 0 }}>
          <div className="section-heading" style={{ marginBottom: "16px" }}>
            <div>
              <p className="eyebrow" style={{ color: theme.accentColor }}>
                MUA SẮM CHÍNH HÃNG
              </p>
              <h2>{theme.ecommerceChannels.title}</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <a
              href={theme.ecommerceChannels.shopeeUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-[#ee4d2d] text-white p-4 rounded-lg flex flex-col items-center justify-center text-center shadow transition hover:opacity-95"
            >
              <span className="text-2xl mb-1">🛍️</span>
              <strong className="text-sm">Shopee Mall</strong>
              <small className="text-white/80 text-xs">Richfish Aquarium</small>
            </a>
            <a
              href={theme.ecommerceChannels.pinterestUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-[#bd081c] text-white p-4 rounded-lg flex flex-col items-center justify-center text-center shadow transition hover:opacity-95"
            >
              <span className="text-2xl mb-1">📌</span>
              <strong className="text-sm">Pinterest</strong>
              <small className="text-white/80 text-xs">Bộ sưu tập Layout</small>
            </a>
            <a
              href={theme.ecommerceChannels.tiktokUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-[#050505] border border-white/20 text-white p-4 rounded-lg flex flex-col items-center justify-center text-center shadow transition hover:border-[#00b8c4]"
            >
              <span className="text-2xl mb-1">🎵</span>
              <strong className="text-sm">TikTok Shop</strong>
              <small className="text-white/80 text-xs">Live & Video xưởng</small>
            </a>
            <a
              href={theme.ecommerceChannels.zaloUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-[#0068ff] text-white p-4 rounded-lg flex flex-col items-center justify-center text-center shadow transition hover:opacity-95"
            >
              <span className="text-2xl mb-1">💬</span>
              <strong className="text-sm">Zalo OA</strong>
              <small className="text-white/80 text-xs">Tư vấn báo giá trực tiếp</small>
            </a>
          </div>
        </section>
      )}

      {/* Feature Banners */}
      {theme.featureBanners.enabled && (
        <div className="feature-banners">
          <Link
            to={(theme.featureBanners.banner1.link || "/bo-suu-tap") as "/bo-suu-tap"}
            className="banner-crop single"
            aria-label="Khám phá Dragon Collection"
          >
            <img src={theme.featureBanners.banner1.image} alt="Linh Thú." />
            <div className="creatures-copy banner-copy">
              <p className="eyebrow" style={{ color: theme.accentColor }}>
                {theme.featureBanners.banner1.tag}
              </p>
              <h2>{theme.featureBanners.banner1.title}</h2>
              <p>{theme.featureBanners.banner1.subtitle}</p>
              <span className="button" style={{ borderColor: theme.accentColor }}>
                {theme.featureBanners.banner1.buttonText}
              </span>
            </div>
          </Link>
          <Link
            to={(theme.featureBanners.banner2.link || "/bo-suu-tap") as "/bo-suu-tap"}
            className="banner-crop glass single"
            aria-label="Xem các mẫu bể kính"
          >
            <img src={theme.featureBanners.banner2.image} alt="Banner thương hiệu RF" />
          </Link>
        </div>
      )}

      {/* Story / Craftsmanship */}
      {theme.story.enabled && (
        <section className="wrap section">
          <div className="craft-feature">
            <img src={theme.story.image} alt={theme.story.title.replace(/\n/g, " ")} />
            <div className="craft-copy studio-copy">
              <span className="eyebrow" style={{ color: theme.accentColor }}>
                {theme.story.eyebrow}
              </span>
              <h2 style={{ whiteSpace: "pre-line" }}>{theme.story.title}</h2>
              <p style={{ whiteSpace: "pre-line" }}>{theme.story.content}</p>
              <Link
                to={(theme.story.buttonLink || "/ve-chung-toi") as "/ve-chung-toi"}
                className="button"
                style={{ borderColor: theme.accentColor }}
              >
                {theme.story.buttonText}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Gallery Showcase */}
      {theme.gallery.enabled && (
        <section className="wrap section" style={{ paddingTop: 0 }}>
          <div className="section-heading">
            <div>
              <h2>{theme.gallery.title}</h2>
              <p>{theme.gallery.subtitle}</p>
            </div>
            <Link to="/bo-suu-tap" style={{ color: theme.accentColor }}>
              Khám phá →
            </Link>
          </div>
          <figure className="rf-divider">
            <img src={theme.gallery.bannerImage} alt={theme.gallery.title} />
          </figure>
          <div className="grid-three">
            {theme.gallery.images.map((imgUrl, idx) => (
              <Link key={idx} to="/bo-suu-tap" className="card">
                <img src={imgUrl} alt={`Tác phẩm ${idx + 1}`} />
                <div className="card-copy">
                  <h3>Tác phẩm xưởng RF #{idx + 1}</h3>
                  <p>Bố cục nghệ thuật thủ công nguyên khối.</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Tracking Strip */}
      <section className="wrap">
        <div className="tracking-strip">
          <div>
            <h2>Theo dõi tác phẩm của bạn</h2>
            <p>Trao đổi với RF về tiến độ và hình ảnh chế tác theo thời gian thực.</p>
          </div>
          <Link to="/theo-doi-don-hang" className="button primary">
            Theo dõi đơn hàng →
          </Link>
        </div>
      </section>

      {/* Blog Góc Thủy Sinh */}
      <section className="wrap section">
        <div className="section-heading">
          <div>
            <h2>Góc thủy sinh.</h2>
            <p>Kiến thức, cảm hứng và những câu chuyện từ xưởng.</p>
          </div>
          <Link to="/bai-viet" style={{ color: theme.accentColor }}>
            Xem tất cả →
          </Link>
        </div>
        <div className="grid-three">
          {featured.map((article) => (
            <Link
              key={article.slug}
              to="/bai-viet/$slug"
              params={{ slug: article.slug }}
              className="card"
            >
              <img src={article.image} alt={article.title} />
              <div className="card-copy">
                <h3>{article.title}</h3>
                <p>{article.lede}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="rf-crafted wrap section">
        <div className="story-row">
          <div>
            <span className="eyebrow">CRAFTED IN VIETNAM</span>
            <h2 style={{ whiteSpace: "pre-line" }}>{"CRAFTED IN\nVIETNAM"}</h2>
            <p className="rf-crafted-message" style={{ whiteSpace: "pre-line" }}>
              {"Made by hand.\nShaped by nature."}
            </p>
          </div>
          <figure className="rf-crafted-photo">
            <img src="/images/rf/workbench.png" alt="CRAFTED IN VIETNAM" />
          </figure>
        </div>
      </section>

      {/* Values & Consultation */}
      <section className="wrap section">
        <div className="tracking-strip">
          <div>
            <p className="eyebrow" style={{ color: theme.accentColor }}>
              BẠN ĐANG HÌNH DUNG MỘT BỂ THỦY SINH?
            </p>
            <h2 style={{ whiteSpace: "pre-line" }}>{"Cùng tạo nên\ngóc thiên nhiên của bạn."}</h2>
          </div>
          <a
            className="button"
            href={`tel:${theme.footer.hotline.replace(/\s+/g, "")}`}
            style={{ borderColor: theme.accentColor }}
          >
            Trao đổi với RF: {theme.footer.hotline} →
          </a>
        </div>
        {theme.values.enabled && (
          <div className="values">
            {theme.values.items.map((val, idx) => (
              <span key={idx}>{val}</span>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

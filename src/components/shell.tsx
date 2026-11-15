import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { loadAdminSettings, type AdminSettings } from "@/lib/journal";
import { hydrateShop } from "@/lib/store";

const NAV = [
  { href: "/", label: "Trang chủ" },
  { href: "/bo-suu-tap", label: "Bộ sưu tập" },
  { href: "/bai-viet", label: "Blog Thủy Sinh" },
  { href: "/ve-chung-toi", label: "Về chúng tôi" },
  { href: "/theo-doi-don-hang", label: "Theo dõi đơn hàng" },
] as const;

function isCurrent(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<AdminSettings | null>(null);

  useEffect(() => {
    void hydrateShop();
    setSettings(loadAdminSettings());
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <a className="skip-link" href="#main">
        Đến nội dung
      </a>
      <header className="site-header">
        <div className="wrap header-inner">
          <Link to="/" className="brand" aria-label={`${settings?.siteTitle ?? "RF Aqua Design"} trang chủ`}>
            <img src="/images/rf/logo.png" alt="Logo RF gốc" width={78} height={64} />
            <span>
              AQUA
              <br />
              DESIGN
            </span>
          </Link>
          <nav className={open ? "main-nav open" : "main-nav"} id="main-navigation" aria-label="Điều hướng chính">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} aria-current={isCurrent(pathname, item.href) ? "page" : undefined}>
                {item.label}
              </a>
            ))}
          </nav>
          <a className="header-contact" href="tel:0877445526">
            087 744 5526
          </a>
          <button
            className="menu-button"
            type="button"
            aria-expanded={open}
            aria-controls="main-navigation"
            aria-label={open ? "Đóng menu" : "Mở menu"}
            onClick={() => setOpen((value) => !value)}
          >
            ☰
          </button>
        </div>
      </header>
      <main id="main">{children}</main>
      <footer className="site-footer">
        <div className="wrap">
          <div className="footer-row">
            <Link to="/" className="brand" aria-label={`${settings?.siteTitle ?? "RF Aqua Design"} trang chủ`}>
              <img src="/images/rf/logo.png" width={78} height={64} alt="Logo RF gốc" />
              <span>
                AQUA
                <br />
                DESIGN
              </span>
            </Link>
            <div className="footer-links">
              <Link to="/bo-suu-tap">Bộ sưu tập</Link>
              <Link to="/bai-viet">Blog Thủy Sinh</Link>
              <Link to="/ve-chung-toi">Về chúng tôi</Link>
              <Link to="/ho-tro">Hướng dẫn & hỗ trợ</Link>
            </div>
            <div className="footer-links">
              <a href="https://www.facebook.com/richfishaquarium" target="_blank" rel="noreferrer">
                Facebook ↗
              </a>
              <a href="https://zalo.me/1393615274620008533" target="_blank" rel="noreferrer">
                Zalo ↗
              </a>
              <Link to="/workspace">Hộp đơn</Link>
              <Link to="/ket-noi">Nối kho</Link>
              <Link to="/quan-tri">Quản trị</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Richfish Aquarium · Aquascape, handcrafted in Vietnam.</span>
            <span>
              <a href="tel:0877445526">087 744 5526</a>
              {" · "}
              <a href="mailto:richfishaquarium@gmail.com">richfishaquarium@gmail.com</a>
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}

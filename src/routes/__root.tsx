import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { Shell } from "@/components/shell";
import { AuthProvider } from "@/lib/auth/provider";
import appCss from "../styles.css?url";

function ShopScript() {
  useEffect(() => {
    if (document.querySelector('script[src="/rf-shop.js"]')) return;
    const script = document.createElement("script");
    script.src = "/rf-shop.js";
    document.body.append(script);
  }, []);
  return null;
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "RF Aqua Design" },
      {
        name: "description",
        content:
          "Một khoảng thiên nhiên. Một dấu ấn riêng. RF Aqua Design — chế tác bố cục thủy sinh thủ công.",
      },
      { name: "theme-color", content: "#000000" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap",
      },
      { rel: "icon", type: "image/png", href: "/images/rf/logo.png" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: () => (
    <html lang="vi" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <Shell>
            <Outlet />
          </Shell>
        </AuthProvider>
        <Toaster theme="light" position="bottom-right" />
        <Scripts />
        <ShopScript />
      </body>
    </html>
  ),
});

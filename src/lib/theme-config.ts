import { key as SUPABASE_KEY, url as SUPABASE_URL } from "@/utils/supabase/config";

export interface ThemeConfig {
  version: number;
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  themeMode: "dark" | "light";

  topBanner: {
    enabled: boolean;
    text: string;
    link: string;
    bgColor: string;
    textColor: string;
  };

  header: {
    showHotline: boolean;
    hotline: string;
    showCart: boolean;
  };

  hero: {
    enabled: boolean;
    eyebrow: string;
    heading: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    caption: string;
    image: string;
  };

  categories: {
    enabled: boolean;
    title: string;
    subtitle: string;
    items: Array<{
      id: string;
      name: string;
      subtitle: string;
      image: string;
      link: string;
    }>;
  };

  featureBanners: {
    enabled: boolean;
    banner1: {
      tag: string;
      title: string;
      subtitle: string;
      buttonText: string;
      image: string;
      link: string;
    };
    banner2: {
      image: string;
      link: string;
    };
  };

  ecommerceChannels: {
    enabled: boolean;
    title: string;
    shopeeUrl: string;
    tiktokUrl: string;
    zaloUrl: string;
    pinterestUrl: string;
    shopeeImage: string;
    pinterestImage: string;
    tiktokImage: string;
    zaloImage: string;
  };

  story: {
    enabled: boolean;
    eyebrow: string;
    title: string;
    content: string;
    buttonText: string;
    buttonLink: string;
    image: string;
  };

  gallery: {
    enabled: boolean;
    title: string;
    subtitle: string;
    bannerImage: string;
    images: string[];
  };

  values: {
    enabled: boolean;
    items: string[];
  };

  footer: {
    aboutText: string;
    hotline: string;
    email: string;
    facebookUrl: string;
    zaloUrl: string;
  };

  blocksOrder: string[];
}

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  version: 2,
  primaryColor: "#050505",
  accentColor: "#00b8c4",
  fontFamily: "Be Vietnam Pro",
  themeMode: "dark",

  topBanner: {
    enabled: true,
    text: "🔥 Ưu đãi xưởng: Miễn phí giao hàng & đóng kiện gỗ toàn quốc cho Layout nghệ thuật nguyên khối · Hotline 087 744 5526",
    link: "tel:0877445526",
    bgColor: "#09120e",
    textColor: "#00b8c4",
  },

  header: {
    showHotline: true,
    hotline: "087 744 5526",
    showCart: true,
  },

  hero: {
    enabled: true,
    eyebrow: "RF AQUARIUM · CHẾ TÁC BỐ CỤC THỦ CÔNG",
    heading: "Một khoảng\nthiên nhiên.\nMột dấu ấn riêng.",
    description: "Đá, lũa và những khoảng trống.\nChúng tôi bắt đầu một thế giới nhỏ từ những điều giản dị.",
    buttonText: "Khám phá tác phẩm →",
    buttonLink: "/bo-suu-tap",
    caption: "TỪ XƯỞNG RF · Chế tác bố cục thủ công",
    image: "/images/source/home-2.webp",
  },

  categories: {
    enabled: true,
    title: "Bộ sưu tập",
    subtitle: "Những thế giới được kiến tạo từ lũa, đá và đôi tay nghệ nhân.",
    items: [
      {
        id: "layout",
        name: "Layout nghệ thuật",
        subtitle: "Một dấu ấn riêng cho không gian của bạn.",
        image: "/images/black-covers/206ad339dd424e6d79b7.jpg",
        link: "/bo-suu-tap",
      },
      {
        id: "limited",
        name: "Bộ sưu tập LIMITED",
        subtitle: "Hình dáng tự nhiên. Chế tác thủ công.",
        image: "/images/brand/rf-dragon.jpg",
        link: "/bo-suu-tap",
      },
      {
        id: "tank",
        name: "Bể kính thủy sinh",
        subtitle: "Tối giản trong từng đường kính tử diện.",
        image: "/images/catalog/09bff2524b8b27b88228.webp",
        link: "/bo-suu-tap",
      },
    ],
  },

  featureBanners: {
    enabled: true,
    banner1: {
      tag: "LIMITED / DRAGON COLLECTION",
      title: "Linh Thú.",
      subtitle: "Những hình dáng khác của lũa tự nhiên.",
      buttonText: "Khám phá bộ sưu tập →",
      image: "/images/brand/rf-dragon.jpg",
      link: "/bo-suu-tap",
    },
    banner2: {
      image: "/images/brand/rf-brand.jpg",
      link: "/bo-suu-tap",
    },
  },

  ecommerceChannels: {
    enabled: true,
    title: "Kênh mua sắm & Mạng xã hội",
    shopeeUrl: "https://shopee.vn",
    tiktokUrl: "https://tiktok.com",
    zaloUrl: "https://zalo.me/1393615274620008533",
    pinterestUrl: "https://pinterest.com",
    shopeeImage:
      "https://cdn-kvweb.citigo.net/merchant/63f2bd09e2d1172661bb241e25289076/cropped/1773992465/banner-phu-1.webp",
    pinterestImage:
      "https://cdn-kvweb.citigo.net/merchant/63f2bd09e2d1172661bb241e25289076/cropped/1773992560/banner-phu-2.webp",
    tiktokImage:
      "https://cdn-kvweb.citigo.net/merchant/63f2bd09e2d1172661bb241e25289076/cropped/1773992590/banner-phu-3.webp",
    zaloImage: "",
  },

  story: {
    enabled: true,
    eyebrow: "TỪ XƯỞNG RF",
    title: "Thiên nhiên không cần\nthêm điều gì quá lớn.",
    content: "Chỉ cần một góc nhìn mới. Một nhánh lũa, một đường đá, một khoảng nước — mỗi bố cục mở ra một cách khác để mang thiên nhiên vào cuộc sống.\n\nTại RF, hãy bắt đầu bằng hình dáng bạn thích và không gian bạn có. Chúng tôi cùng bạn tìm một bố cục phù hợp.",
    buttonText: "Xem câu chuyện của chúng tôi →",
    buttonLink: "/ve-chung-toi",
    image: "/images/rf/craft.png",
  },

  gallery: {
    enabled: true,
    title: "Từ xưởng RF.",
    subtitle: "Lũa, đá và những khoảng trống.",
    bannerImage: "/images/brand/rf-limited-black.jpg",
    images: [
      "/images/source/biotop.webp",
      "/images/black-covers/52f9478c73483e3553e0.jpg",
      "/images/black-covers/231beab5e3edede7cb86.jpg",
    ],
  },

  values: {
    enabled: true,
    items: [
      "Chế tác thủ công",
      "Vật liệu tự nhiên",
      "Chăm chút từng chi tiết",
      "Từ xưởng RF",
    ],
  },

  footer: {
    aboutText: "Aquascape, handcrafted in Vietnam. Mang thiên nhiên nguyên bản vào không gian sống của bạn.",
    hotline: "087 744 5526",
    email: "richfishaquarium@gmail.com",
    facebookUrl: "https://www.facebook.com/richfishaquarium",
    zaloUrl: "https://zalo.me/1393615274620008533",
  },

  blocksOrder: [
    "topBanner",
    "header",
    "hero",
    "categories",
    "ecommerceChannels",
    "featureBanners",
    "story",
    "gallery",
    "values",
    "footer",
  ],
};

const THEME_STORAGE_KEY = "rf-customizer-theme-v2";

function mergeThemeValue(defaultValue: unknown, value: unknown): unknown {
  if (Array.isArray(defaultValue)) {
    if (!Array.isArray(value)) return defaultValue;
    return value.filter(item => item != null && typeof item === typeof defaultValue[0])
      .map(item => mergeThemeValue(defaultValue[0], item));
  }
  if (defaultValue && typeof defaultValue === "object") {
    const source = value && typeof value === "object" && !Array.isArray(value)
      ? value as Record<string, unknown> : {};
    return Object.fromEntries(Object.entries(defaultValue).map(([key, fallback]) =>
      [key, mergeThemeValue(fallback, source[key])]));
  }
  return typeof value === typeof defaultValue ? value : defaultValue;
}

function normalizeTheme(value: unknown): ThemeConfig {
  return mergeThemeValue(DEFAULT_THEME_CONFIG, value) as ThemeConfig;
}

export function loadThemeConfig(): ThemeConfig {
  if (typeof window === "undefined") return DEFAULT_THEME_CONFIG;
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) return DEFAULT_THEME_CONFIG;
    return normalizeTheme(JSON.parse(raw));
  } catch {
    return DEFAULT_THEME_CONFIG;
  }
}

export function saveThemeConfig(config: ThemeConfig) {
  if (typeof window === "undefined") return;
  localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(config));
  // Dispatch custom event for real-time live preview synchronization across iframes / tabs
  window.dispatchEvent(new CustomEvent("rf-theme-updated", { detail: config }));
}

export const REMOTE_THEME_DOC_ID = "RF_WEB_THEME_CFG_V2";
export const REMOTE_THEME_CATEGORY = "WEBSITE_CONFIG_INTERNAL";

const cleanUrl = SUPABASE_URL.replace(/[\uFEFF\r\n\t ]/g, "");
const cleanKey = SUPABASE_KEY.replace(/[\uFEFF\r\n\t ]/g, "");

export async function fetchRemoteThemeConfig(): Promise<ThemeConfig | null> {
  try {
    const endpoint = `${cleanUrl}/rest/v1/Documents?id=eq.${encodeURIComponent(REMOTE_THEME_DOC_ID)}&select=id,description,createdAt&limit=1`;
    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        apikey: cleanKey,
        Authorization: `Bearer ${cleanKey}`,
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as Array<{ id?: string; description?: string }>;
    const rawDesc = rows?.[0]?.description;
    if (!rawDesc) return null;
    const parsed = JSON.parse(rawDesc);
    if (parsed && typeof parsed === "object" && parsed.hero && parsed.categories) {
      const config = normalizeTheme(parsed);
      saveThemeConfig(config);
      return config;
    }
  } catch (err) {
    console.warn("fetchRemoteThemeConfig failed:", err);
  }
  return null;
}

export async function publishThemeConfig(config: ThemeConfig): Promise<boolean> {
  const normalized = normalizeTheme(config);
  saveThemeConfig(normalized);
  if (typeof window === "undefined") return true;
  try {
    const endpoint = `${cleanUrl}/rest/v1/Documents?on_conflict=id`;
    const row = {
      id: REMOTE_THEME_DOC_ID,
      category: REMOTE_THEME_CATEGORY,
      title: "RF Website Theme Config v2",
      description: JSON.stringify(normalized),
      createdAt: new Date().toISOString(),
      createdBy: "RF Web Studio",
    };
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        apikey: cleanKey,
        Authorization: `Bearer ${cleanKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(row),
    });
    if (!res.ok) {
      console.warn("publishThemeConfig Supabase error:", res.status);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("publishThemeConfig remote failed:", err);
    return false;
  }
}

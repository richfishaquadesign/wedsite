import { useEffect, useState } from "react";

export type Article = {
  slug: string;
  title: string;
  category: string;
  image: string;
  lede: string;
  html: string;
  publishedAt: string;
};

const ADMIN_STORAGE_KEY = "rf-admin-articles";

function readAdminArticles(): Article[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

let pending: Promise<Article[]> | null = null;

export function loadArticles() {
  if (!pending) {
    pending = fetch("/journal.json")
      .then((response) => {
        if (!response.ok) throw new Error("journal");
        return response.json() as Promise<Article[]>;
      })
      .then((items) => {
        const admin = readAdminArticles();
        if (admin.length === 0) return items;
        const adminSlugs = new Set(admin.map((article) => article.slug));
        return [...admin, ...items.filter((article) => !adminSlugs.has(article.slug))];
      });
  }
  return pending;
}

export function useArticles() {
  const [articles, setArticles] = useState<Article[] | null>(null);
  useEffect(() => {
    let alive = true;
    void loadArticles()
      .then((items) => {
        if (alive) setArticles(items);
      })
      .catch(() => {
        if (alive) setArticles([]);
      });
    return () => {
      alive = false;
    };
  }, []);
  return articles;
}

export function saveAdminArticles(items: Article[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(items));
  pending = null;
}

export function getAdminArticles(): Article[] {
  return readAdminArticles();
}

const SETTINGS_STORAGE_KEY = "rf-admin-settings";

export type AdminSettings = {
  siteTitle: string;
  heroEyebrow: string;
  heroHeading: string;
  heroImage: string;
};

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  siteTitle: "RF Aqua Design",
  heroEyebrow: "RF AQUARIUM",
  heroHeading: "Một khoảng\nthiên nhiên.\nMột dấu ấn riêng.",
  heroImage: "/images/source/home-2.webp",
};

function normalizeSettings(raw: unknown): AdminSettings {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_ADMIN_SETTINGS };
  const source = raw as Partial<AdminSettings>;
  return {
    siteTitle:
      typeof source.siteTitle === "string" && source.siteTitle.trim()
        ? source.siteTitle.trim()
        : DEFAULT_ADMIN_SETTINGS.siteTitle,
    heroEyebrow:
      typeof source.heroEyebrow === "string" && source.heroEyebrow.trim()
        ? source.heroEyebrow.trim()
        : DEFAULT_ADMIN_SETTINGS.heroEyebrow,
    heroHeading:
      typeof source.heroHeading === "string" && source.heroHeading.trim()
        ? source.heroHeading.trim()
        : DEFAULT_ADMIN_SETTINGS.heroHeading,
    heroImage:
      typeof source.heroImage === "string" && source.heroImage.trim()
        ? source.heroImage.trim()
        : DEFAULT_ADMIN_SETTINGS.heroImage,
  };
}

export function loadAdminSettings(): AdminSettings {
  if (typeof window === "undefined") return { ...DEFAULT_ADMIN_SETTINGS };
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_ADMIN_SETTINGS };
    return normalizeSettings(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_ADMIN_SETTINGS };
  }
}

export function saveAdminSettings(settings: AdminSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

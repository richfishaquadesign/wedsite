import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminGate } from "@/components/admin-gate";
import {
  Check,
  Copy,
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  Layers,
  Monitor,
  Palette,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Smartphone,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  getAdminArticles,
  loadArticles,
  saveAdminArticles,
  type Article,
} from "@/lib/journal";
import { useShop } from "@/lib/store";
import {
  DEFAULT_THEME_CONFIG,
  loadThemeConfig,
  saveThemeConfig,
  type ThemeConfig,
} from "@/lib/theme-config";
import { loadVaultCatalog, type VaultProduct } from "@/lib/vault-catalog";
import { loadWorks } from "@/lib/works";

export const Route = createFileRoute("/quan-tri")({
  component: () => (
    <AdminGate>
      <RFStudioAdmin />
    </AdminGate>
  ),
});

type StudioMode = "overview" | "customizer" | "articles" | "media";

type BlockId =
  | "style"
  | "topBanner"
  | "hero"
  | "categories"
  | "ecommerce"
  | "banners"
  | "story"
  | "gallery"
  | "footer";

const BLOCKS: Array<{ id: BlockId; label: string; hint: string }> = [
  { id: "style", label: "Màu sắc & Font", hint: "Màu nhấn, phông chữ toàn trang" },
  { id: "topBanner", label: "Thanh thông báo", hint: "Dải chữ trên cùng trang" },
  { id: "hero", label: "Hero trang chủ", hint: "Ảnh nền, tiêu đề lớn, nút CTA" },
  { id: "categories", label: "Danh mục nổi bật", hint: "3 thẻ nhóm sản phẩm chính" },
  { id: "ecommerce", label: "Kênh bán hàng", hint: "Shopee, TikTok, Zalo, Pinterest" },
  { id: "banners", label: "Banner bộ sưu tập", hint: "Banner Dragon & thương hiệu" },
  { id: "story", label: "Câu chuyện xưởng", hint: "Khối giới thiệu chế tác" },
  { id: "gallery", label: "Gallery tác phẩm", hint: "Banner + 3 ảnh nổi bật" },
  { id: "footer", label: "Giá trị & Liên hệ", hint: "Hotline, email, cam kết xưởng" },
];

function RFStudioAdmin() {
  const [mode, setMode] = useState<StudioMode>("customizer");
  const [activeBlock, setActiveBlock] = useState<BlockId>("hero");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [config, setConfig] = useState<ThemeConfig>(() => loadThemeConfig());
  const [dirty, setDirty] = useState(false);

  // Real data from RF_KNOWLEDGE_OS + RF Workspace Pro
  const [vaultProducts, setVaultProducts] = useState<VaultProduct[]>([]);
  const [groupedCount, setGroupedCount] = useState<number>(0);
  const liveCatalog = useShop((s) => s.liveCatalog);
  const connection = useShop((s) => s.connection);
  const orders = useShop((s) => s.orders);
  const tryPull = useShop((s) => s.tryPull);
  const [syncing, setSyncing] = useState(false);

  // Media picker modal / drawer state
  const [pickerTarget, setPickerTarget] = useState<string | null>(null);
  const [mediaQuery, setMediaQuery] = useState("");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Articles / Blog editor state
  const [articles, setArticles] = useState<Article[]>([]);
  const [adminSlugs, setAdminSlugs] = useState<Set<string>>(new Set());
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  const refreshArticles = () => {
    const custom = getAdminArticles();
    setAdminSlugs(new Set(custom.map((a) => a.slug)));
    void loadArticles()
      .then((list) => setArticles(list))
      .catch(() => {});
  };

  useEffect(() => {
    setConfig(loadThemeConfig());
    refreshArticles();
    void loadVaultCatalog()
      .then((payload) => setVaultProducts(payload.products))
      .catch(() => {});
    void loadWorks()
      .then((works) => setGroupedCount(works.length))
      .catch(() => {});
  }, []);

  const allVaultImages = useMemo(() => {
    const seen = new Set<string>();
    const list: Array<{ url: string; title: string; sku: string }> = [];
    for (const p of vaultProducts) {
      for (const img of p.images) {
        if (seen.has(img)) continue;
        seen.add(img);
        list.push({ url: img, title: p.title, sku: p.sku });
      }
    }
    return list;
  }, [vaultProducts]);

  const filteredImages = useMemo(() => {
    const q = mediaQuery.trim().toLowerCase();
    const pool = q
      ? allVaultImages.filter(
          (i) => i.title.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q),
        )
      : allVaultImages;
    return pool.slice(0, 60);
  }, [allVaultImages, mediaQuery]);

  const updateConfig = (updater: (prev: ThemeConfig) => ThemeConfig) => {
    setConfig((prev) => {
      const next = updater(prev);
      saveThemeConfig(next);
      return next;
    });
    setDirty(true);
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.dispatchEvent(
        new StorageEvent("storage", { key: "rf_theme_config_v2" }),
      );
    }
  };

  const handlePublish = () => {
    saveThemeConfig(config);
    setDirty(false);
    if (iframeRef.current) {
      iframeRef.current.src = "/";
    }
    toast.success("Đã lưu và áp dụng giao diện lên Website.");
  };

  const handleReset = () => {
    saveThemeConfig(DEFAULT_THEME_CONFIG);
    setConfig(DEFAULT_THEME_CONFIG);
    setDirty(false);
    if (iframeRef.current) iframeRef.current.src = "/";
    toast.success("Đã khôi phục cấu hình giao diện mặc định.");
  };

  const handleSyncWorkspace = async () => {
    setSyncing(true);
    const res = await tryPull();
    setSyncing(false);
    if (res.ok) toast.success(res.message);
    else toast.error(res.message);
  };

  const applyImageToTarget = (target: string, url: string) => {
    if (target === "hero") {
      updateConfig((p) => ({ ...p, hero: { ...p.hero, image: url } }));
    } else if (target === "story") {
      updateConfig((p) => ({ ...p, story: { ...p.story, image: url } }));
    } else if (target === "banner1") {
      updateConfig((p) => ({
        ...p,
        featureBanners: {
          ...p.featureBanners,
          banner1: { ...p.featureBanners.banner1, image: url },
        },
      }));
    } else if (target === "banner2") {
      updateConfig((p) => ({
        ...p,
        featureBanners: {
          ...p.featureBanners,
          banner2: { ...p.featureBanners.banner2, image: url },
        },
      }));
    } else if (target === "galleryBanner") {
      updateConfig((p) => ({ ...p, gallery: { ...p.gallery, bannerImage: url } }));
    } else if (target.startsWith("cat:")) {
      const idx = Number(target.split(":")[1]);
      updateConfig((p) => {
        const items = [...p.categories.items];
        if (items[idx]) items[idx] = { ...items[idx], image: url };
        return { ...p, categories: { ...p.categories, items } };
      });
    } else if (target === "article") {
      setEditingArticle((prev) => (prev ? { ...prev, image: url } : prev));
    } else if (target.startsWith("gal:")) {
      const idx = Number(target.split(":")[1]);
      updateConfig((p) => {
        const images = [...p.gallery.images];
        images[idx] = url;
        return { ...p, gallery: { ...p.gallery, images } };
      });
    }
    setPickerTarget(null);
    toast.success("Đã cập nhật ảnh mới.");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pickerTarget) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        applyImageToTarget(pickerTarget, reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const slugifyVi = (input: string) =>
    input
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const startNewArticle = () => {
    setEditingArticle({
      slug: `bai-viet-${Date.now().toString().slice(-6)}`,
      title: "",
      category: "Kinh nghiệm thủy sinh",
      image: "/images/rf/craft.png",
      lede: "",
      html: "<p></p>",
      publishedAt: new Date().toISOString().slice(0, 10),
    });
  };

  const handleSaveArticle = () => {
    if (!editingArticle) return;
    const title = editingArticle.title.trim();
    const slug = (editingArticle.slug.trim() || slugifyVi(title)).toLowerCase();
    if (!title || !slug) {
      toast.error("Cần nhập tiêu đề và đường dẫn slug cho bài viết.");
      return;
    }
    const clean: Article = { ...editingArticle, title, slug };
    const existing = getAdminArticles().filter((a) => a.slug !== slug);
    saveAdminArticles([clean, ...existing]);
    refreshArticles();
    setEditingArticle(clean);
    toast.success(`Đã lưu bài viết "${title}".`);
  };

  const handleDeleteArticle = (slug: string) => {
    const remaining = getAdminArticles().filter((a) => a.slug !== slug);
    saveAdminArticles(remaining);
    refreshArticles();
    if (editingArticle?.slug === slug) setEditingArticle(null);
    toast.success("Đã xóa bản chỉnh sửa bài viết.");
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rf-theme-config-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as ThemeConfig;
        if (!parsed.hero || !parsed.categories) throw new Error("invalid");
        saveThemeConfig(parsed);
        setConfig(parsed);
        setDirty(false);
        if (iframeRef.current) iframeRef.current.src = "/";
        toast.success("Đã nhập cấu hình JSON thành công.");
      } catch {
        toast.error("File JSON cấu hình không hợp lệ.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const renderImageField = (label: string, value: string, target: string) => (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-neutral-600">{label}</label>
      <div className="flex items-center gap-2">
        <img
          src={value}
          alt={label}
          className="h-11 w-14 shrink-0 rounded border border-neutral-200 object-cover bg-neutral-100"
        />
        <input
          type="text"
          value={value.startsWith("data:") ? "(Ảnh tải lên từ máy)" : value}
          onChange={(e) => applyImageToTarget(target, e.target.value)}
          disabled={value.startsWith("data:")}
          className="h-9 flex-1 rounded border border-neutral-300 bg-white px-2.5 text-xs text-neutral-800"
        />
        <button
          type="button"
          onClick={() => setPickerTarget(target)}
          className="h-9 shrink-0 rounded border border-neutral-300 bg-neutral-50 px-2.5 text-xs font-medium text-neutral-800 hover:bg-neutral-100"
        >
          Chọn ảnh
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />
      <input
        ref={jsonInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={handleImportJson}
      />

      {/* Top Studio Bar */}
      <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 py-2.5 md:px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded bg-neutral-950 text-xs font-bold text-white">
              RF
            </span>
            <div>
              <h1 className="text-sm font-semibold leading-none text-neutral-950">
                RF Web Studio
              </h1>
              <p className="mt-0.5 text-[11px] text-neutral-500">
                Tinh chỉnh giao diện & đồng bộ RF Knowledge OS
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-1 rounded-md bg-neutral-100 p-0.5">
            {(
              [
                { id: "customizer", label: "Chỉnh giao diện", icon: Palette },
                { id: "articles", label: `Bài viết (${articles.length})`, icon: FileText },
                { id: "overview", label: "Tổng quan hệ thống", icon: Layers },
                { id: "media", label: `Kho ảnh (${allVaultImages.length})`, icon: ImageIcon },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const active = mode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMode(tab.id)}
                  className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition ${
                    active
                      ? "bg-white text-neutral-950 shadow-xs"
                      : "text-neutral-600 hover:text-neutral-950"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 rounded border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
            title="Xuất file JSON cấu hình"
          >
            <Download className="h-3.5 w-3.5" />
            Xuất JSON
          </button>
          <button
            type="button"
            onClick={() => jsonInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
            title="Nhập file JSON cấu hình"
          >
            <Upload className="h-3.5 w-3.5" />
            Nhập JSON
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Mặc định
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 hover:bg-neutral-50"
          >
            <Eye className="h-3.5 w-3.5" />
            Xem web
          </Link>
          <button
            type="button"
            onClick={handlePublish}
            className="inline-flex items-center gap-1.5 rounded bg-neutral-950 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800"
          >
            <Save className="h-3.5 w-3.5" />
            {dirty ? "Lưu & Xuất bản *" : "Đã xuất bản"}
          </button>
        </div>
      </header>

      {/* MODE 1: OVERVIEW (REAL DATA ONLY) */}
      {mode === "overview" && (
        <main className="mx-auto max-w-6xl space-y-6 p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-neutral-200 bg-white p-4">
              <p className="text-xs font-medium text-neutral-500">Sản phẩm APPROVED (Vault)</p>
              <p className="mt-1 text-2xl font-bold text-neutral-950 tabular-nums">
                {vaultProducts.length} SKU
              </p>
              <p className="mt-1 text-xs text-neutral-600">
                Gom gọn thành {groupedCount} đầu mục trên /bo-suu-tap
              </p>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white p-4">
              <p className="text-xs font-medium text-neutral-500">Ảnh sản phẩm có logo</p>
              <p className="mt-1 text-2xl font-bold text-neutral-950 tabular-nums">
                {allVaultImages.length}
              </p>
              <p className="mt-1 text-xs text-neutral-600">Chuẩn WebP từ RF Knowledge OS</p>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white p-4">
              <p className="text-xs font-medium text-neutral-500">RF Workspace Pro</p>
              <p className="mt-1 text-2xl font-bold text-neutral-950">
                {connection.status === "active"
                  ? `${liveCatalog?.length ?? 0} SKU sống`
                  : "Chưa kết nối"}
              </p>
              <p className="mt-1 text-xs text-neutral-600">
                {connection.lastSyncAt
                  ? `Đồng bộ lúc ${connection.lastSyncAt}`
                  : "Chưa có phiên đồng bộ gần đây"}
              </p>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white p-4">
              <p className="text-xs font-medium text-neutral-500">Đơn hàng / Yêu cầu</p>
              <p className="mt-1 text-2xl font-bold text-neutral-950 tabular-nums">
                {orders.length}
              </p>
              <p className="mt-1 text-xs text-neutral-600">Lưu trên phiên trình duyệt hiện tại</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-neutral-200 bg-white p-5">
            <div>
              <h2 className="text-base font-semibold text-neutral-950">
                Kết nối kho sống RF Workspace Pro
              </h2>
              <p className="mt-1 text-sm text-neutral-600">
                Website tự động lấy 290 sản phẩm chuẩn SEO từ RF Knowledge OS và gộp tồn kho + giá
                bán theo thời gian thực từ RF Workspace Pro.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/ket-noi"
                className="rounded border border-neutral-300 bg-white px-3.5 py-2 text-xs font-medium text-neutral-800 hover:bg-neutral-50"
              >
                Cấu hình API kết nối
              </Link>
              <button
                type="button"
                disabled={syncing || !connection.baseUrl}
                onClick={() => void handleSyncWorkspace()}
                className="inline-flex items-center gap-1.5 rounded bg-neutral-950 px-3.5 py-2 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Đang đồng bộ..." : "Kéo tồn kho ngay"}
              </button>
            </div>
          </div>
        </main>
      )}

      {/* MODE 2: LIVE VISUAL CUSTOMIZER */}
      {mode === "customizer" && (
        <div className="grid min-h-[calc(100vh-53px)] lg:grid-cols-12">
          {/* Left Panel: Blocks & Controls */}
          <aside className="flex flex-col border-r border-neutral-200 bg-white lg:col-span-4 xl:col-span-4">
            {/* Block Selector Pills */}
            <div className="border-b border-neutral-200 p-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Chọn khối cần chỉnh
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {BLOCKS.map((b) => {
                  const active = activeBlock === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setActiveBlock(b.id)}
                      className={`rounded border px-2.5 py-2 text-left transition ${
                        active
                          ? "border-neutral-950 bg-neutral-950 text-white"
                          : "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300 hover:bg-neutral-50"
                      }`}
                    >
                      <div className="text-xs font-semibold">{b.label}</div>
                      <div
                        className={`mt-0.5 truncate text-[10px] ${
                          active ? "text-neutral-300" : "text-neutral-500"
                        }`}
                      >
                        {b.hint}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Block Editor */}
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {activeBlock === "style" && (
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold text-neutral-950">Màu sắc & Phông chữ</h2>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-neutral-600">
                      Màu nhấn (Accent Color)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.accentColor}
                        onChange={(e) =>
                          updateConfig((p) => ({ ...p, accentColor: e.target.value }))
                        }
                        className="h-9 w-12 cursor-pointer rounded border border-neutral-300 p-0.5"
                      />
                      <input
                        type="text"
                        value={config.accentColor}
                        onChange={(e) =>
                          updateConfig((p) => ({ ...p, accentColor: e.target.value }))
                        }
                        className="h-9 flex-1 rounded border border-neutral-300 px-2.5 text-xs font-mono"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-neutral-600">Phông chữ</label>
                    <select
                      value={config.fontFamily}
                      onChange={(e) =>
                        updateConfig((p) => ({ ...p, fontFamily: e.target.value }))
                      }
                      className="h-9 w-full rounded border border-neutral-300 bg-white px-2.5 text-xs"
                    >
                      <option value="Be Vietnam Pro">Be Vietnam Pro (Mặc định)</option>
                      <option value="Inter">Inter</option>
                      <option value="system-ui">System Sans</option>
                    </select>
                  </div>
                </div>
              )}

              {activeBlock === "topBanner" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-neutral-950">Thanh thông báo</h2>
                    <label className="flex items-center gap-1.5 text-xs font-medium">
                      <input
                        type="checkbox"
                        checked={config.topBanner.enabled}
                        onChange={(e) =>
                          updateConfig((p) => ({
                            ...p,
                            topBanner: { ...p.topBanner, enabled: e.target.checked },
                          }))
                        }
                      />
                      Hiển thị
                    </label>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-neutral-600">Nội dung</label>
                    <textarea
                      rows={3}
                      value={config.topBanner.text}
                      onChange={(e) =>
                        updateConfig((p) => ({
                          ...p,
                          topBanner: { ...p.topBanner, text: e.target.value },
                        }))
                      }
                      className="w-full rounded border border-neutral-300 p-2.5 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-neutral-600">
                      Liên kết khi bấm
                    </label>
                    <input
                      type="text"
                      value={config.topBanner.link}
                      onChange={(e) =>
                        updateConfig((p) => ({
                          ...p,
                          topBanner: { ...p.topBanner, link: e.target.value },
                        }))
                      }
                      className="h-9 w-full rounded border border-neutral-300 px-2.5 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-neutral-600">Màu nền</label>
                    <input
                      type="color"
                      value={config.topBanner.bgColor}
                      onChange={(e) =>
                        updateConfig((p) => ({
                          ...p,
                          topBanner: { ...p.topBanner, bgColor: e.target.value },
                        }))
                      }
                      className="h-9 w-16 cursor-pointer rounded border border-neutral-300 p-0.5"
                    />
                  </div>
                </div>
              )}

              {activeBlock === "hero" && (
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold text-neutral-950">Hero trang chủ</h2>
                  {renderImageField("Ảnh nền Hero", config.hero.image, "hero")}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-neutral-600">Nhãn nhỏ</label>
                    <input
                      type="text"
                      value={config.hero.eyebrow}
                      onChange={(e) =>
                        updateConfig((p) => ({
                          ...p,
                          hero: { ...p.hero, eyebrow: e.target.value },
                        }))
                      }
                      className="h-9 w-full rounded border border-neutral-300 px-2.5 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-neutral-600">
                      Tiêu đề chính
                    </label>
                    <textarea
                      rows={3}
                      value={config.hero.heading}
                      onChange={(e) =>
                        updateConfig((p) => ({
                          ...p,
                          hero: { ...p.hero, heading: e.target.value },
                        }))
                      }
                      className="w-full rounded border border-neutral-300 p-2.5 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-neutral-600">Mô tả ngắn</label>
                    <textarea
                      rows={3}
                      value={config.hero.description}
                      onChange={(e) =>
                        updateConfig((p) => ({
                          ...p,
                          hero: { ...p.hero, description: e.target.value },
                        }))
                      }
                      className="w-full rounded border border-neutral-300 p-2.5 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-neutral-600">Chữ nút</label>
                      <input
                        type="text"
                        value={config.hero.buttonText}
                        onChange={(e) =>
                          updateConfig((p) => ({
                            ...p,
                            hero: { ...p.hero, buttonText: e.target.value },
                          }))
                        }
                        className="h-9 w-full rounded border border-neutral-300 px-2.5 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-neutral-600">Link nút</label>
                      <input
                        type="text"
                        value={config.hero.buttonLink}
                        onChange={(e) =>
                          updateConfig((p) => ({
                            ...p,
                            hero: { ...p.hero, buttonLink: e.target.value },
                          }))
                        }
                        className="h-9 w-full rounded border border-neutral-300 px-2.5 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeBlock === "categories" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-neutral-950">Danh mục nổi bật</h2>
                    <label className="flex items-center gap-1.5 text-xs font-medium">
                      <input
                        type="checkbox"
                        checked={config.categories.enabled}
                        onChange={(e) =>
                          updateConfig((p) => ({
                            ...p,
                            categories: { ...p.categories, enabled: e.target.checked },
                          }))
                        }
                      />
                      Hiển thị
                    </label>
                  </div>
                  <input
                    type="text"
                    value={config.categories.title}
                    onChange={(e) =>
                      updateConfig((p) => ({
                        ...p,
                        categories: { ...p.categories, title: e.target.value },
                      }))
                    }
                    placeholder="Tiêu đề khối"
                    className="h-9 w-full rounded border border-neutral-300 px-2.5 text-xs font-medium"
                  />
                  <input
                    type="text"
                    value={config.categories.subtitle}
                    onChange={(e) =>
                      updateConfig((p) => ({
                        ...p,
                        categories: { ...p.categories, subtitle: e.target.value },
                      }))
                    }
                    placeholder="Mô tả phụ"
                    className="h-9 w-full rounded border border-neutral-300 px-2.5 text-xs"
                  />
                  <div className="space-y-3">
                    {config.categories.items.map((cat, idx) => (
                      <div
                        key={cat.id}
                        className="space-y-2 rounded border border-neutral-200 bg-neutral-50 p-3"
                      >
                        <p className="text-xs font-semibold text-neutral-700">Thẻ #{idx + 1}</p>
                        {renderImageField("Ảnh thẻ", cat.image, `cat:${idx}`)}
                        <input
                          type="text"
                          value={cat.name}
                          onChange={(e) =>
                            updateConfig((p) => {
                              const items = [...p.categories.items];
                              items[idx] = { ...items[idx], name: e.target.value };
                              return { ...p, categories: { ...p.categories, items } };
                            })
                          }
                          className="h-8 w-full rounded border border-neutral-300 bg-white px-2 text-xs font-medium"
                        />
                        <input
                          type="text"
                          value={cat.subtitle}
                          onChange={(e) =>
                            updateConfig((p) => {
                              const items = [...p.categories.items];
                              items[idx] = { ...items[idx], subtitle: e.target.value };
                              return { ...p, categories: { ...p.categories, items } };
                            })
                          }
                          className="h-8 w-full rounded border border-neutral-300 bg-white px-2 text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeBlock === "ecommerce" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-neutral-950">Kênh bán hàng</h2>
                    <label className="flex items-center gap-1.5 text-xs font-medium">
                      <input
                        type="checkbox"
                        checked={config.ecommerceChannels.enabled}
                        onChange={(e) =>
                          updateConfig((p) => ({
                            ...p,
                            ecommerceChannels: {
                              ...p.ecommerceChannels,
                              enabled: e.target.checked,
                            },
                          }))
                        }
                      />
                      Hiển thị
                    </label>
                  </div>
                  {(
                    [
                      ["Tiêu đề khối", "title"],
                      ["Shopee URL", "shopeeUrl"],
                      ["TikTok Shop URL", "tiktokUrl"],
                      ["Zalo OA URL", "zaloUrl"],
                      ["Pinterest URL", "pinterestUrl"],
                    ] as const
                  ).map(([lbl, key]) => (
                    <div key={key} className="space-y-1">
                      <label className="block text-xs font-medium text-neutral-600">{lbl}</label>
                      <input
                        type="text"
                        value={config.ecommerceChannels[key]}
                        onChange={(e) =>
                          updateConfig((p) => ({
                            ...p,
                            ecommerceChannels: { ...p.ecommerceChannels, [key]: e.target.value },
                          }))
                        }
                        className="h-9 w-full rounded border border-neutral-300 px-2.5 text-xs"
                      />
                    </div>
                  ))}
                </div>
              )}

              {activeBlock === "banners" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-neutral-950">Banner bộ sưu tập</h2>
                    <label className="flex items-center gap-1.5 text-xs font-medium">
                      <input
                        type="checkbox"
                        checked={config.featureBanners.enabled}
                        onChange={(e) =>
                          updateConfig((p) => ({
                            ...p,
                            featureBanners: { ...p.featureBanners, enabled: e.target.checked },
                          }))
                        }
                      />
                      Hiển thị
                    </label>
                  </div>
                  {renderImageField("Banner 1 (Linh Thú)", config.featureBanners.banner1.image, "banner1")}
                  <input
                    type="text"
                    value={config.featureBanners.banner1.title}
                    onChange={(e) =>
                      updateConfig((p) => ({
                        ...p,
                        featureBanners: {
                          ...p.featureBanners,
                          banner1: { ...p.featureBanners.banner1, title: e.target.value },
                        },
                      }))
                    }
                    className="h-9 w-full rounded border border-neutral-300 px-2.5 text-xs"
                  />
                  <input
                    type="text"
                    value={config.featureBanners.banner1.subtitle}
                    onChange={(e) =>
                      updateConfig((p) => ({
                        ...p,
                        featureBanners: {
                          ...p.featureBanners,
                          banner1: { ...p.featureBanners.banner1, subtitle: e.target.value },
                        },
                      }))
                    }
                    className="h-9 w-full rounded border border-neutral-300 px-2.5 text-xs"
                  />
                  {renderImageField("Banner 2 (Thương hiệu)", config.featureBanners.banner2.image, "banner2")}
                </div>
              )}

              {activeBlock === "story" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-neutral-950">Câu chuyện xưởng</h2>
                    <label className="flex items-center gap-1.5 text-xs font-medium">
                      <input
                        type="checkbox"
                        checked={config.story.enabled}
                        onChange={(e) =>
                          updateConfig((p) => ({
                            ...p,
                            story: { ...p.story, enabled: e.target.checked },
                          }))
                        }
                      />
                      Hiển thị
                    </label>
                  </div>
                  {renderImageField("Ảnh minh họa", config.story.image, "story")}
                  <input
                    type="text"
                    value={config.story.eyebrow}
                    onChange={(e) =>
                      updateConfig((p) => ({
                        ...p,
                        story: { ...p.story, eyebrow: e.target.value },
                      }))
                    }
                    className="h-9 w-full rounded border border-neutral-300 px-2.5 text-xs"
                  />
                  <textarea
                    rows={2}
                    value={config.story.title}
                    onChange={(e) =>
                      updateConfig((p) => ({
                        ...p,
                        story: { ...p.story, title: e.target.value },
                      }))
                    }
                    className="w-full rounded border border-neutral-300 p-2.5 text-xs"
                  />
                  <textarea
                    rows={5}
                    value={config.story.content}
                    onChange={(e) =>
                      updateConfig((p) => ({
                        ...p,
                        story: { ...p.story, content: e.target.value },
                      }))
                    }
                    className="w-full rounded border border-neutral-300 p-2.5 text-xs"
                  />
                </div>
              )}

              {activeBlock === "gallery" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-neutral-950">Gallery tác phẩm</h2>
                    <label className="flex items-center gap-1.5 text-xs font-medium">
                      <input
                        type="checkbox"
                        checked={config.gallery.enabled}
                        onChange={(e) =>
                          updateConfig((p) => ({
                            ...p,
                            gallery: { ...p.gallery, enabled: e.target.checked },
                          }))
                        }
                      />
                      Hiển thị
                    </label>
                  </div>
                  <input
                    type="text"
                    value={config.gallery.title}
                    onChange={(e) =>
                      updateConfig((p) => ({
                        ...p,
                        gallery: { ...p.gallery, title: e.target.value },
                      }))
                    }
                    className="h-9 w-full rounded border border-neutral-300 px-2.5 text-xs"
                  />
                  {renderImageField("Ảnh divider", config.gallery.bannerImage, "galleryBanner")}
                  {config.gallery.images.map((img, idx) => (
                    <div key={idx}>{renderImageField(`Ảnh tác phẩm #${idx + 1}`, img, `gal:${idx}`)}</div>
                  ))}
                </div>
              )}

              {activeBlock === "footer" && (
                <div className="space-y-3">
                  <h2 className="text-sm font-semibold text-neutral-950">Giá trị & Liên hệ</h2>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-neutral-600">Hotline</label>
                    <input
                      type="text"
                      value={config.footer.hotline}
                      onChange={(e) =>
                        updateConfig((p) => ({
                          ...p,
                          footer: { ...p.footer, hotline: e.target.value },
                        }))
                      }
                      className="h-9 w-full rounded border border-neutral-300 px-2.5 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-neutral-600">Email</label>
                    <input
                      type="text"
                      value={config.footer.email}
                      onChange={(e) =>
                        updateConfig((p) => ({
                          ...p,
                          footer: { ...p.footer, email: e.target.value },
                        }))
                      }
                      className="h-9 w-full rounded border border-neutral-300 px-2.5 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-neutral-600">
                      Giá trị cốt lõi (mỗi dòng 1 mục)
                    </label>
                    <textarea
                      rows={4}
                      value={config.values.items.join("\n")}
                      onChange={(e) =>
                        updateConfig((p) => ({
                          ...p,
                          values: {
                            ...p.values,
                            items: e.target.value
                              .split("\n")
                              .map((x) => x.trim())
                              .filter(Boolean),
                          },
                        }))
                      }
                      className="w-full rounded border border-neutral-300 p-2.5 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Right Panel: Real Live Website Preview */}
          <section className="flex flex-col bg-neutral-200/70 lg:col-span-8 xl:col-span-8">
            <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-100 px-4 py-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setDevice("desktop")}
                  className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium ${
                    device === "desktop"
                      ? "bg-neutral-950 text-white"
                      : "text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  <Monitor className="h-3.5 w-3.5" />
                  Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setDevice("mobile")}
                  className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium ${
                    device === "mobile"
                      ? "bg-neutral-950 text-white"
                      : "text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  Mobile (390px)
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (iframeRef.current) iframeRef.current.src = "/";
                }}
                className="inline-flex items-center gap-1 rounded border border-neutral-300 bg-white px-2.5 py-1 text-xs text-neutral-700 hover:bg-neutral-50"
              >
                <RefreshCw className="h-3 w-3" />
                Tải lại preview
              </button>
            </div>

            <div className="flex flex-1 items-start justify-center overflow-auto p-4">
              <div
                className={`overflow-hidden rounded-lg border border-neutral-300 bg-black shadow-lg transition-all ${
                  device === "mobile" ? "h-[780px] w-[390px]" : "h-[calc(100vh-125px)] w-full"
                }`}
              >
                <iframe
                  ref={iframeRef}
                  src="/"
                  title="Xem trước website RF Aqua Design"
                  className="h-full w-full border-0 bg-black"
                />
              </div>
            </div>
          </section>
        </div>
      )}

      {/* MODE 3: ARTICLES / BLOG EDITOR */}
      {mode === "articles" && (
        <main className="mx-auto grid max-w-6xl gap-6 p-6 lg:grid-cols-12">
          <aside className="space-y-3 lg:col-span-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-neutral-950">
                Danh sách bài viết ({articles.length})
              </h2>
              <button
                type="button"
                onClick={startNewArticle}
                className="inline-flex items-center gap-1.5 rounded bg-neutral-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800"
              >
                <Plus className="h-3.5 w-3.5" />
                Viết bài mới
              </button>
            </div>
            <div className="max-h-[72vh] space-y-2 overflow-y-auto pr-1">
              {articles.map((art) => {
                const isSelected = editingArticle?.slug === art.slug;
                const isCustom = adminSlugs.has(art.slug);
                return (
                  <div
                    key={art.slug}
                    className={`flex items-start gap-3 rounded-lg border p-3 transition ${
                      isSelected
                        ? "border-neutral-950 bg-white shadow-xs"
                        : "border-neutral-200 bg-white hover:border-neutral-300"
                    }`}
                  >
                    <img
                      src={art.image}
                      alt={art.title}
                      className="h-14 w-16 shrink-0 rounded object-cover bg-neutral-100"
                    />
                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => setEditingArticle(art)}
                        className="block w-full text-left text-xs font-semibold text-neutral-950 hover:underline line-clamp-2"
                      >
                        {art.title}
                      </button>
                      <p className="mt-1 text-[11px] text-neutral-500">
                        {art.category} · {art.publishedAt}
                        {isCustom ? " · Đã chỉnh/tạo mới" : ""}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingArticle(art)}
                          className="text-[11px] font-medium text-neutral-700 underline"
                        >
                          Chỉnh sửa
                        </button>
                        <Link
                          to="/bai-viet/$slug"
                          params={{ slug: art.slug }}
                          className="text-[11px] text-neutral-500 underline"
                        >
                          Xem
                        </Link>
                        {isCustom ? (
                          <button
                            type="button"
                            onClick={() => handleDeleteArticle(art.slug)}
                            className="inline-flex items-center gap-0.5 text-[11px] text-red-600 hover:underline"
                          >
                            <Trash2 className="h-3 w-3" />
                            Xóa bản sửa
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          <section className="rounded-lg border border-neutral-200 bg-white p-5 lg:col-span-7">
            {!editingArticle ? (
              <div className="flex h-64 flex-col items-center justify-center text-center text-neutral-500">
                <FileText className="mb-2 h-8 w-8 text-neutral-300" />
                <p className="text-sm font-medium text-neutral-700">
                  Chọn một bài viết bên trái để chỉnh sửa hoặc bấm &ldquo;Viết bài mới&rdquo;.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                  <h3 className="text-sm font-semibold text-neutral-950">
                    {editingArticle.title || "Bài viết mới"}
                  </h3>
                  <button
                    type="button"
                    onClick={handleSaveArticle}
                    className="inline-flex items-center gap-1.5 rounded bg-neutral-950 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800"
                  >
                    <Save className="h-3.5 w-3.5" />
                    Lưu bài viết
                  </button>
                </div>

                {renderImageField("Ảnh đại diện bài viết", editingArticle.image, "article")}

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-neutral-600">Tiêu đề</label>
                    <input
                      type="text"
                      value={editingArticle.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        setEditingArticle((prev) =>
                          prev
                            ? {
                                ...prev,
                                title,
                                slug: prev.slug.startsWith("bai-viet-")
                                  ? slugifyVi(title) || prev.slug
                                  : prev.slug,
                              }
                            : prev,
                        );
                      }}
                      className="h-9 w-full rounded border border-neutral-300 px-2.5 text-xs font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-neutral-600">
                      Đường dẫn (Slug)
                    </label>
                    <input
                      type="text"
                      value={editingArticle.slug}
                      onChange={(e) =>
                        setEditingArticle((prev) =>
                          prev ? { ...prev, slug: e.target.value } : prev,
                        )
                      }
                      className="h-9 w-full rounded border border-neutral-300 px-2.5 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-neutral-600">Danh mục</label>
                    <input
                      type="text"
                      value={editingArticle.category}
                      onChange={(e) =>
                        setEditingArticle((prev) =>
                          prev ? { ...prev, category: e.target.value } : prev,
                        )
                      }
                      className="h-9 w-full rounded border border-neutral-300 px-2.5 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-neutral-600">Ngày đăng</label>
                    <input
                      type="date"
                      value={editingArticle.publishedAt}
                      onChange={(e) =>
                        setEditingArticle((prev) =>
                          prev ? { ...prev, publishedAt: e.target.value } : prev,
                        )
                      }
                      className="h-9 w-full rounded border border-neutral-300 px-2.5 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-neutral-600">
                    Mô tả ngắn (Lede)
                  </label>
                  <textarea
                    rows={2}
                    value={editingArticle.lede}
                    onChange={(e) =>
                      setEditingArticle((prev) =>
                        prev ? { ...prev, lede: e.target.value } : prev,
                      )
                    }
                    className="w-full rounded border border-neutral-300 p-2.5 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-neutral-600">
                    Nội dung bài viết (HTML / văn bản)
                  </label>
                  <textarea
                    rows={10}
                    value={editingArticle.html}
                    onChange={(e) =>
                      setEditingArticle((prev) =>
                        prev ? { ...prev, html: e.target.value } : prev,
                      )
                    }
                    className="w-full rounded border border-neutral-300 p-2.5 text-xs font-mono"
                  />
                </div>
              </div>
            )}
          </section>
        </main>
      )}

      {/* MODE 4: VAULT MEDIA BROWSER */}
      {mode === "media" && (
        <main className="mx-auto max-w-6xl space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-neutral-950">
                Kho ảnh sản phẩm RF Knowledge OS
              </h2>
              <p className="text-xs text-neutral-500">
                Hiển thị tối đa 60 ảnh mỗi lượt tìm · Bấm để sao chép đường dẫn gắn vào web.
              </p>
            </div>
            <input
              type="search"
              value={mediaQuery}
              onChange={(e) => setMediaQuery(e.target.value)}
              placeholder="Tìm theo tên sản phẩm hoặc mã SKU..."
              className="h-9 w-72 rounded border border-neutral-300 bg-white px-3 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {filteredImages.map((img) => {
              const copied = copiedUrl === img.url;
              return (
                <button
                  key={img.url}
                  type="button"
                  onClick={() => {
                    void navigator.clipboard?.writeText(img.url);
                    setCopiedUrl(img.url);
                    toast.success(`Đã sao chép: ${img.url}`);
                  }}
                  className="group overflow-hidden rounded border border-neutral-200 bg-white text-left hover:border-neutral-950"
                >
                  <div className="relative aspect-square bg-neutral-100">
                    <img
                      src={img.url}
                      alt={img.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute right-1.5 top-1.5 rounded bg-black/75 p-1 text-white opacity-0 transition group-hover:opacity-100">
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </span>
                  </div>
                  <div className="p-2">
                    <p className="truncate text-[11px] font-medium text-neutral-900">{img.title}</p>
                    <p className="truncate text-[10px] text-neutral-500">{img.sku}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </main>
      )}

      {/* IMAGE PICKER MODAL */}
      {pickerTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
              <h3 className="text-sm font-semibold text-neutral-950">
                Chọn ảnh từ Kho RF hoặc tải từ máy
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => uploadInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded bg-neutral-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Tải ảnh từ máy
                </button>
                <button
                  type="button"
                  onClick={() => setPickerTarget(null)}
                  className="rounded border border-neutral-300 px-2.5 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50"
                >
                  Đóng
                </button>
              </div>
            </div>
            <div className="border-b border-neutral-200 px-4 py-2">
              <input
                type="search"
                value={mediaQuery}
                onChange={(e) => setMediaQuery(e.target.value)}
                placeholder="Tìm ảnh theo tên mẫu hoặc SKU (ví dụ: BON-001, Đảo Bay, Terrarium...)"
                className="h-9 w-full rounded border border-neutral-300 px-3 text-xs"
              />
            </div>
            <div className="grid flex-1 grid-cols-3 gap-2.5 overflow-y-auto p-4 sm:grid-cols-4 md:grid-cols-5">
              {filteredImages.map((img) => (
                <button
                  key={img.url}
                  type="button"
                  onClick={() => applyImageToTarget(pickerTarget, img.url)}
                  className="overflow-hidden rounded border border-neutral-200 text-left hover:border-neutral-950"
                >
                  <img
                    src={img.url}
                    alt={img.title}
                    loading="lazy"
                    className="aspect-square w-full object-cover"
                  />
                  <p className="truncate p-1.5 text-[10px] font-medium text-neutral-800">
                    {img.title}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

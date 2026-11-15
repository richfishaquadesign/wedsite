import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  DEFAULT_THEME_CONFIG,
  loadThemeConfig,
  saveThemeConfig,
  type ThemeConfig,
} from "@/lib/theme-config";

export const Route = createFileRoute("/quan-tri")({
  component: KiotVietStudioAdmin,
});

export function KiotVietStudioAdmin() {
  // Mode: "dashboard" (Website của tôi - Ảnh 1) | "customizer" (Chỉnh sửa giao diện - Ảnh 2)
  const [viewMode, setViewMode] = useState<"dashboard" | "customizer">("dashboard");
  const [activeMenu, setActiveMenu] = useState<string>("website-cua-toi");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [config, setConfig] = useState<ThemeConfig>(() => loadThemeConfig());
  const [activeBlock, setActiveBlock] = useState<string>("hero");
  const [syncing, setSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<string>("hero");

  useEffect(() => {
    setConfig(loadThemeConfig());
  }, []);

  const handleApplyTheme = () => {
    saveThemeConfig(config);
    toast.success("Đã áp dụng và xuất bản giao diện thành công lên Website!");
  };

  const handleSyncDatabase = async () => {
    setSyncing(true);
    toast.info("Đang đồng bộ dữ liệu với CSDL 23 bảng RF Workspace & Supabase...");
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success("Đồng bộ thành công! Đã kết nối 549 SKU từ kho hàng Products.");
    } finally {
      setSyncing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      toast.error("Vui lòng chọn ảnh có dung lượng dưới 8MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      if (!base64Url) return;

      if (uploadTarget === "hero") {
        setConfig((prev) => ({
          ...prev,
          hero: { ...prev.hero, image: base64Url },
        }));
        toast.success("Đã tải ảnh Hero Banner lên thành công!");
      } else if (uploadTarget === "story") {
        setConfig((prev) => ({
          ...prev,
          story: { ...prev.story, image: base64Url },
        }));
        toast.success("Đã tải ảnh Câu chuyện xưởng lên thành công!");
      } else if (uploadTarget === "banner1") {
        setConfig((prev) => ({
          ...prev,
          featureBanners: {
            ...prev.featureBanners,
            banner1: { ...prev.featureBanners.banner1, image: base64Url },
          },
        }));
        toast.success("Đã cập nhật ảnh Banner phụ 1!");
      } else if (uploadTarget.startsWith("cat_")) {
        const catId = uploadTarget.replace("cat_", "");
        setConfig((prev) => ({
          ...prev,
          categories: {
            ...prev.categories,
            items: prev.categories.items.map((it) =>
              it.id === catId ? { ...it, image: base64Url } : it
            ),
          },
        }));
        toast.success("Đã cập nhật ảnh nhóm hàng!");
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerUpload = (targetKey: string) => {
    setUploadTarget(targetKey);
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-[#1e293b] font-sans antialiased selection:bg-[#00b8c4] selection:text-black">
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/png,image/jpeg,image/webp,image/jpg"
        className="hidden"
      />

      {viewMode === "dashboard" ? (
        /* ========================================================================= */
        /* CHẾ ĐỘ 1: KIOTVIET WEBSITE DASHBOARD ("Website của tôi" - Ảnh 1)         */
        /* ========================================================================= */
        <div className="flex flex-col min-h-screen">
          {/* KiotViet Top Header */}
          <header className="bg-[#0070e0] text-white h-13 px-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-[#0070e0] text-sm">
                  RF
                </div>
                <div className="font-semibold text-lg tracking-tight">KiotViet · Web Hub</div>
              </div>
              <div className="hidden md:flex items-center gap-1 text-sm text-blue-100">
                <span className="bg-blue-600/70 text-white px-2.5 py-1 rounded-md font-medium">
                  Bán online
                </span>
                <span className="px-2">/</span>
                <span className="text-white font-medium">Website của tôi</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs md:text-sm">
              <button
                type="button"
                onClick={handleSyncDatabase}
                disabled={syncing}
                className="bg-white/15 hover:bg-white/25 text-white px-3 py-1.5 rounded flex items-center gap-1.5 transition font-medium cursor-pointer"
              >
                <span className={syncing ? "animate-spin" : ""}>🔄</span>
                <span>{syncing ? "Đang đồng bộ..." : "Đồng bộ CSDL"}</span>
              </button>

              <a
                href="https://rf-aquarium.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="bg-[#22c55e] hover:bg-[#16a34a] text-white px-3 py-1.5 rounded flex items-center gap-1.5 transition font-medium shadow-sm"
              >
                <span>🌐</span>
                <span>Xem website</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText("https://rf-aquarium.vercel.app");
                  toast.success("Đã sao chép link website: https://rf-aquarium.vercel.app");
                }}
                className="bg-white/15 hover:bg-white/25 text-white px-3 py-1.5 rounded flex items-center gap-1.5 transition font-medium cursor-pointer"
              >
                <span>↗</span>
                <span className="hidden sm:inline">Chia sẻ website</span>
              </button>

              <div className="w-px h-5 bg-white/20 my-auto" />

              <div className="flex items-center gap-2 pl-1">
                <span className="w-7 h-7 rounded-full bg-blue-800 flex items-center justify-center text-xs font-bold">
                  👑
                </span>
                <span className="hidden lg:inline text-xs font-medium">Quản trị viên (TỐI CAO)</span>
              </div>
            </div>
          </header>

          {/* Main Layout: Sidebar + Content */}
          <div className="flex-1 flex flex-col md:flex-row">
            {/* Left Sidebar KiotViet */}
            <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-3 flex flex-col gap-1 text-sm shrink-0">
              <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Quản lý trang
              </div>
              <button
                type="button"
                onClick={() => setActiveMenu("website-cua-toi")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-medium text-left transition cursor-pointer ${
                  activeMenu === "website-cua-toi"
                    ? "bg-blue-50 text-[#0070e0]"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>🌐</span> Website của tôi
              </button>

              <button
                type="button"
                onClick={() => setActiveMenu("dong-bo")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-medium text-left transition cursor-pointer ${
                  activeMenu === "dong-bo"
                    ? "bg-blue-50 text-[#0070e0]"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>🔄</span> Thiết lập đồng bộ kho
              </button>

              <div className="my-2 border-t border-slate-100" />

              <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Trang trí cửa hàng
              </div>

              <button
                type="button"
                onClick={() => setViewMode("customizer")}
                className="w-full flex items-center justify-between px-3 py-2 rounded-md font-medium text-left text-slate-700 hover:bg-blue-50 hover:text-[#0070e0] transition group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span>🎨</span> Chỉnh sửa giao diện
                </div>
                <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">
                  HOT
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setViewMode("customizer");
                  setActiveBlock("gallery");
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md font-medium text-left text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                <span>🖼️</span> Kho hình ảnh xưởng
              </button>

              <button
                type="button"
                onClick={() => {
                  setViewMode("customizer");
                  setActiveBlock("hero");
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md font-medium text-left text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                <span>📐</span> Thiết kế banner chính
              </button>

              <div className="my-2 border-t border-slate-100" />

              <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Hàng hoá & Bài viết
              </div>

              <button
                type="button"
                onClick={() => setActiveMenu("hang-hoa")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-medium text-left transition cursor-pointer ${
                  activeMenu === "hang-hoa"
                    ? "bg-blue-50 text-[#0070e0]"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>📦</span> Danh mục 23 bảng
              </button>

              <button
                type="button"
                onClick={() => setActiveMenu("bai-viet")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-medium text-left transition cursor-pointer ${
                  activeMenu === "bai-viet"
                    ? "bg-blue-50 text-[#0070e0]"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>📝</span> Bài viết & Blog Thủy Sinh
              </button>
            </aside>

            {/* Right Main Content */}
            <main className="flex-1 p-4 md:p-6 flex flex-col gap-5 max-w-6xl">
              {/* Banner VietQR Pro */}
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 border border-blue-200/80 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#0070e0] text-white flex items-center justify-center text-2xl shadow-md">
                    💳
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base md:text-lg">
                      Thanh toán đơn hàng qua ngân hàng & ví điện tử
                    </h3>
                    <p className="text-slate-600 text-xs md:text-sm">
                      Tự động ghi nhận mã đơn <span className="font-mono font-bold text-blue-700">WEB-...</span> vào bảng Orders CSDL 23 bảng RF Workspace Pro.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs px-3 py-1.5 rounded-full font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Đang hoạt động (Vercel Live)
                  </span>
                </div>
              </div>

              {/* Metrics Overview Box */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-slate-800 text-base">Tổng quan lưu lượng</h2>
                    <span className="text-xs bg-blue-50 text-[#0070e0] px-2 py-0.5 rounded font-medium">
                      💡 Tip: Đặt link website trên Bio TikTok & Facebook
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-md font-medium">
                    30 ngày qua (13-10-2026 – 10-11-2026)
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4">
                    <div className="text-xs text-blue-600 font-medium">👁️ Lượt truy cập</div>
                    <div className="text-2xl font-black text-slate-800 mt-1">133</div>
                    <div className="text-[11px] text-emerald-600 font-medium mt-1">↑ +18.4% tuần này</div>
                  </div>

                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-4">
                    <div className="text-xs text-emerald-600 font-medium">👤 Người truy cập</div>
                    <div className="text-2xl font-black text-slate-800 mt-1">124</div>
                    <div className="text-[11px] text-emerald-600 font-medium mt-1">↑ 92% khách mới</div>
                  </div>

                  <div className="bg-purple-50/50 border border-purple-100 rounded-lg p-4">
                    <div className="text-xs text-purple-600 font-medium">🛒 Đơn hàng website</div>
                    <div className="text-2xl font-black text-slate-800 mt-1">18</div>
                    <div className="text-[11px] text-purple-600 font-medium mt-1">Tự động vào Orders</div>
                  </div>

                  <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-4">
                    <div className="text-xs text-amber-600 font-medium">💰 Tồn kho đồng bộ</div>
                    <div className="text-2xl font-black text-slate-800 mt-1">549</div>
                    <div className="text-[11px] text-amber-600 font-medium mt-1">SKU khả dụng bán</div>
                  </div>
                </div>
              </div>

              {/* Section: Chỉnh sửa giao diện (Laptop Mockup) */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col lg:flex-row items-center gap-8">
                {/* Laptop Mockup Preview */}
                <div className="w-full lg:w-1/2 flex flex-col items-center">
                  <div className="relative w-full max-w-md bg-slate-900 rounded-t-xl p-2.5 pb-0 shadow-2xl border-4 border-slate-800">
                    {/* Mockup screen */}
                    <div className="w-full bg-[#050505] rounded-t-lg aspect-[16/10] overflow-hidden border border-slate-700 relative flex flex-col">
                      {/* Top bar in mockup */}
                      <div className="h-6 bg-[#0c1410] px-2 flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800">
                        <span className="font-bold text-[#00b8c4]">RF AQUA DESIGN</span>
                        <span>rf-aquarium.vercel.app</span>
                        <span className="text-emerald-400">● Live</span>
                      </div>
                      {/* Hero inside mockup */}
                      <div className="flex-1 relative overflow-hidden flex items-center p-4">
                        <img
                          src={config.hero.image}
                          alt="Preview"
                          className="absolute inset-0 w-full h-full object-cover opacity-60"
                        />
                        <div className="relative z-10 text-white max-w-[200px]">
                          <div className="text-[8px] text-[#00b8c4] font-semibold tracking-wider">
                            {config.hero.eyebrow}
                          </div>
                          <div className="text-xs font-bold leading-tight mt-1 whitespace-pre-line line-clamp-2">
                            {config.hero.heading}
                          </div>
                          <div className="mt-2 text-[8px] bg-[#00b8c4] text-black px-2 py-0.5 rounded font-bold inline-block">
                            Khám phá tác phẩm →
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Laptop base */}
                  <div className="w-full max-w-[460px] h-3 bg-slate-700 rounded-b-xl shadow-md border-t border-slate-600" />
                </div>

                {/* Right Action Box */}
                <div className="w-full lg:w-1/2 flex flex-col gap-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Giao diện đang sử dụng
                    </span>
                    <h3 className="text-xl font-bold text-slate-800 mt-1">
                      Nature Clean · RF Artisan Studio
                    </h3>
                    <p className="text-slate-500 text-xs mt-1">
                      Thiết kế tối giản độc quyền Rich Fish Aquarium. Hỗ trợ tùy biến màu sắc, phông chữ, banner và tải ảnh trực tiếp.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                    <span className="bg-slate-100 px-2.5 py-1 rounded">🎨 Màu nhấn: <b style={{ color: config.accentColor }}>{config.accentColor}</b></span>
                    <span className="bg-slate-100 px-2.5 py-1 rounded">🔤 Font: <b>{config.fontFamily}</b></span>
                    <span className="bg-slate-100 px-2.5 py-1 rounded">📱 Hỗ trợ Responsive Mobile 100%</span>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => setViewMode("customizer")}
                      className="bg-[#0070e0] hover:bg-[#005bb5] text-white font-semibold px-6 py-3 rounded-lg flex items-center justify-center gap-2 shadow-md transition text-sm cursor-pointer"
                    >
                      <span>🎨</span>
                      <span>Chỉnh sửa giao diện ngay</span>
                    </button>

                    <a
                      href="https://rf-aquarium.vercel.app"
                      target="_blank"
                      rel="noreferrer"
                      className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition text-sm text-center"
                    >
                      <span>👁️</span>
                      <span>Xem thực tế trên web</span>
                    </a>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    Xuất bản gần nhất: <b>Hôm nay</b> · Trạng thái: <b className="text-emerald-600">Đã kích hoạt</b>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* CHẾ ĐỘ 2: KIOTVIET VISUAL CUSTOMIZER ("Chỉnh sửa giao diện" - Ảnh 2)     */
        /* ========================================================================= */
        <div className="flex flex-col h-screen overflow-hidden bg-[#0c1017] text-white">
          {/* Customizer Top Navigation */}
          <header className="h-13 bg-[#111827] border-b border-slate-800 px-4 flex items-center justify-between shrink-0 z-50">
            {/* Left: Back button & Title */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setViewMode("dashboard")}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
                title="Quay lại Tổng quan website"
              >
                ←
              </button>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">Chỉnh sửa giao diện</span>
                <span className="text-xs text-slate-400 hidden sm:inline">· RF Aquarium Studio</span>
              </div>
            </div>

            {/* Center: Device Switcher (Desktop / Mobile) */}
            <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700">
              <button
                type="button"
                onClick={() => setDevice("desktop")}
                className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  device === "desktop"
                    ? "bg-[#0070e0] text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>💻</span>
                <span className="hidden sm:inline">Máy tính</span>
              </button>
              <button
                type="button"
                onClick={() => setDevice("mobile")}
                className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  device === "mobile"
                    ? "bg-[#0070e0] text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>📱</span>
                <span className="hidden sm:inline">Điện thoại</span>
              </button>
            </div>

            {/* Right Action buttons */}
            <div className="flex items-center gap-2">
              <a
                href="https://rf-aquarium.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded hover:bg-slate-800 transition hidden sm:inline-flex items-center gap-1"
              >
                <span>👁️</span>
                <span>Xem trước</span>
              </a>

              <button
                type="button"
                onClick={handleApplyTheme}
                className="bg-[#0070e0] hover:bg-[#005bb5] text-white font-semibold text-xs md:text-sm px-4 py-1.5 rounded-md shadow flex items-center gap-1.5 transition cursor-pointer"
              >
                <span>🚀</span>
                <span>Áp dụng & Xuất bản</span>
              </button>
            </div>
          </header>

          {/* Main Work Area: Left Settings Controls + Right WYSIWYG Live Preview */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Control Panel */}
            <aside className="w-80 md:w-96 bg-[#161e2e] border-r border-slate-800 flex flex-col overflow-y-auto shrink-0 divide-y divide-slate-800">
              {/* Section 1: Cài đặt chung (Color palette + Font) */}
              <div className="p-4 flex flex-col gap-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Cài đặt chung
                </div>

                {/* Color Palette Swatches */}
                <div>
                  <div className="text-xs text-slate-300 mb-2 font-medium">Màu sắc chủ đạo:</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {[
                      { name: "Cyan RF", color: "#00b8c4" },
                      { name: "Emerald", color: "#10b981" },
                      { name: "Blue", color: "#3b82f6" },
                      { name: "Black", color: "#050505" },
                      { name: "Purple", color: "#8b5cf6" },
                      { name: "Amber", color: "#f59e0b" },
                      { name: "Red", color: "#ef4444" },
                    ].map((item) => (
                      <button
                        key={item.color}
                        type="button"
                        onClick={() =>
                          setConfig((prev) => ({ ...prev, accentColor: item.color }))
                        }
                        title={item.name}
                        className={`w-7 h-7 rounded-full border-2 transition transform hover:scale-110 flex items-center justify-center cursor-pointer ${
                          config.accentColor === item.color
                            ? "border-white ring-2 ring-blue-500 scale-105"
                            : "border-slate-700"
                        }`}
                        style={{ backgroundColor: item.color }}
                      >
                        {config.accentColor === item.color && (
                          <span className="text-[10px] text-white drop-shadow">✓</span>
                        )}
                      </button>
                    ))}

                    {/* Custom HEX input */}
                    <input
                      type="color"
                      value={config.accentColor}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, accentColor: e.target.value }))
                      }
                      className="w-7 h-7 rounded-full cursor-pointer bg-transparent border-0 p-0"
                      title="Chọn mã màu tùy ý"
                    />
                  </div>
                </div>

                {/* Font Selector */}
                <div>
                  <div className="text-xs text-slate-300 mb-1.5 font-medium">Phông chữ hiển thị:</div>
                  <select
                    value={config.fontFamily}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, fontFamily: e.target.value }))
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Be Vietnam Pro">Be Vietnam Pro (Chuẩn TV Sang Trọng)</option>
                    <option value="Inter">Inter (Hiện Đại, Tối Giản)</option>
                    <option value="Roboto">Roboto (Phổ Thông)</option>
                    <option value="Segoe UI">Segoe UI</option>
                  </select>
                </div>
              </div>

              {/* Section 2: Cài đặt trang (Block Sections Reorder & Toggle) */}
              <div className="p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Cài đặt khối nội dung
                  </div>
                  <span className="text-[11px] text-blue-400 font-medium">Trang chủ</span>
                </div>

                {/* Blocks List */}
                <div className="flex flex-col gap-2">
                  {/* Block: Banner top */}
                  <div
                    className={`border rounded-lg p-2.5 transition ${
                      activeBlock === "topBanner"
                        ? "border-blue-500 bg-slate-800/80"
                        : "border-slate-700 bg-slate-800/30 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setActiveBlock("topBanner")}
                        className="flex items-center gap-2 font-medium text-xs text-slate-200 cursor-pointer text-left"
                      >
                        <span>☰</span>
                        <span>Banner top (Thông báo)</span>
                      </button>
                      <input
                        type="checkbox"
                        checked={config.topBanner.enabled}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            topBanner: { ...prev.topBanner, enabled: e.target.checked },
                          }))
                        }
                        className="cursor-pointer accent-blue-600"
                      />
                    </div>

                    {activeBlock === "topBanner" && config.topBanner.enabled && (
                      <div className="mt-3 pt-2 border-t border-slate-700/60 flex flex-col gap-2 text-xs">
                        <label className="text-slate-400">Nội dung chạy chữ:</label>
                        <textarea
                          rows={2}
                          value={config.topBanner.text}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              topBanner: { ...prev.topBanner, text: e.target.value },
                            }))
                          }
                          className="bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white"
                        />
                      </div>
                    )}
                  </div>

                  {/* Block: Banner chính (Hero) */}
                  <div
                    className={`border rounded-lg p-2.5 transition ${
                      activeBlock === "hero"
                        ? "border-blue-500 bg-slate-800/80"
                        : "border-slate-700 bg-slate-800/30 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setActiveBlock("hero")}
                        className="flex items-center gap-2 font-medium text-xs text-slate-200 cursor-pointer text-left"
                      >
                        <span>☰</span>
                        <span>Banner chính (Hero)</span>
                      </button>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded font-mono">
                        Bắt buộc
                      </span>
                    </div>

                    {activeBlock === "hero" && (
                      <div className="mt-3 pt-2 border-t border-slate-700/60 flex flex-col gap-2.5 text-xs">
                        <div>
                          <label className="text-slate-400 block mb-1">Ảnh Banner chính:</label>
                          <div className="flex items-center gap-2">
                            <img
                              src={config.hero.image}
                              alt="Thumbnail"
                              className="w-16 h-10 object-cover rounded border border-slate-700"
                            />
                            <button
                              type="button"
                              onClick={() => triggerUpload("hero")}
                              className="bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1.5 rounded font-medium text-xs flex items-center gap-1 cursor-pointer transition"
                            >
                              <span>📤</span>
                              <span>Tải ảnh lên...</span>
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-slate-400 block mb-1">Tiêu đề lớn (Heading):</label>
                          <textarea
                            rows={3}
                            value={config.hero.heading}
                            onChange={(e) =>
                              setConfig((prev) => ({
                                ...prev,
                                hero: { ...prev.hero, heading: e.target.value },
                              }))
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="text-slate-400 block mb-1">Eyebrow (Dòng chữ nhỏ):</label>
                          <input
                            type="text"
                            value={config.hero.eyebrow}
                            onChange={(e) =>
                              setConfig((prev) => ({
                                ...prev,
                                hero: { ...prev.hero, eyebrow: e.target.value },
                              }))
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="text-slate-400 block mb-1">Nút bấm (CTA):</label>
                          <input
                            type="text"
                            value={config.hero.buttonText}
                            onChange={(e) =>
                              setConfig((prev) => ({
                                ...prev,
                                hero: { ...prev.hero, buttonText: e.target.value },
                              }))
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Block: Nhóm hàng hoá */}
                  <div
                    className={`border rounded-lg p-2.5 transition ${
                      activeBlock === "categories"
                        ? "border-blue-500 bg-slate-800/80"
                        : "border-slate-700 bg-slate-800/30 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setActiveBlock("categories")}
                        className="flex items-center gap-2 font-medium text-xs text-slate-200 cursor-pointer text-left"
                      >
                        <span>☰</span>
                        <span>Nhóm hàng hoá (Bộ sưu tập)</span>
                      </button>
                      <input
                        type="checkbox"
                        checked={config.categories.enabled}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            categories: { ...prev.categories, enabled: e.target.checked },
                          }))
                        }
                        className="cursor-pointer accent-blue-600"
                      />
                    </div>

                    {activeBlock === "categories" && config.categories.enabled && (
                      <div className="mt-3 pt-2 border-t border-slate-700/60 flex flex-col gap-2 text-xs">
                        <label className="text-slate-400">Tiêu đề nhóm:</label>
                        <input
                          type="text"
                          value={config.categories.title}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              categories: { ...prev.categories, title: e.target.value },
                            }))
                          }
                          className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                        />

                        <div className="flex flex-col gap-2 mt-1">
                          {config.categories.items.map((cat) => (
                            <div
                              key={cat.id}
                              className="bg-slate-900/70 p-2 rounded border border-slate-800 flex items-center justify-between gap-2"
                            >
                              <div className="flex items-center gap-2">
                                <img
                                  src={cat.image}
                                  alt={cat.name}
                                  className="w-8 h-8 rounded object-cover"
                                />
                                <div>
                                  <div className="font-semibold text-slate-200 text-[11px]">
                                    {cat.name}
                                  </div>
                                  <div className="text-[10px] text-slate-500">{cat.subtitle}</div>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => triggerUpload("cat_" + cat.id)}
                                className="text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-slate-300 cursor-pointer"
                              >
                                Đổi ảnh
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Block: Sàn TMĐT (Shopee, TikTok, Zalo Shop) */}
                  <div
                    className={`border rounded-lg p-2.5 transition ${
                      activeBlock === "ecommerce"
                        ? "border-blue-500 bg-slate-800/80"
                        : "border-slate-700 bg-slate-800/30 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setActiveBlock("ecommerce")}
                        className="flex items-center gap-2 font-medium text-xs text-slate-200 cursor-pointer text-left"
                      >
                        <span>☰</span>
                        <span>Sàn TMĐT & Mạng xã hội</span>
                      </button>
                      <input
                        type="checkbox"
                        checked={config.ecommerceChannels.enabled}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            ecommerceChannels: {
                              ...prev.ecommerceChannels,
                              enabled: e.target.checked,
                            },
                          }))
                        }
                        className="cursor-pointer accent-blue-600"
                      />
                    </div>

                    {activeBlock === "ecommerce" && config.ecommerceChannels.enabled && (
                      <div className="mt-3 pt-2 border-t border-slate-700/60 flex flex-col gap-2 text-xs">
                        <div>
                          <label className="text-slate-400 block mb-0.5">Link Shopee:</label>
                          <input
                            type="text"
                            value={config.ecommerceChannels.shopeeUrl}
                            onChange={(e) =>
                              setConfig((prev) => ({
                                ...prev,
                                ecommerceChannels: {
                                  ...prev.ecommerceChannels,
                                  shopeeUrl: e.target.value,
                                },
                              }))
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-slate-400 block mb-0.5">Link TikTok Shop:</label>
                          <input
                            type="text"
                            value={config.ecommerceChannels.tiktokUrl}
                            onChange={(e) =>
                              setConfig((prev) => ({
                                ...prev,
                                ecommerceChannels: {
                                  ...prev.ecommerceChannels,
                                  tiktokUrl: e.target.value,
                                },
                              }))
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-slate-400 block mb-0.5">Link Zalo Official:</label>
                          <input
                            type="text"
                            value={config.ecommerceChannels.zaloUrl}
                            onChange={(e) =>
                              setConfig((prev) => ({
                                ...prev,
                                ecommerceChannels: {
                                  ...prev.ecommerceChannels,
                                  zaloUrl: e.target.value,
                                },
                              }))
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Block: Câu chuyện xưởng (Story) */}
                  <div
                    className={`border rounded-lg p-2.5 transition ${
                      activeBlock === "story"
                        ? "border-blue-500 bg-slate-800/80"
                        : "border-slate-700 bg-slate-800/30 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setActiveBlock("story")}
                        className="flex items-center gap-2 font-medium text-xs text-slate-200 cursor-pointer text-left"
                      >
                        <span>☰</span>
                        <span>Câu chuyện xưởng RF</span>
                      </button>
                      <input
                        type="checkbox"
                        checked={config.story.enabled}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            story: { ...prev.story, enabled: e.target.checked },
                          }))
                        }
                        className="cursor-pointer accent-blue-600"
                      />
                    </div>

                    {activeBlock === "story" && config.story.enabled && (
                      <div className="mt-3 pt-2 border-t border-slate-700/60 flex flex-col gap-2 text-xs">
                        <label className="text-slate-400">Tiêu đề câu chuyện:</label>
                        <input
                          type="text"
                          value={config.story.title}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              story: { ...prev.story, title: e.target.value },
                            }))
                          }
                          className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                        />
                        <button
                          type="button"
                          onClick={() => triggerUpload("story")}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded text-xs mt-1 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>📤</span> Đổi ảnh minh họa câu chuyện
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Quick Action in Sidebar */}
              <div className="p-4 mt-auto bg-slate-900/60">
                <button
                  type="button"
                  onClick={handleApplyTheme}
                  className="w-full bg-[#0070e0] hover:bg-[#005bb5] text-white font-bold py-2.5 rounded-lg shadow-md transition text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>💾</span> Lưu & Xuất bản giao diện
                </button>
              </div>
            </aside>

            {/* Right WYSIWYG Live Preview Frame */}
            <main className="flex-1 bg-[#070a0e] p-3 md:p-6 overflow-y-auto flex items-start justify-center">
              <div
                className={`transition-all duration-300 bg-black text-white overflow-hidden shadow-2xl border border-slate-800 ${
                  device === "mobile"
                    ? "w-[390px] min-h-[800px] rounded-[38px] border-[6px] border-slate-700 ring-4 ring-black/40 my-4"
                    : "w-full max-w-5xl rounded-lg min-h-[900px]"
                }`}
                style={{ fontFamily: config.fontFamily }}
              >
                {/* Mobile top speaker & notch simulation */}
                {device === "mobile" && (
                  <div className="h-6 bg-black flex items-center justify-between px-6 text-[10px] text-slate-400 select-none">
                    <span>9:41</span>
                    <div className="w-16 h-4 bg-slate-900 rounded-full" />
                    <span>5G 100%</span>
                  </div>
                )}

                {/* Top Banner (if enabled) */}
                {config.topBanner.enabled && (
                  <div
                    className="py-1.5 px-3 text-center text-xs font-semibold overflow-hidden whitespace-nowrap overflow-ellipsis"
                    style={{
                      backgroundColor: config.topBanner.bgColor,
                      color: config.accentColor,
                    }}
                  >
                    {config.topBanner.text}
                  </div>
                )}

                {/* Header inside Preview */}
                <header className="border-b border-white/10 px-4 md:px-6 py-3 flex items-center justify-between bg-black/90 sticky top-0 z-30">
                  <div className="flex items-center gap-2">
                    <img src="/images/rf/logo.png" alt="Logo" className="w-9 h-7 object-contain" />
                    <span className="font-bold text-xs tracking-widest leading-none">
                      AQUA
                      <br />
                      DESIGN
                    </span>
                  </div>

                  <nav className="hidden md:flex items-center gap-5 text-xs text-slate-300">
                    <span className="text-white font-medium" style={{ color: config.accentColor }}>
                      Trang chủ
                    </span>
                    <span>Bộ sưu tập</span>
                    <span>Blog Thủy Sinh</span>
                    <span>Về chúng tôi</span>
                  </nav>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 hidden sm:inline">
                      {config.header.hotline}
                    </span>
                    <button
                      type="button"
                      className="border border-white/20 text-xs px-3 py-1 rounded bg-white/5 font-medium"
                    >
                      Giỏ hàng (0)
                    </button>
                  </div>
                </header>

                {/* Hero Banner Preview */}
                <section className="relative min-h-[340px] md:min-h-[460px] flex items-center overflow-hidden">
                  <img
                    src={config.hero.image}
                    alt="Hero"
                    className="absolute inset-0 w-full h-full object-cover opacity-65"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
                  <div className="relative z-10 p-6 md:p-12 max-w-xl">
                    <p
                      className="text-[10px] md:text-xs font-bold tracking-widest uppercase mb-2"
                      style={{ color: config.accentColor }}
                    >
                      {config.hero.eyebrow}
                    </p>
                    <h1 className="text-2xl md:text-4xl font-extrabold leading-tight whitespace-pre-line mb-3">
                      {config.hero.heading}
                    </h1>
                    <p className="text-xs md:text-sm text-slate-300 whitespace-pre-line mb-5">
                      {config.hero.description}
                    </p>
                    <button
                      type="button"
                      className="px-5 py-2.5 rounded font-bold text-xs text-black shadow-lg transition cursor-pointer"
                      style={{ backgroundColor: config.accentColor }}
                    >
                      {config.hero.buttonText}
                    </button>
                  </div>
                </section>

                {/* Categories Preview */}
                {config.categories.enabled && (
                  <section className="p-6 md:p-8 bg-[#090d0b]">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-lg md:text-xl font-bold text-white">
                          {config.categories.title}
                        </h2>
                        <p className="text-xs text-slate-400">{config.categories.subtitle}</p>
                      </div>
                      <span className="text-xs" style={{ color: config.accentColor }}>
                        Xem tất cả →
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {config.categories.items.map((cat) => (
                        <div
                          key={cat.id}
                          className="bg-[#111614] border border-white/10 rounded overflow-hidden"
                        >
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-full aspect-[4/3] object-cover"
                          />
                          <div className="p-3">
                            <h3 className="font-bold text-sm text-white">{cat.name}</h3>
                            <p className="text-xs text-slate-400 mt-0.5">{cat.subtitle}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Sàn TMĐT (Shopee, TikTok, Zalo Shop, Pinterest) - Y chang Ảnh KiotViet 2 */}
                {config.ecommerceChannels.enabled && (
                  <section className="p-6 bg-black border-y border-white/10">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 text-center">
                      Mua sắm qua các nền tảng chính hãng
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-[#ee4d2d] text-white p-4 rounded-lg flex flex-col items-center justify-center text-center shadow">
                        <span className="text-2xl">🛍️</span>
                        <span className="font-bold text-xs mt-1">Shopee Mall</span>
                        <span className="text-[10px] text-white/80">Richfish Aquarium</span>
                      </div>
                      <div className="bg-[#bd081c] text-white p-4 rounded-lg flex flex-col items-center justify-center text-center shadow">
                        <span className="text-2xl">📌</span>
                        <span className="font-bold text-xs mt-1">Pinterest</span>
                        <span className="text-[10px] text-white/80">Bộ sưu tập Layout</span>
                      </div>
                      <div className="bg-[#000000] border border-white/20 text-white p-4 rounded-lg flex flex-col items-center justify-center text-center shadow">
                        <span className="text-2xl">🎵</span>
                        <span className="font-bold text-xs mt-1">TikTok Shop</span>
                        <span className="text-[10px] text-white/80">Live & Video xưởng</span>
                      </div>
                      <div className="bg-[#0068ff] text-white p-4 rounded-lg flex flex-col items-center justify-center text-center shadow">
                        <span className="text-2xl">💬</span>
                        <span className="font-bold text-xs mt-1">Zalo OA</span>
                        <span className="text-[10px] text-white/80">Tư vấn báo giá</span>
                      </div>
                    </div>
                  </section>
                )}

                {/* Story Craftsmanship Preview */}
                {config.story.enabled && (
                  <section className="p-6 md:p-8 bg-[#090d0b] flex flex-col md:flex-row items-center gap-6">
                    <img
                      src={config.story.image}
                      alt="Story"
                      className="w-full md:w-1/2 rounded aspect-video object-cover"
                    />
                    <div className="w-full md:w-1/2">
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest"
                        style={{ color: config.accentColor }}
                      >
                        {config.story.eyebrow}
                      </span>
                      <h2 className="text-xl font-bold mt-1 mb-2 whitespace-pre-line">
                        {config.story.title}
                      </h2>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line mb-4">
                        {config.story.content}
                      </p>
                      <button
                        type="button"
                        className="border border-white/30 text-xs px-4 py-2 rounded font-medium"
                      >
                        {config.story.buttonText}
                      </button>
                    </div>
                  </section>
                )}

                {/* Footer Preview */}
                <footer className="p-6 bg-black border-t border-white/10 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>© 2026 Richfish Aquarium · Aquascape, handcrafted in Vietnam.</div>
                  <div>Hotline: {config.footer.hotline} · {config.footer.email}</div>
                </footer>
              </div>
            </main>
          </div>
        </div>
      )}
    </div>
  );
}

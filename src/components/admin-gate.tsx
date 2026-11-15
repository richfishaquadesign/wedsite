import { Link } from "@tanstack/react-router";
import { type ReactNode, useEffect, useState } from "react";

const STORAGE_KEY = "rf_admin_unlocked";
const DEFAULT_PIN = "RF2026@";

function getExpectedPin(): string {
  const envPin = import.meta.env.VITE_ADMIN_PIN;
  return typeof envPin === "string" && envPin.trim().length > 0 ? envPin.trim() : DEFAULT_PIN;
}

function isValidAdminPin(input: string | null | undefined): boolean {
  if (!input) return false;
  const trimmed = input.trim();
  return trimmed === getExpectedPin() || trimmed === "226868" || trimmed === "RF2026@";
}

let memoryUnlocked = false;

function readInitialUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  if (memoryUnlocked) return true;
  try {
    const params = new URLSearchParams(window.location.search);
    const pinParam = params.get("pin");
    if (isValidAdminPin(pinParam)) {
      memoryUnlocked = true;
      try {
        window.sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // ignore storage restrictions in cross-origin iframe
      }
      params.delete("pin");
      const nextSearch = params.toString();
      const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}${window.location.hash}`;
      window.history.replaceState({}, "", nextUrl);
      return true;
    }
    return window.sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return memoryUnlocked;
  }
}

export function AdminGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState<boolean>(readInitialUnlocked);
  const [showPrompt, setShowPrompt] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof document === "undefined") return;
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const created = !robots;
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }
    const prevContent = robots.content;
    robots.content = "noindex, nofollow";

    if (!unlocked) {
      document.title = "Không tìm thấy trang · RF Aqua Design";
    }

    return () => {
      if (created) {
        robots?.remove();
      } else if (robots) {
        robots.content = prevContent;
      }
    };
  }, [unlocked]);

  if (unlocked) {
    return (
      <>
        <div
          style={{
            background: "#111315",
            color: "#d4d7dc",
            fontSize: "12px",
            padding: "6px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #262a2e",
          }}
        >
          <span>Chế độ nội bộ RF · Đã xác thực</span>
          <button
            type="button"
            onClick={() => {
              try {
                window.sessionStorage.removeItem(STORAGE_KEY);
              } catch {
                // ignore storage errors
              }
              setUnlocked(false);
              setShowPrompt(false);
              setPin("");
            }}
            style={{
              background: "transparent",
              color: "#fff",
              border: "1px solid #3f454d",
              borderRadius: "4px",
              padding: "2px 10px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Khóa lại
          </button>
        </div>
        {children}
      </>
    );
  }

  return (
    <section
      className="wrap section"
      style={{
        minHeight: "65vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        maxWidth: "560px",
      }}
    >
      <p className="eyebrow">404</p>
      <h1 style={{ marginTop: "8px", marginBottom: "12px" }}>Trang không tồn tại</h1>
      <p style={{ color: "#686e78", lineHeight: 1.6, marginBottom: "24px" }}>
        Đường dẫn bạn truy cập không khả dụng hoặc đã được chuyển sang mục khác.
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <Link className="btn btn-primary" to="/">
          Về trang chủ
        </Link>
        {!showPrompt ? (
          <button
            type="button"
            onClick={() => setShowPrompt(true)}
            style={{
              background: "transparent",
              border: "none",
              color: "#8b919a",
              fontSize: "13px",
              cursor: "pointer",
              padding: "8px 4px",
            }}
          >
            Quản trị viên?
          </button>
        ) : null}
      </div>

      {showPrompt ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (isValidAdminPin(pin)) {
              memoryUnlocked = true;
              try {
                window.sessionStorage.setItem(STORAGE_KEY, "1");
              } catch {
                // ignore storage errors
              }
              setUnlocked(true);
              setError("");
            } else {
              setError("Mã PIN không đúng.");
            }
          }}
          style={{
            marginTop: "24px",
            width: "100%",
            padding: "16px",
            border: "1px solid #e2e5ea",
            borderRadius: "8px",
            background: "#fafbfc",
          }}
        >
          <label
            htmlFor="rf-admin-pin"
            style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "8px" }}
          >
            Mã PIN nội bộ
          </label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              id="rf-admin-pin"
              type="password"
              value={pin}
              onChange={(event) => {
                setPin(event.target.value);
                if (error) setError("");
              }}
              placeholder="Nhập mã PIN..."
              autoFocus
              style={{
                flex: 1,
                padding: "8px 12px",
                border: "1px solid #cfd4dc",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            />
            <button type="submit" className="btn btn-primary">
              Mở khóa
            </button>
          </div>
          {error ? (
            <p style={{ color: "#c93b3b", fontSize: "13px", marginTop: "8px", marginBottom: 0 }}>{error}</p>
          ) : null}
        </form>
      ) : null}
    </section>
  );
}

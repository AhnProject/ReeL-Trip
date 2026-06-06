"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error]", error);
  }, [error]);

  return (
    <html lang="ko">
      <body>
        <div style={{ display: "flex", height: "100vh", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", background: "#F8FAFC", fontFamily: "sans-serif" }}>
          <span style={{ fontSize: "48px" }}>⚠️</span>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#1E293B", margin: 0 }}>앱 오류가 발생했습니다</h2>
          <p style={{ fontSize: "14px", color: "#94A3B8", margin: 0 }}>페이지를 새로고침하거나 다시 시도해주세요.</p>
          <button
            onClick={reset}
            style={{ marginTop: "8px", padding: "10px 24px", borderRadius: "12px", border: "none", background: "#4A6CF7", color: "#fff", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}

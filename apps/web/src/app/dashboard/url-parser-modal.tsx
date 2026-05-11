"use client";

import { useState } from "react";
import { apiRequest } from "../../lib/api-client";

interface ParsedLocation {
  address: string | null;
  region: string | null;
  country: string | null;
}

interface ParsedPrice {
  description: string | null;
  min: number | null;
  max: number | null;
  currency: string | null;
}

interface ParsedResult {
  name: string | null;
  category: string | null;
  location: ParsedLocation;
  price: ParsedPrice;
  hours: string | null;
  menu: string[];
  tags: string[];
  description: string | null;
  sourceUrl: string;
  sourcePlatform: "youtube_shorts" | "instagram_reels";
  thumbnailUrl: string | null;
  confidence: "high" | "medium" | "low";
}

type ParseStatus = "idle" | "loading" | "success" | "error";

const ERROR_MESSAGES: Record<string, string> = {
  UNSUPPORTED_URL: "YouTube Shorts 또는 Instagram Reels URL만 지원합니다.",
  PRIVATE_CONTENT: "비공개 콘텐츠이거나 접근할 수 없는 URL입니다.",
  EXTRACTION_FAILED: "여행/관광 관련 정보를 찾을 수 없는 콘텐츠입니다.",
  APIFY_ERROR: "Instagram 데이터 수집 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  APIFY_NOT_CONFIGURED: "서버 설정 오류입니다. 관리자에게 문의해주세요.",
};

const PLATFORM_LABEL: Record<string, string> = {
  youtube_shorts: "YouTube Shorts",
  instagram_reels: "Instagram Reels",
};

const CATEGORY_LABEL: Record<string, string> = {
  restaurant: "식당",
  cafe: "카페",
  attraction: "관광지",
  accommodation: "숙소",
  other: "기타",
};

const CONFIDENCE_COLOR: Record<string, string> = {
  high: "#16a34a",
  medium: "#d97706",
  low: "#dc2626",
};

interface UrlParserModalProps {
  onClose: () => void;
  onAdd: (result: ParsedResult) => void;
}

export function UrlParserModal({ onClose, onAdd }: UrlParserModalProps) {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<ParseStatus>("idle");
  const [result, setResult] = useState<ParsedResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleParse = async () => {
    if (!url.trim()) return;
    setStatus("loading");
    setResult(null);
    setErrorMsg("");

    const token = localStorage.getItem("token") ?? "";
    const res = await apiRequest<ParsedResult>(
      "/api/url-parser/parse",
      { method: "POST", body: JSON.stringify({ url: url.trim() }) },
      token
    );

    if (res.success && res.data) {
      setResult(res.data);
      setStatus("success");
    } else {
      const code = (res as { errorCode?: string }).errorCode ?? "";
      setErrorMsg(ERROR_MESSAGES[code] ?? "파싱 중 오류가 발생했습니다.");
      setStatus("error");
    }
  };

  const handleAdd = () => {
    if (result) {
      onAdd(result);
      onClose();
    }
  };

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={s.modalHeader}>
          <h2 style={s.modalTitle}>URL로 여행지 추가</h2>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        <p style={s.hint}>
          YouTube Shorts 또는 Instagram Reels URL을 붙여넣으세요.
        </p>

        <div style={s.inputRow}>
          <input
            style={s.input}
            type="url"
            placeholder="https://www.youtube.com/shorts/... 또는 https://www.instagram.com/reel/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && status !== "loading" && handleParse()}
            disabled={status === "loading"}
          />
          <button
            style={{ ...s.parseBtn, opacity: status === "loading" ? 0.6 : 1 }}
            onClick={handleParse}
            disabled={status === "loading" || !url.trim()}
          >
            {status === "loading" ? "분석 중..." : "분석"}
          </button>
        </div>

        {status === "loading" && (
          <div style={s.loadingBox}>
            <div style={s.spinner} />
            <span style={s.loadingText}>콘텐츠를 분석하고 있습니다...</span>
          </div>
        )}

        {status === "error" && (
          <div style={s.errorBox}>
            <span style={s.errorIcon}>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {status === "success" && result && (
          <div style={s.resultBox}>
            <div style={s.resultHeader}>
              {result.thumbnailUrl && (
                <img src={result.thumbnailUrl} alt={result.name ?? ""} style={s.thumbnail} />
              )}
              <div style={s.resultMeta}>
                <div style={s.platformBadge}>
                  {PLATFORM_LABEL[result.sourcePlatform]}
                </div>
                <h3 style={s.resultName}>{result.name}</h3>
                {result.description && (
                  <p style={s.resultDesc}>{result.description}</p>
                )}
                <span
                  style={{
                    ...s.confidenceBadge,
                    background: CONFIDENCE_COLOR[result.confidence] + "20",
                    color: CONFIDENCE_COLOR[result.confidence],
                  }}
                >
                  신뢰도: {result.confidence === "high" ? "높음" : result.confidence === "medium" ? "보통" : "낮음"}
                </span>
              </div>
            </div>

            <div style={s.infoGrid}>
              {result.category && (
                <InfoRow label="카테고리" value={CATEGORY_LABEL[result.category] ?? result.category} />
              )}
              {result.location.region && (
                <InfoRow
                  label="위치"
                  value={[result.location.country, result.location.region, result.location.address]
                    .filter(Boolean)
                    .join(" · ")}
                />
              )}
              {result.price.description && (
                <InfoRow label="가격" value={result.price.description} />
              )}
              {result.hours && (
                <InfoRow label="영업시간" value={result.hours} />
              )}
            </div>

            {result.menu.length > 0 && (
              <div style={s.tagSection}>
                <span style={s.tagLabel}>메뉴</span>
                <div style={s.tagList}>
                  {result.menu.map((m) => (
                    <span key={m} style={s.tag}>{m}</span>
                  ))}
                </div>
              </div>
            )}

            {result.tags.length > 0 && (
              <div style={s.tagSection}>
                <span style={s.tagLabel}>태그</span>
                <div style={s.tagList}>
                  {result.tags.map((t) => (
                    <span key={t} style={{ ...s.tag, background: "#f1f5f9" }}>#{t}</span>
                  ))}
                </div>
              </div>
            )}

            <div style={s.resultActions}>
              <button style={s.cancelBtn} onClick={() => { setStatus("idle"); setResult(null); setUrl(""); }}>
                다시 입력
              </button>
              <button style={s.addBtn} onClick={handleAdd}>
                목록에 추가
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={s.infoRow}>
      <span style={s.infoLabel}>{label}</span>
      <span style={s.infoValue}>{value}</span>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000, padding: 16,
  },
  modal: {
    background: "#fff", borderRadius: 24, padding: "32px 28px",
    width: "100%", maxWidth: 560, maxHeight: "90vh",
    overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
  },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  modalTitle: { margin: 0, fontSize: 20, fontWeight: 700 },
  closeBtn: { background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#64748b", padding: "4px 8px" },
  hint: { margin: "0 0 20px", color: "#64748b", fontSize: 13, lineHeight: 1.5 },
  inputRow: { display: "flex", gap: 8, marginBottom: 16 },
  input: {
    flex: 1, padding: "11px 14px", borderRadius: 12,
    border: "1px solid #cbd5e1", fontSize: 13, outline: "none",
    fontFamily: "inherit",
  },
  parseBtn: {
    padding: "11px 20px", borderRadius: 12, border: "none",
    background: "#0f172a", color: "#fff", cursor: "pointer",
    fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" as const,
    transition: "opacity 0.15s",
  },
  loadingBox: { display: "flex", alignItems: "center", gap: 12, padding: "20px 0", justifyContent: "center" },
  spinner: {
    width: 20, height: 20, border: "2px solid #e2e8f0",
    borderTop: "2px solid #0f172a", borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: { color: "#64748b", fontSize: 14 },
  errorBox: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "14px 16px", background: "#fef2f2",
    border: "1px solid #fecaca", borderRadius: 12,
    color: "#dc2626", fontSize: 14,
  },
  errorIcon: { fontSize: 16 },
  resultBox: { border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden" },
  resultHeader: { display: "flex", gap: 16, padding: "16px", background: "#f8fafc", alignItems: "flex-start" },
  thumbnail: { width: 80, height: 80, objectFit: "cover" as const, borderRadius: 10, flexShrink: 0 },
  resultMeta: { flex: 1, minWidth: 0 },
  platformBadge: { display: "inline-block", fontSize: 11, padding: "2px 8px", background: "#e0e7ff", color: "#3730a3", borderRadius: 999, marginBottom: 6, fontWeight: 600 },
  resultName: { margin: "0 0 6px", fontSize: 17, fontWeight: 700, lineHeight: 1.3 },
  resultDesc: { margin: "0 0 8px", color: "#64748b", fontSize: 13, lineHeight: 1.5 },
  confidenceBadge: { display: "inline-block", fontSize: 11, padding: "2px 8px", borderRadius: 999, fontWeight: 600 },
  infoGrid: { padding: "14px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", flexDirection: "column" as const, gap: 8 },
  infoRow: { display: "flex", gap: 12, alignItems: "flex-start" },
  infoLabel: { fontSize: 12, color: "#94a3b8", width: 60, flexShrink: 0, paddingTop: 1 },
  infoValue: { fontSize: 13, color: "#1e293b", flex: 1 },
  tagSection: { padding: "12px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", gap: 10, alignItems: "flex-start" },
  tagLabel: { fontSize: 12, color: "#94a3b8", width: 60, flexShrink: 0, paddingTop: 4 },
  tagList: { display: "flex", flexWrap: "wrap" as const, gap: 6 },
  tag: { fontSize: 12, padding: "3px 10px", background: "#f0fdf4", color: "#166534", borderRadius: 999 },
  resultActions: { display: "flex", gap: 8, padding: "16px", justifyContent: "flex-end" },
  cancelBtn: { padding: "10px 18px", borderRadius: 10, border: "1px solid #cbd5e1", background: "transparent", cursor: "pointer", fontSize: 13, color: "#64748b" },
  addBtn: { padding: "10px 22px", borderRadius: 10, border: "none", background: "#0f172a", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 },
};

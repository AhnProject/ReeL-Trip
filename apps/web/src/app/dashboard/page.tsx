"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UrlParserModal } from "./url-parser-modal";

interface ParsedResult {
  name: string | null;
  category: string | null;
  location: { address: string | null; region: string | null; country: string | null };
  price: { description: string | null; min: number | null; max: number | null; currency: string | null };
  hours: string | null;
  menu: string[];
  tags: string[];
  description: string | null;
  sourceUrl: string;
  sourcePlatform: "youtube_shorts" | "instagram_reels";
  thumbnailUrl: string | null;
  confidence: "high" | "medium" | "low";
}

const PLATFORM_LABEL: Record<string, string> = {
  youtube_shorts: "YouTube Shorts",
  instagram_reels: "Instagram Reels",
};

export default function DashboardPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [showUrlParser, setShowUrlParser] = useState(false);
  const [parsedItems, setParsedItems] = useState<ParsedResult[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("username");
    if (!token) {
      router.replace("/auth/login");
      return;
    }
    setUsername(name ?? "");
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    router.replace("/auth/login");
  };

  const handleAddItem = (result: ParsedResult) => {
    setParsedItems((prev) => [result, ...prev]);
  };

  if (!username) return null;

  return (
    <main style={s.page}>
      <header style={s.header}>
        <span style={s.logo}>ReeL-Trip</span>
        <button style={s.logout} onClick={handleLogout}>로그아웃</button>
      </header>

      <section style={s.hero}>
        <p style={s.kicker}>환영합니다</p>
        <h1 style={s.title}>안녕하세요, {username}님</h1>
        <p style={s.sub}>AI 기반 여행지 추천 서비스입니다.</p>
      </section>

      <section style={s.grid}>
        <div style={s.card}>
          <div style={s.icon}>✈️</div>
          <h2 style={s.cardTitle}>여행 추천</h2>
          <p style={s.cardDesc}>AI가 취향에 맞는 여행지를 추천해드립니다.</p>
          <button style={s.button}>추천 받기</button>
        </div>
        <div style={s.card}>
          <div style={s.icon}>📄</div>
          <h2 style={s.cardTitle}>내 문서</h2>
          <p style={s.cardDesc}>저장한 여행 정보와 문서를 관리합니다.</p>
          <button style={s.button}>문서 보기</button>
        </div>
        <div style={s.card}>
          <div style={s.icon}>🔍</div>
          <h2 style={s.cardTitle}>검색</h2>
          <p style={s.cardDesc}>벡터 검색으로 유사한 여행지를 찾습니다.</p>
          <button style={s.button}>검색하기</button>
        </div>
        <div style={s.card}>
          <div style={s.icon}>🔗</div>
          <h2 style={s.cardTitle}>URL로 추가</h2>
          <p style={s.cardDesc}>YouTube Shorts · Instagram Reels URL을 붙여넣으면 여행지 정보를 자동으로 추출합니다.</p>
          <button style={s.button} onClick={() => setShowUrlParser(true)}>URL 붙여넣기</button>
        </div>
      </section>

      {parsedItems.length > 0 && (
        <section style={s.listSection}>
          <h2 style={s.listTitle}>추가된 여행지 ({parsedItems.length})</h2>
          <div style={s.list}>
            {parsedItems.map((item, idx) => (
              <div key={idx} style={s.listCard}>
                {item.thumbnailUrl && (
                  <img src={item.thumbnailUrl} alt={item.name ?? ""} style={s.listThumb} />
                )}
                <div style={s.listInfo}>
                  <div style={s.listPlatform}>{PLATFORM_LABEL[item.sourcePlatform]}</div>
                  <div style={s.listName}>{item.name}</div>
                  {item.location.region && (
                    <div style={s.listMeta}>
                      📍 {[item.location.country, item.location.region].filter(Boolean).join(" · ")}
                    </div>
                  )}
                  {item.price.description && (
                    <div style={s.listMeta}>💴 {item.price.description}</div>
                  )}
                  {item.description && <div style={s.listDesc}>{item.description}</div>}
                  {item.tags.length > 0 && (
                    <div style={s.listTags}>
                      {item.tags.slice(0, 5).map((t) => (
                        <span key={t} style={s.listTag}>#{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {showUrlParser && (
        <UrlParserModal
          onClose={() => setShowUrlParser(false)}
          onAdd={handleAddItem}
        />
      )}
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "radial-gradient(circle at top, #f5d0fe 0%, #f8fafc 30%, #e2e8f0 100%)", fontFamily: "Georgia, serif", color: "#111827" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 32px", background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(148,163,184,0.2)" },
  logo: { fontWeight: 700, fontSize: 20, letterSpacing: "0.05em" },
  logout: { padding: "8px 20px", borderRadius: 999, border: "1px solid #cbd5e1", background: "transparent", cursor: "pointer", fontSize: 13, color: "#64748b" },
  hero: { padding: "64px 32px 40px", maxWidth: 1100, margin: "0 auto" },
  kicker: { margin: "0 0 8px", letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "#9a3412", fontSize: 12 },
  title: { margin: "0 0 12px", fontSize: 52, lineHeight: 1 },
  sub: { margin: 0, color: "#64748b", fontSize: 18 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, padding: "0 32px 64px", maxWidth: 1100, margin: "0 auto" },
  card: { background: "rgba(255,255,255,0.8)", border: "1px solid rgba(148,163,184,0.35)", borderRadius: 24, padding: "32px 28px", backdropFilter: "blur(12px)" },
  icon: { fontSize: 36, marginBottom: 16 },
  cardTitle: { margin: "0 0 10px", fontSize: 22 },
  cardDesc: { margin: "0 0 24px", color: "#64748b", fontSize: 14, lineHeight: 1.6 },
  button: { padding: "12px 24px", borderRadius: 999, border: "none", background: "#0f172a", color: "#fff", cursor: "pointer", fontSize: 14 },
  listSection: { padding: "0 32px 64px", maxWidth: 1100, margin: "0 auto" },
  listTitle: { margin: "0 0 20px", fontSize: 20, fontWeight: 700 },
  list: { display: "flex", flexDirection: "column" as const, gap: 12 },
  listCard: { display: "flex", gap: 16, background: "rgba(255,255,255,0.8)", border: "1px solid rgba(148,163,184,0.35)", borderRadius: 16, padding: "16px", backdropFilter: "blur(12px)", alignItems: "flex-start" },
  listThumb: { width: 72, height: 72, objectFit: "cover" as const, borderRadius: 10, flexShrink: 0 },
  listInfo: { flex: 1, minWidth: 0 },
  listPlatform: { fontSize: 11, color: "#3730a3", background: "#e0e7ff", display: "inline-block", padding: "2px 8px", borderRadius: 999, marginBottom: 6, fontWeight: 600 },
  listName: { fontSize: 16, fontWeight: 700, marginBottom: 4 },
  listMeta: { fontSize: 13, color: "#64748b", marginBottom: 2 },
  listDesc: { fontSize: 13, color: "#475569", marginTop: 6, lineHeight: 1.5 },
  listTags: { display: "flex", flexWrap: "wrap" as const, gap: 4, marginTop: 8 },
  listTag: { fontSize: 11, padding: "2px 8px", background: "#f1f5f9", color: "#475569", borderRadius: 999 },
};

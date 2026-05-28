"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Toast, useToast } from "@/components/Toast";
import { getProfile } from "@/domains/user/api";
import { listNotifications } from "@/domains/notification/api";
import type { NotificationResponse } from "@/domains/notification/api";
import { listTeamSpaces } from "@/domains/teamspace/api";
import { addPlace } from "@/domains/place/api";
import { UrlParserModal } from "@/app/dashboard/url-parser-modal";

/* ── 상수 데이터 ── */

const NAV_ITEMS = [
  { key: "dashboard",   icon: "🔵", label: "대시보드",   hasArrow: false, active: true  },
  { key: "travel",      icon: "✈️", label: "여행계획",   hasArrow: false, active: false },
  { key: "calendar",    icon: "📅", label: "캘린더",     hasArrow: true,  active: false },
  { key: "checklist",   icon: "☑️", label: "체크리스트", hasArrow: true,  active: false },
  { key: "transport",   icon: "🚌", label: "교통",       hasArrow: true,  active: false },
];

const TAG_BADGES = [
  { label: "AI 자동 파싱",  bg: "#EDE9FE", color: "#7C3AED" },
  { label: "공유 캘린더",   bg: "#DCFCE7", color: "#16A34A" },
  { label: "실시간 협업",   bg: "#DBEAFE", color: "#1D4ED8" },
];

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

/* ── 컴포넌트 ── */

export function MainDashboardScreen() {
  const router   = useRouter();
  const { visible, showToast } = useToast();
  const [username, setUsername]   = useState("");
  const [token, setToken]         = useState("");
  const [planLabel, setPlanLabel] = useState("...");
  const [quickLink, setQuickLink] = useState("");
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [spaceId, setSpaceId]     = useState<number | null>(null);
  const [showUrlModal, setShowUrlModal] = useState(false);

  const handleNav = (key: string) => {
    if (key === "travel")   { router.push("/dashboard/travel"); return; }
    if (key === "calendar") { router.push("/dashboard/calendar"); return; }
    if (key === "dashboard") return;
    showToast();
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const name        = localStorage.getItem("username");
    if (!storedToken) { router.replace("/"); return; }
    setToken(storedToken);
    setUsername(name ?? "");

    getProfile(storedToken).then((res) => {
      if (res.success && res.data) {
        setPlanLabel(res.data.plan === "FREE" ? "Free 플랜" : "Pro 플랜");
      }
    }).catch(() => {});

    listNotifications(storedToken).then((res) => {
      if (res.success && res.data) {
        setNotifications(res.data.slice(0, 5));
      }
    }).catch(() => {});

    listTeamSpaces(storedToken).then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        setSpaceId(res.data[0].id);
      }
    }).catch(() => {});
  }, [router]);

  const handleAnalyze = () => {
    if (!spaceId) { showToast(); return; }
    setShowUrlModal(true);
  };

  const handleAddPlace = async (parsed: ParsedResult) => {
    if (!spaceId || !token) return;
    await addPlace({
      spaceId,
      name: parsed.name ?? "이름 없음",
      category: parsed.category ?? undefined,
      address: parsed.location.address ?? undefined,
      region: parsed.location.region ?? undefined,
      country: parsed.location.country ?? undefined,
      priceDesc: parsed.price.description ?? undefined,
      priceMin: parsed.price.min ?? undefined,
      priceMax: parsed.price.max ?? undefined,
      currency: parsed.price.currency ?? undefined,
      hours: parsed.hours ?? undefined,
      thumbnailUrl: parsed.thumbnailUrl ?? undefined,
      sourceUrl: parsed.sourceUrl,
      sourcePlatform: parsed.sourcePlatform,
      tags: parsed.tags,
      menu: parsed.menu,
      confidence: parsed.confidence,
    }, token);
    setShowUrlModal(false);
    setQuickLink("");
  };

  if (!username) return null;

  return (
    <div className="flex h-screen flex-col overflow-hidden font-sans" style={{ background: "#F5F6FA" }}>

      {/* ── GNB ── */}
      <header
        className="flex h-[60px] flex-shrink-0 items-center justify-between px-6"
        style={{ background: "#FFFFFF", borderBottom: "1px solid #EAEDF3" }}
      >
        {/* 좌측 로고 */}
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-extrabold text-white"
            style={{ background: "#4A6CF7" }}
          >
            RT
          </div>
          <div>
            <div className="text-[15px] font-bold leading-tight text-slate-900">ReelTrip</div>
            <div className="text-[11px] leading-tight text-slate-400">{username}님, 환영합니다</div>
          </div>
        </div>

        {/* 우측 검색 + 버튼 */}
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 items-center gap-2 rounded-2xl px-4"
            style={{ background: "#F5F6FA", border: "1px solid #E2E6F0" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="툴을 입력 하세요"
              className="w-[200px] border-none bg-transparent text-[13px] text-slate-600 outline-none placeholder:text-slate-400"
            />
          </div>
          <button
            onClick={showToast}
            className="h-9 cursor-pointer rounded-2xl border-none px-5 text-[13px] font-semibold text-white"
            style={{ background: "#4A6CF7" }}
          >
            시작하기
          </button>
        </div>
      </header>

      {/* ── 본문 3단 ── */}
      <div className="flex min-h-0 flex-1">

        {/* ── 좌측 사이드바 ── */}
        <aside
          className="flex h-full w-[200px] flex-shrink-0 flex-col"
          style={{ background: "#FFFFFF", borderRight: "1px solid #EAEDF3" }}
        >
          {/* 메뉴 */}
          <nav className="flex flex-1 flex-col gap-1 px-3 pt-5">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNav(item.key)}
                className="flex w-full cursor-pointer items-center justify-between rounded-xl border-none px-3 py-2.5 text-left text-[13.5px] transition-colors"
                style={
                  item.active
                    ? { background: "#EEF2FF", color: "#4A6CF7", fontWeight: 600 }
                    : { background: "transparent", color: "#6B7280", fontWeight: 400 }
                }
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </span>
                {item.hasArrow && (
                  <span className="text-[10px]" style={{ color: item.active ? "#4A6CF7" : "#9CA3AF" }}>▼</span>
                )}
              </button>
            ))}
          </nav>

          {/* 하단 프로필 */}
          <div
            className="flex items-center gap-2.5 px-4 py-4"
            style={{ borderTop: "1px solid #EAEDF3" }}
          >
            <div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
              style={{ background: "#4A6CF7" }}
            >
              {username[0] ?? "?"}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[13px] font-semibold text-slate-800">{username}</div>
              <div className="text-[11px] text-slate-400">{planLabel}</div>
            </div>
          </div>
        </aside>

        {/* ── 중앙 콘텐츠 ── */}
        <main className="flex flex-1 flex-col overflow-y-auto px-8 py-7">
          {/* 히어로 타이틀 */}
          <div className="mb-5">
            <h1 className="mb-3 text-[28px] font-extrabold leading-tight tracking-tight text-slate-900">
              공유한 순간이<br />
              <span style={{ color: "#4A6CF7" }}>여행이 되는 곳</span>
            </h1>
            {/* 태그 뱃지 */}
            <div className="flex flex-wrap gap-2">
              {TAG_BADGES.map((badge) => (
                <span
                  key={badge.label}
                  className="rounded-full px-3 py-1 text-[12px] font-semibold"
                  style={{ background: badge.bg, color: badge.color }}
                >
                  {badge.label}
                </span>
              ))}
            </div>
          </div>

          {/* 빠른 링크 추가 */}
          <div
            className="rounded-xl p-4"
            style={{ background: "#FFFFFF", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", borderRadius: "12px" }}
          >
            <div className="mb-1 text-[13px] font-bold text-slate-800">빠른 링크 추가</div>
            <div className="mb-3 text-[11px] text-slate-400">인스타그램 · 유튜브 · 네이버 링크 붙여넣기</div>
            <div className="flex gap-2">
              <input
                type="text"
                value={quickLink}
                onChange={(e) => setQuickLink(e.target.value)}
                placeholder="https://"
                className="min-w-0 flex-1 rounded-xl border px-3 py-2 text-[12px] text-slate-700 outline-none placeholder:text-slate-300 focus:border-[#4A6CF7]"
                style={{ borderColor: "#E2E6F0", background: "#F9FAFB" }}
                onKeyDown={(e) => { if (e.key === "Enter") handleAnalyze(); }}
              />
              <button
                onClick={handleAnalyze}
                className="cursor-pointer rounded-xl border-none px-4 py-2 text-[12px] font-semibold text-white"
                style={{ background: "#4A6CF7", borderRadius: "24px" }}
              >
                분석
              </button>
            </div>
          </div>
        </main>

        {/* ── 우측 패널 ── */}
        <aside
          className="flex w-[340px] flex-shrink-0 flex-col gap-4 overflow-y-auto px-5 py-7"
          style={{ borderLeft: "1px solid #EAEDF3" }}
        >
          {/* 알림 */}
          <div
            className="rounded-xl p-4"
            style={{ background: "#FFFFFF", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", borderRadius: "12px" }}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[13px] font-bold text-slate-800">알림</span>
              <button
                onClick={() => router.push("/dashboard/calendar")}
                className="cursor-pointer border-none bg-transparent text-[11px] text-slate-400"
              >
                더보기 &gt;
              </button>
            </div>
            <div className="flex flex-col gap-2.5">
              {notifications.length === 0 ? (
                <div className="py-4 text-center text-[12px] text-slate-400">알림이 없습니다</div>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[12px] text-slate-700">{notif.message}</div>
                      <div className="mt-0.5 text-[11px] text-slate-400">
                        {new Date(notif.createdAt).toLocaleDateString("ko-KR")}
                      </div>
                    </div>
                    {!notif.isRead && (
                      <div
                        className="h-2 w-2 flex-shrink-0 rounded-full"
                        style={{ background: "#4A6CF7" }}
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>

      <Toast visible={visible} />

      {showUrlModal && spaceId && (
        <UrlParserModal
          onClose={() => setShowUrlModal(false)}
          onAdd={handleAddPlace}
        />
      )}
    </div>
  );
}

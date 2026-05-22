"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Toast, useToast } from "@/components/Toast";

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

// [Test] API 미구현 — 추후 /api/tokens/recent 으로 대체 예정
const TEST_RECENT_TOKENS = [
  { title: "성수 재즈 페스티벌",  time: "19:00", price: "₩35,000" },
  { title: "북촌 한옥 체험",      time: "14:00", price: "₩20,000" },
  { title: "광장시장 야시장 투어", time: "18:30", price: "₩0"      },
  { title: "한강 피크닉 패키지",  time: "11:00", price: "₩12,000" },
  { title: "경복궁 야간 개장",    time: "20:00", price: "₩3,000"  },
];

// [Test] API 미구현 — 추후 /api/trips/upcoming 으로 대체 예정
const TEST_SCHEDULE_TAGS = [
  { color: "#EF4444", label: "공원",     time: "19:00" },
  { color: "#22C55E", label: "카페",     time: "15:30" },
  { color: "#F59E0B", label: "레스토랑", time: ""      },
];

// [Test] API 미구현 — 추후 /api/trips/members 으로 대체 예정
const TEST_MEMBER_COLORS = ["#EF4444", "#F59E0B", "#4A6CF7", "#10B981"];

// [Test] API 미구현 — 추후 /api/notifications 으로 대체 예정
const TEST_NOTIFICATIONS = [
  { text: "안씨전님이 여행에 초대했습니다", time: "3분 전"  },
  { text: "이씨전님이 여행에 초대했습니다", time: "10분 전" },
];

/* ── 컴포넌트 ── */

export function MainDashboardScreen() {
  const router   = useRouter();
  const { visible, showToast } = useToast();
  const [username, setUsername]   = useState("");
  const [quickLink, setQuickLink] = useState("");

  const handleNav = (key: string) => {
    if (key === "travel")   { router.push("/dashboard/travel"); return; }
    if (key === "calendar") { router.push("/dashboard/calendar"); return; }
    if (key === "dashboard") return;
    showToast();
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const name  = localStorage.getItem("username");
    if (!token) { router.replace("/"); return; }
    setUsername(name ?? "");
  }, [router]);

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
            {/* API: localStorage username */}
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
              {/* API: localStorage username */}
              {username[0] ?? "?"}
            </div>
            <div className="min-w-0">
              {/* API: localStorage username */}
              <div className="truncate text-[13px] font-semibold text-slate-800">{username}</div>
              {/* [Test] API 미구현 — /api/user/profile */}
              <div className="text-[11px] text-slate-400">Pro 플랜</div>
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

          {/* 최근 수집 토큰 */}
          <div>
            <h2 className="mb-3 text-[15px] font-bold text-slate-800">최근 수집 토큰</h2>
            <div className="flex flex-col gap-2.5">
              {TEST_RECENT_TOKENS.map((token, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl px-4 py-3"
                  style={{
                    background: "#FFFFFF",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    borderRadius: "12px",
                  }}
                >
                  <div>
                    <div className="text-[14px] font-semibold text-slate-800">{token.title}</div>
                    <div className="mt-0.5 text-[12px] text-slate-400">
                      🕐 {token.time} · {token.price}
                    </div>
                  </div>
                  <button
                    onClick={showToast}
                    className="cursor-pointer rounded-2xl border-none px-4 py-1.5 text-[12px] font-semibold text-white"
                    style={{ background: "#4A6CF7", borderRadius: "24px" }}
                  >
                    확정
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* ── 우측 패널 ── */}
        <aside
          className="flex w-[340px] flex-shrink-0 flex-col gap-4 overflow-y-auto px-5 py-7"
          style={{ borderLeft: "1px solid #EAEDF3" }}
        >
          {/* 여행 카드 */}
          <div
            className="rounded-xl p-4"
            style={{ background: "#FFFFFF", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", borderRadius: "12px" }}
          >
            {/* 점선 경로 + 포인트 */}
            <div className="relative mb-4 flex h-[60px] items-center justify-between px-4">
              <div
                className="absolute left-8 right-8 top-1/2 -translate-y-1/2"
                style={{ borderTop: "2px dashed #D1D5DB" }}
              />
              {[
                { color: TEST_SCHEDULE_TAGS[0].color, zIndex: 3 },
                { color: TEST_SCHEDULE_TAGS[1].color, zIndex: 2 },
                { color: TEST_SCHEDULE_TAGS[2].color, zIndex: 1 },
              ].map((pt, i) => (
                <div
                  key={i}
                  className="relative z-10 h-5 w-5 rounded-full border-2 border-white"
                  style={{ background: pt.color, boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }}
                />
              ))}
            </div>

            {/* 일정 태그 3개 */}
            <div className="mb-4 flex flex-wrap gap-1.5">
              {TEST_SCHEDULE_TAGS.map((tag, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={{ background: tag.color + "1A", color: tag.color }}
                >
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ background: tag.color }}
                  />
                  {tag.label}
                  {tag.time && <span className="ml-0.5 text-[10px] opacity-70">{tag.time}</span>}
                </span>
              ))}
            </div>

            {/* 여행 정보 */}
            <div className="flex items-end justify-between">
              <div>
                {/* [Test] API 미구현 — /api/trips/upcoming */}
                <div className="text-[15px] font-bold text-slate-800">서울 문화 투어</div>
                <div className="mt-0.5 text-[11px] text-slate-400">5월 3일 · 3개 장소 · 친구 4명</div>
              </div>
              <div className="flex">
                {TEST_MEMBER_COLORS.map((color, i) => (
                  <div
                    key={i}
                    className="h-7 w-7 rounded-full border-2 border-white"
                    style={{
                      background: color,
                      marginLeft: i === 0 ? 0 : -8,
                      zIndex: TEST_MEMBER_COLORS.length - i,
                      position: "relative",
                    }}
                  />
                ))}
              </div>
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
              />
              <button
                onClick={showToast}
                className="cursor-pointer rounded-xl border-none px-4 py-2 text-[12px] font-semibold text-white"
                style={{ background: "#4A6CF7", borderRadius: "24px" }}
              >
                분석
              </button>
            </div>
          </div>

          {/* 알림 */}
          <div
            className="rounded-xl p-4"
            style={{ background: "#FFFFFF", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", borderRadius: "12px" }}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[13px] font-bold text-slate-800">알림</span>
              <button
                onClick={showToast}
                className="cursor-pointer border-none bg-transparent text-[11px] text-slate-400"
              >
                더보기 &gt;
              </button>
            </div>
            <div className="flex flex-col gap-2.5">
              {TEST_NOTIFICATIONS.map((notif, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[12px] text-slate-700">{notif.text}</div>
                    <div className="mt-0.5 text-[11px] text-slate-400">{notif.time}</div>
                  </div>
                  <div
                    className="h-2 w-2 flex-shrink-0 rounded-full"
                    style={{ background: "#4A6CF7" }}
                  />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <Toast visible={visible} />
    </div>
  );
}

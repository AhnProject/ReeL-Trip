"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Toast, useToast } from "@/components/Toast";

/* Leaflet은 SSR 불가 → dynamic import */
const TravelMapView = dynamic(
  () => import("./TravelMapView").then((m) => m.TravelMapView),
  { ssr: false, loading: () => <div className="h-full w-full animate-pulse bg-slate-100" /> },
);

/* ── 상수 ── */

const NAV_ITEMS = [
  { key: "dashboard",  icon: "🔵", label: "대시보드",   active: false, hasArrow: false },
  { key: "travel",     icon: "✈️", label: "여행계획",   active: true,  hasArrow: false },
  { key: "calendar",   icon: "📅", label: "캘린더",     active: false, hasArrow: true  },
  { key: "checklist",  icon: "☑️", label: "체크리스트", active: false, hasArrow: true  },
  { key: "transport",  icon: "🚌", label: "교통",       active: false, hasArrow: false },
];

// [Test] API 미구현 — 추후 /api/trips/places 으로 대체 예정
const TEST_PLACE_LIST = [
  { title: "성수 재즈 페스티벌",  time: "19:00", price: "₩35,000" },
  { title: "북촌 한옥 체험",      time: "14:00", price: "₩20,000" },
  { title: "광장시장 야시장 투어", time: "18:30", price: "₩0"      },
  { title: "경복궁 야간 개장",    time: "20:00", price: "₩3,000"  },
];

// [Test] API 미구현 — 추후 /api/trips/members 으로 대체 예정
const TEST_MEMBER_COLORS = ["#EF4444", "#F59E0B", "#4A6CF7", "#10B981"];

/* ── 컴포넌트 ── */

export function TravelMapScreen() {
  const router = useRouter();
  const { visible, showToast } = useToast();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const name  = localStorage.getItem("username");
    if (!token) { router.replace("/"); return; }
    setUsername(name ?? "");
  }, [router]);

  if (!username) return null;

  const handleNav = (key: string) => {
    if (key === "dashboard") router.push("/dashboard/main");
    if (key === "calendar")  router.push("/dashboard/calendar");
    if (key === "checklist" || key === "transport") showToast();
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden font-sans" style={{ background: "#F5F6FA" }}>

      {/* ── GNB ── */}
      <header
        className="flex h-[60px] flex-shrink-0 items-center justify-between px-6"
        style={{ background: "#FFFFFF", borderBottom: "1px solid #EAEDF3" }}
      >
        {/* 로고 */}
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

        {/* 중앙 검색창 */}
        <div
          className="flex h-9 w-[320px] items-center gap-2 rounded-2xl px-4"
          style={{ background: "#F5F6FA", border: "1px solid #E2E6F0" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="장소 또는 이름 검색"
            className="flex-1 border-none bg-transparent text-[13px] text-slate-600 outline-none placeholder:text-slate-400"
          />
        </div>

        {/* 시작하기 버튼 */}
        <button
          onClick={showToast}
          className="h-9 cursor-pointer rounded-2xl border-none px-5 text-[13px] font-semibold text-white"
          style={{ background: "#4A6CF7" }}
        >
          시작하기
        </button>
      </header>

      {/* ── 본문 3단 ── */}
      <div className="flex min-h-0 flex-1">

        {/* ── 좌측 사이드바 200px ── */}
        <aside
          className="flex h-full w-[200px] flex-shrink-0 flex-col"
          style={{ background: "#FFFFFF", borderRight: "1px solid #EAEDF3" }}
        >
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

        {/* ── 중앙 지도 ── */}
        <main className="relative flex-1 overflow-hidden">
          <TravelMapView />
        </main>

        {/* ── 우측 패널 ── */}
        <aside
          className="flex w-[260px] flex-shrink-0 flex-col"
          style={{ background: "#FFFFFF", borderLeft: "1px solid #EAEDF3" }}
        >
          {/* 장소 리스트 */}
          <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-4 py-5">
            <h3 className="mb-1 text-[14px] font-bold text-slate-800">장소 목록</h3>
            {TEST_PLACE_LIST.map((place, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl px-3.5 py-3"
                style={{
                  background: "#F9FAFB",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  borderRadius: "12px",
                }}
              >
                <div>
                  <div className="text-[13px] font-semibold text-slate-800">{place.title}</div>
                  <div className="mt-0.5 text-[11px] text-slate-400">
                    🕐 {place.time} · {place.price}
                  </div>
                </div>
                <button
                  onClick={showToast}
                  className="cursor-pointer rounded-[24px] border-none px-3 py-1.5 text-[11px] font-semibold text-white"
                  style={{ background: "#4A6CF7" }}
                >
                  확정
                </button>
              </div>
            ))}

            {/* 여행 정보 섹션 */}
            <div
              className="mt-2 rounded-xl p-4"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)", borderRadius: "12px", background: "#FFFFFF" }}
            >
              <div className="mb-3 text-[13px] font-bold text-slate-800">여행 정보</div>

              <div className="flex flex-col gap-2.5">
                {/* 기간 */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">기간</span>
                  {/* [Test] API 미구현 — /api/trips/detail */}
                  <span className="text-[12px] font-medium text-slate-700">5월 15일 ~ 5월 18일</span>
                </div>

                {/* 참여자 */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">참여자</span>
                  <div className="flex items-center gap-1.5">
                    <div className="flex">
                      {/* [Test] API 미구현 — /api/trips/members */}
                      {TEST_MEMBER_COLORS.map((color, i) => (
                        <div
                          key={i}
                          className="h-5 w-5 rounded-full border-[1.5px] border-white"
                          style={{
                            background: color,
                            marginLeft: i === 0 ? 0 : -5,
                            position: "relative",
                            zIndex: TEST_MEMBER_COLORS.length - i,
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-500">{TEST_MEMBER_COLORS.length}명 (나 포함)</span>
                  </div>
                </div>

                {/* 예산 */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">예산</span>
                  {/* [Test] API 미구현 — /api/trips/budget */}
                  <span className="text-[12px] font-medium text-slate-700">₩450,000 / 인</span>
                </div>
              </div>
            </div>
          </div>

          {/* 장소 추가 버튼 고정 하단 */}
          <div className="px-4 pb-5">
            <button
              onClick={showToast}
              className="w-full cursor-pointer rounded-[24px] border-none py-3 text-[13px] font-bold text-white"
              style={{ background: "#4A6CF7" }}
            >
              + 장소 추가
            </button>
          </div>
        </aside>
      </div>

      <Toast visible={visible} />
    </div>
  );
}

"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Toast, useToast } from "@/components/Toast";
import { listPlaces, updatePlace, addPlace } from "@/domains/place/api";
import type { PlaceResponse } from "@/domains/place/api";
import { listTeamSpaces } from "@/domains/teamspace/api";
import type { MemberResponse } from "@/domains/teamspace/api";
import { UrlParserModal } from "@/app/dashboard/url-parser-modal";
import { CreateEventModal } from "@/domains/event/components/CreateEventModal";

/* Leaflet은 SSR 불가 → dynamic import */
const TravelMapView = dynamic(
  () => import("./TravelMapView").then((m) => m.TravelMapView),
  { ssr: false, loading: () => <div className="h-full w-full animate-pulse bg-slate-100" /> },
);

/* ── ParsedResult 타입 ── */
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

/* ── 상수 ── */

const NAV_ITEMS = [
  { key: "dashboard",  icon: "🔵", label: "대시보드",   active: false, hasArrow: false },
  { key: "travel",     icon: "✈️", label: "여행계획",   active: true,  hasArrow: false },
  { key: "calendar",   icon: "📅", label: "캘린더",     active: false, hasArrow: true  },
  { key: "checklist",  icon: "☑️", label: "체크리스트", active: false, hasArrow: true  },
  { key: "transport",  icon: "🚌", label: "교통",       active: false, hasArrow: false },
];

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/* ── 컴포넌트 ── */

export function TravelMapScreen() {
  const router = useRouter();
  const { visible, showToast } = useToast();

  const [username, setUsername]       = useState("");
  const [token, setToken]             = useState("");
  const [spaceId, setSpaceId]         = useState<number | null>(null);
  const [places, setPlaces]           = useState<PlaceResponse[]>([]);
  const [members, setMembers]         = useState<MemberResponse[]>([]);
  const [confirmedIds, setConfirmedIds] = useState<Set<number>>(new Set());
  const [showUrlModal, setShowUrlModal]     = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const name        = localStorage.getItem("username");
    if (!storedToken) { router.replace("/"); return; }
    setToken(storedToken);
    setUsername(name ?? "");

    listTeamSpaces(storedToken).then((res) => {
      if (!res.success || !res.data || res.data.length === 0) return;
      const space = res.data[0];
      setSpaceId(space.id);
      setMembers(space.members);

      listPlaces(space.id, storedToken).then((pRes) => {
        if (pRes.success && pRes.data) setPlaces(pRes.data);
      }).catch((err) => console.error("[TravelMapScreen]", err));
    }).catch((err) => console.error("[TravelMapScreen]", err));
  }, [router]);

  if (!username) return <LoadingScreen />;

  const handleNav = (key: string) => {
    if (key === "dashboard") router.push("/dashboard/main");
    if (key === "calendar")  router.push("/dashboard/calendar");
    if (key === "checklist" || key === "transport") showToast();
  };

  /* ── 장소 확정 토글 ── */
  const handleToggleConfirm = (placeId: number) => {
    setConfirmedIds((prev) => {
      const next = new Set(prev);
      if (next.has(placeId)) next.delete(placeId);
      else next.add(placeId);
      return next;
    });
    if (token) {
      updatePlace(placeId, {}, token).catch(() => {});
    }
  };

  /* ── URL 파싱 후 장소 추가 ── */
  const handleAddPlace = async (parsed: ParsedResult) => {
    if (!spaceId || !token) return;
    const res = await addPlace({
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
    if (res.success && res.data) {
      setPlaces((prev) => [...prev, res.data!]);
    }
    setShowUrlModal(false);
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
              {username[0] ?? "?"}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[13px] font-semibold text-slate-800">{username}</div>
              <div className="text-[11px] text-slate-400">Free 플랜</div>
            </div>
          </div>
        </aside>

        {/* ── 중앙 지도 ── */}
        <main className="relative flex-1 overflow-hidden">
          <TravelMapView onAddToSchedule={() => setShowCreateModal(true)} />
        </main>

        {/* ── 우측 패널 ── */}
        <aside
          className="flex w-[260px] flex-shrink-0 flex-col"
          style={{ background: "#FFFFFF", borderLeft: "1px solid #EAEDF3" }}
        >
          {/* 장소 리스트 */}
          <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-4 py-5">
            <h3 className="mb-1 text-[14px] font-bold text-slate-800">장소 목록</h3>
            {places.length === 0 ? (
              <div className="py-6 text-center text-[12px] text-slate-400">저장된 장소가 없습니다</div>
            ) : (
              places.map((place) => {
                const isConfirmed = confirmedIds.has(place.id);
                return (
                  <div
                    key={place.id}
                    className="flex items-center justify-between rounded-xl px-3.5 py-3"
                    style={{
                      background: "#F9FAFB",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      borderRadius: "12px",
                    }}
                  >
                    <div>
                      <div className="text-[13px] font-semibold text-slate-800">{place.name}</div>
                      <div className="mt-0.5 text-[11px] text-slate-400">
                        {place.region && `📍 ${place.region}`}
                        {place.priceDesc && ` · ${place.priceDesc}`}
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleConfirm(place.id)}
                      className="cursor-pointer rounded-[24px] border-none px-3 py-1.5 text-[11px] font-semibold text-white"
                      style={{ background: isConfirmed ? "#16A34A" : "#4A6CF7" }}
                    >
                      {isConfirmed ? "확정됨" : "확정"}
                    </button>
                  </div>
                );
              })
            )}

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
                  <span className="text-[12px] font-medium text-slate-700">-</span>
                </div>

                {/* 참여자 */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">참여자</span>
                  <div className="flex items-center gap-1.5">
                    <div className="flex">
                      {members.slice(0, 4).map((m, i) => (
                        <div
                          key={m.userId}
                          className="h-5 w-5 rounded-full border-[1.5px] border-white"
                          style={{
                            background: "#4A6CF7",
                            marginLeft: i === 0 ? 0 : -5,
                            position: "relative",
                            zIndex: members.length - i,
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-500">{members.length}명 (나 포함)</span>
                  </div>
                </div>

                {/* 예산 */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">예산</span>
                  <span className="text-[12px] font-medium text-slate-700">-</span>
                </div>
              </div>
            </div>
          </div>

          {/* 장소 추가 버튼 고정 하단 */}
          <div className="px-4 pb-5">
            <button
              onClick={() => setShowUrlModal(true)}
              className="w-full cursor-pointer rounded-[24px] border-none py-3 text-[13px] font-bold text-white"
              style={{ background: "#4A6CF7" }}
            >
              + 장소 추가
            </button>
          </div>
        </aside>
      </div>

      <Toast visible={visible} />

      {showUrlModal && (
        <UrlParserModal
          onClose={() => setShowUrlModal(false)}
          onAdd={handleAddPlace}
        />
      )}

      {showCreateModal && spaceId && (
        <CreateEventModal
          spaceId={spaceId}
          token={token}
          defaultDate={todayStr()}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}

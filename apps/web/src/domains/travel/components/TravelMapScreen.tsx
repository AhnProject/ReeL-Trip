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
import { UrlParserModal } from "@/domains/place/components/UrlParserModal";
import type { ParsedResult } from "@/domains/place/types";
import { CreateEventModal } from "@/domains/event/components/CreateEventModal";
import { Logo } from "@/components/Logo";

/* Leaflet은 SSR 불가 → dynamic import */
const TravelMapView = dynamic(
  () => import("./TravelMapView").then((m) => m.TravelMapView),
  { ssr: false, loading: () => <div className="h-full w-full animate-pulse bg-slate-100" /> },
);


/* ── 상수 ── */


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
    if (key === "dashboard")    { router.push("/dashboard");              return; }
    if (key === "schedule")     { router.push("/dashboard/calendar");     return; }
    if (key === "ai")           { router.push("/dashboard/ai");           return; }
    if (key === "member")       { router.push("/dashboard/member");       return; }
    if (key === "chat")         { router.push("/dashboard/chat");         return; }
    if (key === "notification") { router.push("/dashboard/notification"); return; }
    if (key === "settings")     { router.push("/dashboard/settings");     return; }
    if (key === "place")        return;
    showToast();
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
    <div className="flex h-screen flex-col overflow-hidden font-sans">

      {/* ── GNB ── */}
      <header className="flex h-[60px] flex-shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6">
        <button onClick={() => router.push("/dashboard/home")} className="cursor-pointer border-none bg-transparent p-0">
          <Logo className="h-9" />
        </button>

        <div className="flex h-9 w-[280px] items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="장소, 일정 검색"
            className="flex-1 bg-transparent text-sm text-slate-600 outline-none placeholder:text-slate-400"
          />
        </div>

        <button
          onClick={() => router.push("/dashboard")}
          className="h-9 cursor-pointer rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          ← 대시보드
        </button>
      </header>

      {/* ── 본문 3단 ── */}
      <div className="flex min-h-0 flex-1">

        {/* ── 좌측 사이드바 200px ── */}
        <aside className="flex h-full w-[200px] flex-shrink-0 flex-col border-r border-slate-100 bg-white">
          <div className="mx-3 mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800">
            📍 장소
          </div>
          <nav className="flex flex-1 flex-col gap-0.5 px-3 pt-3">
            {([
              { key: "dashboard",    label: "대시보드" , icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
              { key: "schedule",     label: "일정"     , icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
              { key: "place",        label: "장소"     , icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg> },
              { key: "ai",           label: "AI 추천"  , icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l1.9 5.8L20 12l-6.1 3.2L12 21l-1.9-5.8L4 12l6.1-3.2z"/></svg> },
              { key: "member",       label: "멤버"     , icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
              { key: "chat",         label: "채팅"     , icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, badge: <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" /> },
              { key: "notification", label: "알림"     , icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
              { key: "settings",     label: "설정"     , icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
            ] as const).map((item) => (
              <button
                key={item.key}
                onClick={() => handleNav(item.key)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  item.key === "place"
                    ? "bg-brand-primary/10 font-semibold text-brand-primary"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="flex-1 text-left">{item.label}</span>
                {"badge" in item && item.badge}
              </button>
            ))}
          </nav>

          {/* 하단 프로필 */}
          <div className="flex flex-col gap-2 border-t border-slate-100 p-3">
            <div className="flex items-center gap-2 rounded-lg px-1 py-1.5">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-primary text-sm font-bold text-white">
                {username[0]?.toUpperCase() ?? "?"}
              </div>
              <p className="truncate text-xs font-semibold text-slate-800">{username}</p>
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

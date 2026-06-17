"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Button } from "@/components/Button";
import { Logo } from "@/components/Logo";
import { CreateSpaceModal } from "@/domains/teamspace/components/CreateSpaceModal";
import { InviteMemberModal } from "@/domains/teamspace/components/InviteMemberModal";
import { UrlParserModal } from "@/domains/place/components/UrlParserModal";
import type { ParsedResult } from "@/domains/place/types";
import { listTeamSpaces } from "@/domains/teamspace/api";
import { toTeamSpace } from "@/domains/teamspace/mappers";
import { listNotifications } from "@/domains/notification/api";
import type { NotificationResponse } from "@/domains/notification/api";
import { addPlace } from "@/domains/place/api";
import type { TeamSpace } from "@/domains/teamspace/types";
import { calcDday, timeAgo } from "@/lib/date";
import { cn } from "@/lib/cn";
import {
  IconHome, IconCalendar, IconMapPin, IconSparkles, IconUsers, IconChat,
  IconBell, IconSettings, IconSearch, IconChevronDown, IconChevronRight,
  IconUserPlus, IconGearSmall,
} from "@/components/icons";

/* ── 타입 ── */

type DashboardNavKey =
  | "dashboard" | "schedule" | "place" | "ai"
  | "member" | "chat" | "notification" | "settings";

/* ── 네비 목록 ── */

const NAV_ITEMS: { key: DashboardNavKey; label: string; icon: React.ReactNode }[] = [
  { key: "dashboard",    label: "대시보드", icon: <IconHome /> },
  { key: "schedule",     label: "일정",     icon: <IconCalendar /> },
  { key: "place",        label: "장소",     icon: <IconMapPin /> },
  { key: "ai",           label: "AI 추천",  icon: <IconSparkles /> },
  { key: "member",       label: "멤버",     icon: <IconUsers /> },
  { key: "chat",         label: "채팅",     icon: <IconChat /> },
  { key: "notification", label: "알림",     icon: <IconBell /> },
  { key: "settings",     label: "설정",     icon: <IconSettings /> },
];

/* ── 더미 데이터 (API 미구현) ── */

const DUMMY_SCHEDULE = [
  { date: "08.01", day: "토", items: ["✈️ 09:00 제주국제공항 도착", "🚗 렌터카 픽업", "🍽 점심 식사"], extra: 3 },
  { date: "08.02", day: "일", items: ["☕ 10:00 우도 여행"], extra: 4 },
  { date: "08.03", day: "월", items: ["🏔 10:00 성산일출봉", "🍽 저녁 식사"], extra: 3 },
  { date: "08.04", day: "화", items: ["🏨 10:00 체크아웃", "✈️ 공항 이동"], extra: 2 },
];

const DUMMY_PLACES = [
  { name: "우도 해변", region: "서귀포시 우도면", tags: ["#바다"] },
  { name: "성산일출봉", region: "서귀포시 성산읍", tags: ["#자연"] },
  { name: "카페 모모", region: "제주시 구좌읍", tags: ["#카페"] },
];

const DUMMY_TODOS = [
  { label: "숙소 예약하기",     priority: "높음", priorityColor: "text-red-500 bg-red-50",    dday: 2 },
  { label: "렌터카 확정하기",   priority: "중간", priorityColor: "text-amber-500 bg-amber-50", dday: 5 },
  { label: "일정 투표 참여하기", priority: "낮음", priorityColor: "text-green-600 bg-green-50", dday: 7 },
];

/* ── 서브 컴포넌트 ── */

function TravelHeroCard({ space }: { space: TeamSpace | undefined }) {
  if (!space) return (
    <div className="col-span-2 rounded-xl border border-slate-100 bg-white p-5 py-10 text-center text-sm text-slate-400 shadow-sm">
      여행 스페이스가 없습니다. 새 여행을 만들어보세요.
    </div>
  );

  const dday = space.events.length > 0 ? calcDday(space.events[0].startDate) : null;

  return (
    <div className="col-span-2 flex gap-5 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      {/* 썸네일 */}
      <div className="h-[150px] w-[200px] flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-slate-200 to-slate-300">
        <div className="flex h-full w-full items-center justify-center text-6xl">{space.emoji}</div>
      </div>

      {/* 콘텐츠 */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-slate-900">{space.name}</h2>
          <button className="cursor-pointer border-none bg-transparent text-slate-300 hover:text-slate-500">
            <IconGearSmall />
          </button>
        </div>
        <p className="mt-0.5 text-sm text-slate-400">
          {space.events.length > 0
            ? `${space.events[0].startDate} ~ ${space.events[space.events.length - 1].endDate}`
            : "2026.08.01 (토) ~ 08.04 (화) · 3박 4일"}
        </p>

        <div className="mt-3 flex items-end gap-8">
          <div>
            <p className="text-5xl font-extrabold text-brand-primary">
              {dday !== null ? `D-${dday}` : "D-12"}
            </p>
            <p className="mt-1 text-xs text-slate-400">여행까지 남은 시간</p>
          </div>
          <div>
            <div className="mb-1.5 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">65%</span>
              <span className="text-xs text-slate-400">준비 진행률</span>
            </div>
            <div className="h-2 w-[140px] overflow-hidden rounded-full bg-slate-100">
              <div className="h-2 w-[91px] rounded-full bg-brand-primary" />
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-8 border-t border-slate-100 pt-4">
          {[
            { icon: "📍", count: "12개", label: "저장된 장소" },
            { icon: "📅", count: "4일",  label: "일정"        },
            { icon: "👥", count: `${space.members.length}명`, label: "참여 멤버" },
            { icon: "✅", count: "4개",  label: "예약 완료"   },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="text-base">{s.icon}</span>
              <div>
                <p className="text-sm font-bold text-slate-900">{s.count}</p>
                <p className="text-xs text-slate-400">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScheduleTimeline() {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900">이번 여행 일정</h3>
        <button className="cursor-pointer border-none bg-transparent text-sm text-brand-primary">전체 일정 보기</button>
      </div>
      <div className="mt-3 flex flex-col">
        {DUMMY_SCHEDULE.map((row, i) => (
          <div key={row.date} className={cn("flex gap-3 py-3", i < DUMMY_SCHEDULE.length - 1 && "border-b border-slate-50")}>
            <div className="w-[44px] flex-shrink-0 text-center">
              <p className="text-sm font-bold text-slate-800">{row.date}</p>
              <p className="text-xs text-slate-400">{row.day}</p>
            </div>
            <div className="mt-1.5 flex flex-shrink-0 flex-col items-center">
              <div className="h-2 w-2 rounded-full bg-brand-primary" />
              {i < DUMMY_SCHEDULE.length - 1 && <div className="mt-1 w-px flex-1 bg-slate-100" />}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap gap-1.5">
                {row.items.map((item) => (
                  <span key={item} className="rounded-lg bg-slate-50 px-2 py-1 text-xs text-slate-700">{item}</span>
                ))}
              </div>
              <button className="mt-1.5 text-xs text-slate-400">외 {row.extra}개 일정 ▾</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AiRecommendSection() {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900">AI 추천 장소</h3>
        <button className="cursor-pointer border-none bg-transparent text-sm text-brand-primary">더보기</button>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {DUMMY_PLACES.map((place) => (
          <div key={place.name} className="overflow-hidden rounded-xl border border-slate-100">
            <div className="relative flex h-[110px] items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
              <span className="text-3xl">🏖️</span>
              <button className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-slate-400 hover:text-red-400 text-sm">
                ♡
              </button>
            </div>
            <div className="p-2.5">
              <p className="text-sm font-semibold text-slate-900">{place.name}</p>
              <p className="mt-0.5 text-xs text-slate-400">{place.region}</p>
              <div className="mt-1.5 flex gap-1 flex-wrap">
                {place.tags.map((tag) => (
                  <span key={tag} className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-center gap-1.5">
        <span className="h-2 w-4 rounded-full bg-brand-primary" />
        {[1, 2, 3, 4].map((i) => <span key={i} className="h-2 w-2 rounded-full bg-slate-200" />)}
      </div>
    </div>
  );
}

function MemberStatus({ space, onInvite }: { space: TeamSpace | undefined; onInvite: () => void }) {
  return (
    <div className="flex-1 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900">멤버 현황</h3>
        <button className="cursor-pointer border-none bg-transparent text-sm text-brand-primary">전체 멤버 보기</button>
      </div>
      <div className="mt-3 flex flex-wrap gap-4">
        {(space?.members ?? []).map((m) => (
          <div key={m.id} className="flex flex-col items-center gap-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary text-sm font-bold text-white">
              {m.username[0]?.toUpperCase() ?? "?"}
            </div>
            <p className="text-xs text-slate-700">{m.username}</p>
            {m.role === "owner" && <p className="text-[10px] text-slate-400">소유자</p>}
          </div>
        ))}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={onInvite}
            className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-slate-200 bg-transparent text-slate-300 hover:border-brand-primary hover:text-brand-primary"
          >
            <IconUserPlus />
          </button>
          <p className="text-xs text-slate-400">초대하기</p>
        </div>
      </div>
    </div>
  );
}

function BookingStatus() {
  const items = [
    { emoji: "✈️", label: "항공권",   done: 5, total: 5, status: "완료",   color: "text-green-600"  },
    { emoji: "🏨", label: "숙소",     done: 2, total: 5, status: "예약 중", color: "text-amber-500" },
    { emoji: "🚗", label: "렌터카",   done: 1, total: 5, status: "예약 중", color: "text-amber-500" },
    { emoji: "🎭", label: "액티비티", done: 0, total: 5, status: "예약 전", color: "text-red-400"   },
  ] as const;

  return (
    <div className="flex-1 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900">예약 및 준비 현황</h3>
        <button className="cursor-pointer border-none bg-transparent text-sm text-brand-primary">전체 보기</button>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col items-center gap-1.5 rounded-lg bg-slate-50 p-3">
            <span className="text-xl">{item.emoji}</span>
            <p className="text-xs text-slate-500">{item.label}</p>
            <p className={cn("text-sm font-bold", item.color)}>{item.done}/{item.total}</p>
            <p className={cn("text-xs", item.color)}>{item.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TodoPanel() {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-bold text-slate-900">다음에 해야 할 일</h3>
        <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-xs font-semibold text-brand-primary">3</span>
      </div>
      <div className="mt-3 flex flex-col gap-4">
        {DUMMY_TODOS.map((todo) => (
          <div key={todo.label} className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
                <span className="text-sm text-slate-700">{todo.label}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", todo.priorityColor)}>
                  우선순위 {todo.priority}
                </span>
                <span className="text-xs text-slate-400">마감까지 {todo.dday}일</span>
              </div>
            </div>
            <span className="mt-0.5 text-slate-300"><IconChevronRight /></span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityPanel({ notifications }: { notifications: NotificationResponse[] }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">최근 활동</h3>
        <button className="cursor-pointer border-none bg-transparent text-xs text-brand-primary">전체 보기</button>
      </div>
      {notifications.length === 0 ? (
        <p className="py-4 text-center text-sm text-slate-400">최근 활동이 없습니다</p>
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          {notifications.map((n) => (
            <div key={n.id} className="flex items-start gap-2.5">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                {n.type === "ai" ? <IconSparkles /> : n.type === "place" ? <IconMapPin /> : n.type === "schedule" ? <IconCalendar /> : <IconUsers />}
              </div>
              <div className="flex-1">
                <p className="text-xs leading-relaxed text-slate-700">{n.message}</p>
                <p className="mt-0.5 text-xs text-slate-400">{timeAgo(n.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── 메인 ── */

function DashboardInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [token, setToken]                     = useState("");
  const [username, setUsername]               = useState("");
  const [spaces, setSpaces]                   = useState<TeamSpace[]>([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>("");
  const [notifications, setNotifications]     = useState<NotificationResponse[]>([]);
  const [activeNav, setActiveNav]             = useState<DashboardNavKey>("dashboard");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showUrlModal, setShowUrlModal]       = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedName  = localStorage.getItem("username");
    if (!storedToken) { router.replace("/"); return; }
    setToken(storedToken);
    setUsername(storedName ?? "");

    listTeamSpaces(storedToken).then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        const converted = res.data.map(toTeamSpace);
        setSpaces(converted);
        const paramId = searchParams.get("space");
        const found   = converted.find((s) => s.id === paramId);
        setSelectedSpaceId(found ? found.id : converted[0].id);
      }
    }).catch((err) => console.error("[DashboardScreen]", err));

    listNotifications(storedToken).then((res) => {
      if (res.success && res.data) setNotifications(res.data);
    }).catch((err) => console.error("[DashboardScreen]", err));
  }, [router, searchParams]);

  if (!username) return <LoadingScreen />;

  const selectedSpace = spaces.find((s) => s.id === selectedSpaceId) ?? spaces[0];
  const unreadCount   = notifications.filter((n) => !n.isRead).length;

  const handleAddPlace = async (parsed: ParsedResult) => {
    if (!selectedSpace || !token) return;
    await addPlace({
      spaceId: Number(selectedSpace.id),
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
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    router.replace("/");
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans">

      {/* ══════════════════════════════════════════
          사이드바 (w-[200px])
          - 로고 없음, 여행 드롭다운이 최상단
          - 네비 메뉴
          - 하단: 새 여행 만들기 + 최근 여행 + 프로필
      ══════════════════════════════════════════ */}
      <aside className="flex h-full w-[200px] flex-shrink-0 flex-col border-r border-slate-100 bg-white">

        {/* 여행 드롭다운 */}
        <div className="border-b border-slate-100 p-3">
          <button className="flex w-full items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-200 text-sm">
              {selectedSpace?.emoji ?? "✈️"}
            </div>
            <span className="flex-1 truncate text-left text-sm font-semibold text-slate-800">
              {selectedSpace?.name ?? "여행 없음"}
            </span>
            <span className="text-slate-400"><IconChevronDown /></span>
          </button>
        </div>

        {/* 네비 */}
        <nav className="flex flex-1 flex-col gap-0.5 px-3 py-3">
          {NAV_ITEMS.map((item) => {
            const active = activeNav === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  if (item.key === "schedule")     { router.push("/dashboard/calendar");     return; }
                  if (item.key === "place")         { router.push("/dashboard/travel");       return; }
                  if (item.key === "ai")            { router.push("/dashboard/ai");           return; }
                  if (item.key === "member")        { router.push("/dashboard/member");       return; }
                  if (item.key === "chat")          { router.push("/dashboard/chat");         return; }
                  if (item.key === "notification")  { router.push("/dashboard/notification"); return; }
                  if (item.key === "settings")      { router.push("/dashboard/settings");     return; }
                  setActiveNav(item.key);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-brand-primary/10 font-semibold text-brand-primary"
                    : "font-normal text-slate-500 hover:bg-slate-50",
                )}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="flex-1 text-left">{item.label}</span>
                {item.key === "chat" && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                {item.key === "notification" && unreadCount > 0 && (
                  <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* 하단 */}
        <div className="flex flex-col gap-2 border-t border-slate-100 p-3">
          {/* 새 여행 만들기 */}
          <div className="mb-1 px-1 text-xs text-slate-400">새로운 여행을 계획해보세요</div>
          <Button variant="primary" fullWidth onClick={() => setShowCreateModal(true)} className="text-sm">
            + 새 여행 만들기
          </Button>

          {/* 최근 본 여행 */}
          {spaces.filter((s) => s.id !== selectedSpaceId).length > 0 && (
            <div className="mt-1 flex flex-col gap-0.5">
              <p className="px-1 text-[11px] text-slate-400">최근 본 여행</p>
              {spaces.filter((s) => s.id !== selectedSpaceId).slice(0, 2).map((sp) => (
                <button
                  key={sp.id}
                  onClick={() => setSelectedSpaceId(sp.id)}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-slate-50"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-200 text-sm">
                    {sp.emoji}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-slate-700">{sp.name}</p>
                    <p className="text-[10px] text-slate-400">
                      {sp.events.length > 0 ? `D-${calcDday(sp.events[0].startDate)}` : "일정 미정"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* 프로필 */}
          <button
            onClick={handleLogout}
            className="mt-1 flex items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-slate-50"
            title="클릭하여 로그아웃"
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-primary text-sm font-bold text-white">
              {username[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-800">{username}</p>
              <p className="truncate text-[10px] text-slate-400">{username.toLowerCase()}@reeltrip.com</p>
            </div>
            <IconChevronRight />
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════════
          우측 전체 영역
      ══════════════════════════════════════════ */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-slate-50">

        {/* ── GNB ── */}
        <header className="flex h-[60px] flex-shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6">
          {/* 좌측: 로고 + 인사말 */}
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/dashboard/home")} className="cursor-pointer border-none bg-transparent p-0">
              <Logo />
            </button>
            <div className="h-5 w-px bg-slate-200" />
            <div>
              <p className="text-base font-bold text-slate-900">안녕하세요, {username}님 👋</p>
              <p className="text-xs text-slate-400">함께하는 {selectedSpace?.name ?? "여행"}, 즐겁게 준비해봐요!</p>
            </div>
          </div>

          {/* 우측: 검색 + 알림 + 초대 */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-[220px] items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4">
              <IconSearch />
              <input
                type="text"
                placeholder="장소, 일정 검색"
                className="flex-1 bg-transparent text-sm text-slate-600 outline-none placeholder:text-slate-400"
              />
            </div>
            <button className="relative cursor-pointer border-none bg-transparent p-1.5 text-slate-500 hover:text-slate-700">
              <IconBell />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
            <Button
              variant="primary"
              fullWidth={false}
              className="px-4 text-sm"
              onClick={() => setShowInviteModal(true)}
            >
              👤 초대하기
            </Button>
          </div>
        </header>

        {/* ── 콘텐츠 3단: 메인(flex-1) + 우측패널(280px) ── */}
        <div className="flex min-h-0 flex-1 overflow-hidden">

          {/* 메인 스크롤 영역 */}
          <main className="flex flex-1 flex-col overflow-y-auto p-5">
            {/* 히어로 카드 */}
            <TravelHeroCard space={selectedSpace} />

            {/* 일정 + AI추천 2열 */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <ScheduleTimeline />
              <AiRecommendSection />
            </div>

            {/* 멤버 + 예약현황 2열 */}
            <div className="mt-4 flex gap-4">
              <MemberStatus space={selectedSpace} onInvite={() => setShowInviteModal(true)} />
              <BookingStatus />
            </div>
          </main>

          {/* 우측 패널 (280px) */}
          <aside className="flex w-[280px] flex-shrink-0 flex-col gap-4 overflow-y-auto border-l border-slate-100 bg-white p-4">
            <TodoPanel />
            <ActivityPanel notifications={notifications.slice(0, 4)} />
          </aside>
        </div>
      </div>

      {/* ── 모달 ── */}
      {showCreateModal && (
        <CreateSpaceModal
          token={token}
          onClose={() => setShowCreateModal(false)}
          onCreated={(created) => {
            const newSpace = toTeamSpace(created);
            setSpaces((prev) => [...prev, newSpace]);
            setSelectedSpaceId(newSpace.id);
            setShowCreateModal(false);
          }}
        />
      )}
      {showInviteModal && selectedSpace && (
        <InviteMemberModal
          spaceId={Number(selectedSpace.id)}
          token={token}
          onClose={() => setShowInviteModal(false)}
          onInvited={() => {
            listTeamSpaces(token)
              .then((res) => { if (res.success && res.data) setSpaces(res.data.map(toTeamSpace)); })
              .catch((err) => console.error("[DashboardScreen]", err));
          }}
        />
      )}
      {showUrlModal && selectedSpace && (
        <UrlParserModal
          onClose={() => setShowUrlModal(false)}
          onAdd={handleAddPlace}
        />
      )}
    </div>
  );
}

export function DashboardScreen() {
  return (
    <Suspense>
      <DashboardInner />
    </Suspense>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/cn";

export type DashboardNavKey =
  | "dashboard" | "schedule" | "place" | "ai"
  | "member" | "chat" | "notification" | "settings";

/* ── 아이콘 ── */
const IconHome = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconMapPin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconSparkles = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.9 5.8L20 12l-6.1 3.2L12 21l-1.9-5.8L4 12l6.1-3.2z"/>
  </svg>
);
const IconUsers = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconChat = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const IconBell = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const IconSettings = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);
const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const IconChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const IconChevronRight = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

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

const NAV_ROUTES: Record<DashboardNavKey, string> = {
  dashboard:    "/dashboard",
  schedule:     "/dashboard/calendar",
  place:        "/dashboard/travel",
  ai:           "/dashboard/ai",
  member:       "/dashboard/member",
  chat:         "/dashboard/chat",
  notification: "/dashboard/notification",
  settings:     "/dashboard/settings",
};

interface Props {
  activeNav: DashboardNavKey;
  username: string;
  spaceName?: string;
  spaceEmoji?: string;
  unreadCount?: number;
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
}

export function DashboardLayout({
  activeNav,
  username,
  spaceName = "여행 없음",
  spaceEmoji = "✈️",
  unreadCount = 0,
  children,
  rightPanel,
}: Props) {
  const router = useRouter();

  return (
    <div className="flex h-screen overflow-hidden font-sans">

      {/* ── 사이드바 ── */}
      <aside className="flex h-full w-[200px] flex-shrink-0 flex-col border-r border-slate-100 bg-white">
        {/* 여행 드롭다운 */}
        <div className="border-b border-slate-100 p-3">
          <button className="flex w-full items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-200 text-sm">
              {spaceEmoji}
            </div>
            <span className="flex-1 truncate text-left text-sm font-semibold text-slate-800">{spaceName}</span>
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
                onClick={() => router.push(NAV_ROUTES[item.key])}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-brand-primary/10 font-semibold text-brand-primary"
                    : "font-normal text-slate-500 hover:bg-slate-50",
                )}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="flex-1 text-left">{item.label}</span>
                {item.key === "chat" && (
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                )}
                {item.key === "notification" && unreadCount > 0 && (
                  <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* 프로필 */}
        <div className="flex flex-col gap-2 border-t border-slate-100 p-3">
          <button
            onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("username"); router.replace("/"); }}
            className="flex items-center gap-2 rounded-lg px-1 py-1.5 hover:bg-slate-50"
            title="로그아웃"
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

      {/* ── 메인 영역 ── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-slate-50">

        {/* GNB */}
        <header className="flex h-[60px] flex-shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/dashboard")} className="cursor-pointer border-none bg-transparent p-0">
              <Logo />
            </button>
            <div className="h-5 w-px bg-slate-200" />
            <div>
              <p className="text-base font-bold text-slate-900">안녕하세요, {username}님 👋</p>
              <p className="text-xs text-slate-400">함께하는 {spaceName}, 즐겁게 준비해봐요!</p>
            </div>
          </div>
          <div className="flex h-9 w-[220px] items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4">
            <IconSearch />
            <input
              type="text"
              placeholder="장소, 일정 검색"
              className="flex-1 bg-transparent text-sm text-slate-600 outline-none placeholder:text-slate-400"
            />
          </div>
        </header>

        {/* 콘텐츠 */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <main className="flex flex-1 flex-col overflow-y-auto p-6">{children}</main>
          {rightPanel && (
            <aside className="flex w-[280px] flex-shrink-0 flex-col overflow-y-auto border-l border-slate-100 bg-white p-4">
              {rightPanel}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

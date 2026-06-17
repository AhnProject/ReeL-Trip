"use client";

import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/cn";
import {
  IconHome, IconCalendar, IconMapPin, IconSparkles, IconUsers,
  IconChat, IconBell, IconSettings, IconSearch, IconChevronDown, IconChevronRight,
} from "@/components/icons";

export type DashboardNavKey =
  | "dashboard" | "schedule" | "place" | "ai"
  | "member" | "chat" | "notification" | "settings";

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
            <IconChevronRight size={12} stroke="#CBD5E1" strokeWidth={2.5} />
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

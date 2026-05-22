"use client";

import { cn } from "@/lib/cn";
import type { TeamSpace, NavItem } from "../types";

interface NavEntry {
  key: NavItem;
  icon: string;
  label: string;
}

const NAV_ITEMS: NavEntry[] = [
  { key: "calendar",   icon: "📅", label: "여행 캘린더" },
  { key: "places",     icon: "📍", label: "장소 목록"   },
  { key: "search",     icon: "🔍", label: "장소 검색"   },
  { key: "url-parser", icon: "🔗", label: "URL로 추가"  },
];

interface Props {
  space: TeamSpace;
  activeNav: NavItem;
  onNavChange: (nav: NavItem) => void;
  onInviteClick: () => void;
}

export function SpaceSidebar({ space, activeNav, onNavChange, onInviteClick }: Props) {
  const owner = space.members.find((m) => m.role === "owner");

  return (
    <aside className="flex h-screen w-60 min-w-[240px] flex-col overflow-y-auto border-r border-white/5 bg-[#231B38] [scrollbar-width:none]">
      {/* 스페이스 헤더 */}
      <div className="border-b border-white/[0.08] px-4 pb-[14px] pt-[18px]">
        <div className="mb-2.5 flex items-center gap-2">
          <span className="text-xl">{space.emoji}</span>
          <span className="flex-1 text-[15px] font-bold leading-snug text-white">
            {space.name}
          </span>
        </div>
        <button
          onClick={onInviteClick}
          className="w-full cursor-pointer rounded-lg border border-brand-primary/40 bg-brand-primary/10 py-[7px] text-xs font-bold text-[#93B4FF]"
        >
          + 초대
        </button>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 px-2 pb-2 pt-3">
        <p className="mb-1 ml-2 text-[11px] font-bold uppercase tracking-[0.08em] text-white/35">
          메뉴
        </p>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavChange(item.key)}
            className={cn(
              "mb-0.5 flex w-full cursor-pointer items-center gap-2 rounded-lg border-none px-2.5 py-2 text-left text-[13.5px] transition-colors duration-100",
              activeNav === item.key
                ? "bg-brand-primary/[0.18] font-semibold text-[#93B4FF]"
                : "bg-transparent font-normal text-white/60",
            )}
          >
            <span className="w-[22px] flex-shrink-0 text-center text-base">
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* 멤버 목록 */}
      <div className="border-t border-white/[0.08] px-2 pb-3 pt-2">
        <p className="mb-1 ml-2 text-[11px] font-bold uppercase tracking-[0.08em] text-white/35">
          멤버 ({space.members.length})
        </p>
        {space.members.map((member) => (
          <div key={member.id} className="flex items-center gap-2 rounded-md px-2 py-[5px]">
            <div
              className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
              style={{ background: member.avatarColor }}
            >
              {member.username.slice(0, 1)}
            </div>
            <span className="flex-1 text-[13px] text-white/65">{member.username}</span>
            {member.role === "owner" && (
              <span className="rounded-full bg-brand-primary/30 px-1.5 py-px text-[10px] font-bold text-[#93B4FF]">
                방장
              </span>
            )}
          </div>
        ))}
      </div>

      {/* 푸터 */}
      {owner && (
        <div className="border-t border-white/[0.06] px-4 py-2.5">
          <span className="text-[11px] text-white/25">개설자 · {owner.username}</span>
        </div>
      )}
    </aside>
  );
}

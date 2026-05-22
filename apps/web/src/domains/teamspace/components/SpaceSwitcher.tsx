"use client";

import { cn } from "@/lib/cn";
import type { TeamSpace } from "../types";

interface Props {
  spaces: TeamSpace[];
  selectedId: string;
  username: string;
  onSelect: (id: string) => void;
  onLogout: () => void;
}

export function SpaceSwitcher({ spaces, selectedId, username, onSelect, onLogout }: Props) {
  return (
    <aside className="flex h-screen w-16 min-w-[64px] flex-col items-center bg-[#1A1424] pb-4 pt-3">
      {/* 로고 */}
      <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary">
        <span className="text-sm font-extrabold tracking-wider text-white">RT</span>
      </div>

      <div className="my-2 h-px w-9 bg-white/10" />

      {/* 스페이스 아이콘 목록 */}
      <div className="flex flex-1 flex-col items-center gap-2.5 overflow-y-auto pt-1 [scrollbar-width:none]">
        {spaces.map((space) => {
          const active = space.id === selectedId;
          return (
            <div key={space.id} className="relative flex items-center">
              {active && <div className="absolute -left-4 h-7 w-1 rounded-r bg-white" />}
              <button
                title={space.name}
                onClick={() => onSelect(space.id)}
                className="flex h-11 w-11 cursor-pointer items-center justify-center border-none transition-all duration-150"
                style={{
                  background: active ? space.bgColor : "#3D3550",
                  borderRadius: active ? 14 : 18,
                  transform: active ? "scale(1)" : "scale(0.9)",
                }}
              >
                <span className="text-[22px]">{space.emoji}</span>
              </button>
            </div>
          );
        })}

        {/* 스페이스 추가 */}
        <button
          title="새 팀스페이스 만들기"
          className="mt-0.5 flex h-11 w-11 cursor-pointer items-center justify-center rounded-[18px] border-2 border-dashed border-white/20 bg-transparent text-xl text-white/40"
        >
          +
        </button>
      </div>

      {/* 유저 아바타 (로그아웃) */}
      <div className="mt-auto">
        <div className="my-2 h-px w-9 bg-white/10" />
        <button
          title={`${username} · 로그아웃`}
          onClick={onLogout}
          className="mx-auto mt-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-none bg-brand-primary text-sm font-bold text-white"
        >
          {username.slice(0, 1).toUpperCase()}
        </button>
      </div>
    </aside>
  );
}

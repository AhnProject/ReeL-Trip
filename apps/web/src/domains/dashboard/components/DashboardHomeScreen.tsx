"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MOCK_TEAM_SPACES } from "@/domains/teamspace/mock";
import { HomeFeatureBanner } from "./HomeFeatureBanner";
import { HomeSpaceList } from "./HomeSpaceList";
import { HomeCalendarWidget } from "./HomeCalendarWidget";
import type { TeamSpace } from "@/domains/teamspace/types";

const FEATURED = {
  label: "다음 여행",
  title: "서울 문화 투어",
  sub: "5월 3일 · 3개 장소 · 친구 4명",
  memberColors: ["#EF4444", "#F59E0B", "#4A6CF7", "#10B981"],
};

export function DashboardHomeScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const name  = localStorage.getItem("username");
    if (!token) { router.replace("/"); return; }
    setUsername(name ?? "");
  }, [router]);

  if (!username) return null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    router.replace("/");
  };

  const handleEnterSpace = (space: TeamSpace) => {
    router.push(`/dashboard?space=${space.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEF2FF] to-slate-50 font-sans text-slate-900">
      {/* 상단 네비 */}
      <header className="sticky top-0 z-[100] flex h-[60px] items-center justify-between border-b border-brand-primary/10 bg-white/85 px-8 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-brand-primary">
            <span className="text-sm font-extrabold tracking-wider text-white">RT</span>
          </div>
          <span className="text-base font-bold text-slate-900">ReeL-Trip</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-[#F1F5FF] py-[5px] pl-[5px] pr-3">
            <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white">
              {username[0]?.toUpperCase()}
            </div>
            <span className="text-[13px] font-semibold text-slate-700">{username}</span>
          </div>
          <button
            onClick={handleLogout}
            className="cursor-pointer rounded-lg border border-slate-200 bg-transparent px-4 py-[7px] text-[13px] text-slate-500"
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* 2단 본문 */}
      <div className="mx-auto flex max-w-[1300px] items-start gap-6 px-8 pb-12 pt-8">
        {/* 좌측 */}
        <section className="flex min-w-0 flex-1 flex-col gap-6">
          {/* 인사 */}
          <div>
            <h1 className="mb-1.5 text-[26px] font-extrabold tracking-tight">
              안녕하세요, {username}님 👋
            </h1>
            <p className="text-sm text-slate-500">오늘도 멋진 여행을 계획해보세요.</p>
          </div>

          <HomeFeatureBanner
            {...FEATURED}
            onEnter={() => router.push("/dashboard")}
          />

          <HomeSpaceList
            spaces={MOCK_TEAM_SPACES}
            onEnter={handleEnterSpace}
            onSeeAll={() => router.push("/dashboard")}
          />
        </section>

        {/* 우측 위젯 */}
        <HomeCalendarWidget
          spaces={MOCK_TEAM_SPACES}
          onEnterSpace={handleEnterSpace}
          onMoreClick={() => router.push("/dashboard")}
        />
      </div>
    </div>
  );
}

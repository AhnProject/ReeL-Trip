"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MOCK_TEAM_SPACES } from "@/domains/teamspace/mock";
import { SpaceSwitcher } from "@/domains/teamspace/components/SpaceSwitcher";
import { SpaceSidebar } from "@/domains/teamspace/components/SpaceSidebar";
import { TravelCalendar } from "@/domains/teamspace/components/TravelCalendar";
import { UrlParserModal } from "@/app/dashboard/url-parser-modal";
import type { NavItem, TeamSpace } from "@/domains/teamspace/types";
import { Toast, useToast } from "@/components/Toast";

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

function DashboardInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const initialId    = searchParams.get("space") ?? MOCK_TEAM_SPACES[0].id;

  const [username, setUsername]         = useState("");
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>(initialId);
  const [activeNav, setActiveNav]       = useState<NavItem>("calendar");
  const [showUrlModal, setShowUrlModal] = useState(false);
  const { visible, showToast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const name  = localStorage.getItem("username");
    if (!token) { router.replace("/"); return; }
    setUsername(name ?? "");
  }, [router]);

  if (!username) return null;

  const selectedSpace: TeamSpace =
    MOCK_TEAM_SPACES.find((sp) => sp.id === selectedSpaceId) ?? MOCK_TEAM_SPACES[0];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    router.replace("/");
  };

  const handleSpaceChange = (id: string) => {
    setSelectedSpaceId(id);
    setActiveNav("calendar");
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans">
      <SpaceSwitcher
        spaces={MOCK_TEAM_SPACES}
        selectedId={selectedSpaceId}
        username={username}
        onSelect={handleSpaceChange}
        onLogout={handleLogout}
        onHomeClick={() => router.push("/dashboard/main")}
        onAddSpaceClick={showToast}
      />

      <SpaceSidebar
        space={selectedSpace}
        activeNav={activeNav}
        onNavChange={setActiveNav}
        onInviteClick={showToast}
      />

      <main className="flex min-w-0 flex-1 flex-col overflow-auto bg-slate-50">
        {activeNav === "calendar"    && <TravelCalendar space={selectedSpace} />}
        {activeNav === "places"      && <ComingSoon icon="📍" title="장소 목록"  desc="팀스페이스에 저장된 장소 목록을 관리합니다." />}
        {activeNav === "search"      && <ComingSoon icon="🔍" title="장소 검색"  desc="벡터 검색으로 유사한 여행지를 찾습니다." />}
        {activeNav === "url-parser"  && <UrlParserView onOpen={() => setShowUrlModal(true)} />}
      </main>

      {showUrlModal && (
        <UrlParserModal
          onClose={() => setShowUrlModal(false)}
          onAdd={(_: ParsedResult) => { /* TODO: 팀스페이스 장소 목록에 추가 */ }}
        />
      )}
      <Toast visible={visible} />
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

/* ── 서브 뷰 ── */

function ComingSoon({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 p-10 text-center text-slate-500">
      <span className="mb-2 block text-[52px]">{icon}</span>
      <h2 className="m-0 text-xl font-bold text-slate-900">{title}</h2>
      <p className="m-0 mb-4 text-sm leading-relaxed">{desc}</p>
      <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
        준비 중
      </span>
    </div>
  );
}

function UrlParserView({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="flex flex-1 items-center justify-center p-10">
      <div className="flex w-full max-w-[420px] flex-col items-center rounded-3xl border border-slate-200 bg-white px-10 py-12 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
        <span className="mb-3 block text-[48px]">🔗</span>
        <h2 className="mb-2 text-xl font-bold text-slate-900">URL로 추가</h2>
        <p className="mb-5 text-sm leading-relaxed text-slate-500">
          YouTube Shorts · Instagram Reels URL을 붙여넣으면<br />
          여행지 정보를 자동으로 추출합니다.
        </p>
        <button
          onClick={onOpen}
          className="cursor-pointer rounded-xl border-none bg-brand-primary px-7 py-3 text-sm font-bold text-white"
        >
          URL 붙여넣기
        </button>
      </div>
    </div>
  );
}

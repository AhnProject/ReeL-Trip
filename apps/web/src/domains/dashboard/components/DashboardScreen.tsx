"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SpaceSwitcher } from "@/domains/teamspace/components/SpaceSwitcher";
import { SpaceSidebar } from "@/domains/teamspace/components/SpaceSidebar";
import { TravelCalendar } from "@/domains/teamspace/components/TravelCalendar";
import { CreateSpaceModal } from "@/domains/teamspace/components/CreateSpaceModal";
import { UrlParserModal } from "@/app/dashboard/url-parser-modal";
import type { NavItem, TeamSpace } from "@/domains/teamspace/types";
import { Toast, useToast } from "@/components/Toast";
import { listTeamSpaces } from "@/domains/teamspace/api";
import type { TeamSpaceResponse } from "@/domains/teamspace/api";
import { addPlace } from "@/domains/place/api";

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

// API 응답을 기존 TeamSpace 타입으로 변환
function toTeamSpace(res: TeamSpaceResponse): TeamSpace {
  return {
    id: String(res.id),
    name: res.name,
    emoji: res.emoji ?? "✈️",
    bgColor: res.bgColor ?? "#4A6CF7",
    members: res.members.map((m) => ({
      id: String(m.userId),
      username: m.username,
      avatarColor: "#4A6CF7",
      role: m.role,
    })),
    events: [],
  };
}

function DashboardInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [username, setUsername]               = useState("");
  const [token, setToken]                     = useState("");
  const [spaces, setSpaces]                   = useState<TeamSpace[]>([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>("");
  const [activeNav, setActiveNav]             = useState<NavItem>("calendar");
  const [showUrlModal, setShowUrlModal]       = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { visible, showToast } = useToast();

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
        const found = converted.find((s) => s.id === paramId);
        setSelectedSpaceId(found ? found.id : converted[0].id);
      }
    }).catch(() => {});
  }, [router, searchParams]);

  if (!username) return null;

  const selectedSpace: TeamSpace | undefined = spaces.find((sp) => sp.id === selectedSpaceId) ?? spaces[0];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    router.replace("/");
  };

  const handleSpaceChange = (id: string) => {
    setSelectedSpaceId(id);
    setActiveNav("calendar");
  };

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
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans">
      {selectedSpace && (
        <>
          <SpaceSwitcher
            spaces={spaces}
            selectedId={selectedSpaceId}
            username={username}
            onSelect={handleSpaceChange}
            onLogout={handleLogout}
            onHomeClick={() => router.push("/dashboard/main")}
            onAddSpaceClick={() => setShowCreateModal(true)}
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
        </>
      )}

      {spaces.length === 0 && username && (
        <div className="flex flex-1 items-center justify-center text-slate-400">
          팀스페이스가 없습니다. 새 스페이스를 만들어보세요.
        </div>
      )}

      {showUrlModal && selectedSpace && (
        <UrlParserModal
          onClose={() => setShowUrlModal(false)}
          onAdd={handleAddPlace}
        />
      )}

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

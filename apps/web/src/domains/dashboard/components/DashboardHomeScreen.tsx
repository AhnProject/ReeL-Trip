"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/LoadingScreen";
import { HomeFeatureBanner } from "./HomeFeatureBanner";
import { HomeSpaceList } from "./HomeSpaceList";
import { HomeCalendarWidget } from "./HomeCalendarWidget";
import type { TodayEvent } from "./HomeCalendarWidget";
import { CreateSpaceModal } from "@/domains/teamspace/components/CreateSpaceModal";
import type { TeamSpace } from "@/domains/teamspace/types";
import { Toast, useToast } from "@/components/Toast";
import { listTeamSpaces } from "@/domains/teamspace/api";
import type { TeamSpaceResponse } from "@/domains/teamspace/api";
import { listEvents, updateEvent } from "@/domains/event/api";
import type { EventResponse } from "@/domains/event/api";

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

export function DashboardHomeScreen() {
  const router = useRouter();
  const { visible } = useToast();
  const [username, setUsername]           = useState("");
  const [token, setToken]                 = useState("");
  const [spaces, setSpaces]               = useState<TeamSpace[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [todayRawEvents, setTodayRawEvents]   = useState<EventResponse[]>([]);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const name        = localStorage.getItem("username");
    if (!storedToken) { router.replace("/"); return; }
    setToken(storedToken);
    setUsername(name ?? "");

    listTeamSpaces(storedToken).then((res) => {
      if (res.success && res.data) {
        setSpaces(res.data.map(toTeamSpace));

        if (res.data.length > 0) {
          const spaceId = res.data[0].id;
          const now     = new Date();
          const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
          const monthStr = todayStr.slice(0, 7);

          listEvents(spaceId, monthStr, storedToken).then((eventsRes) => {
            if (eventsRes.success && eventsRes.data) {
              const todayEvts = eventsRes.data.filter((e) => {
                const d = e.startDate.includes("T") ? e.startDate.split("T")[0] : e.startDate;
                return d === todayStr;
              });
              setTodayRawEvents(todayEvts);
            }
          }).catch((err) => console.error("[DashboardHomeScreen] listEvents", err));
        }
      }
    }).catch((err) => console.error("[DashboardHomeScreen] listTeamSpaces", err));
  }, [router]);

  if (!username) return <LoadingScreen />;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    router.replace("/");
  };

  const handleEnterSpace = (_space: TeamSpace) => {
    router.push("/dashboard/main");
  };

  /* ── 오늘 일정 확정/미정 토글 ── */
  const handleScheduleAction = async (id: number, confirmed: boolean) => {
    const raw = todayRawEvents.find((e) => e.id === id);
    if (!raw || !token) return;
    const newStatus = confirmed ? "pending" : "confirmed";
    setTodayRawEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e)),
    );
    await updateEvent(id, {
      title: raw.title,
      description: raw.description ?? undefined,
      startDate: raw.startDate,
      endDate: raw.endDate,
      location: raw.location ?? undefined,
      price: raw.price ?? undefined,
      color: raw.color,
      status: newStatus,
    }, token).catch(() => {
      setTodayRawEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: raw.status } : e)),
      );
    });
  };

  /* ── TodayEvent 변환 ── */
  const todayEvents: TodayEvent[] = todayRawEvents.map((e) => ({
    id: e.id,
    title: e.title,
    time: e.startDate.includes("T") ? (e.startDate.split("T")[1]?.slice(0, 5) ?? "") : "",
    price: e.price ?? "",
    confirmed: e.status === "confirmed",
  }));

  const featuredSpace = spaces[0];

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

          {featuredSpace ? (
            <HomeFeatureBanner
              label="다음 여행"
              title={featuredSpace.name}
              sub={`${featuredSpace.members.length}명 참여`}
              memberColors={featuredSpace.members.slice(0, 4).map((m) => m.avatarColor)}
              onEnter={() => router.push("/dashboard/main")}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-400">
              <span className="text-[40px]">✈️</span>
              <p className="text-sm">팀스페이스를 만들어 첫 여행을 시작해보세요</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="cursor-pointer rounded-xl border-none bg-brand-primary px-6 py-2.5 text-[13px] font-bold text-white"
              >
                + 팀스페이스 만들기
              </button>
            </div>
          )}

          <HomeSpaceList
            spaces={spaces}
            onEnter={handleEnterSpace}
            onSeeAll={() => router.push("/dashboard")}
            onAddSpace={() => setShowCreateModal(true)}
          />
        </section>

        {/* 우측 위젯 */}
        <HomeCalendarWidget
          spaces={spaces}
          todayEvents={todayEvents}
          onEnterSpace={handleEnterSpace}
          onMoreClick={() => router.push("/dashboard/calendar")}
          onScheduleActionClick={handleScheduleAction}
        />
      </div>

      {showCreateModal && (
        <CreateSpaceModal
          token={token}
          onClose={() => setShowCreateModal(false)}
          onCreated={(created) => {
            const newSpace = toTeamSpace(created);
            setSpaces((prev) => [...prev, newSpace]);
            setShowCreateModal(false);
          }}
        />
      )}

      <Toast visible={visible} />
    </div>
  );
}

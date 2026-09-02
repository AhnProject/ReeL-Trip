"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/LoadingScreen";
import { listTeamSpaces } from "@/domains/teamspace/api";
import type { TeamSpaceResponse, MemberResponse } from "@/domains/teamspace/api";
import { DashboardLayout } from "./DashboardLayout";
import { cn } from "@/lib/cn";

const AVATAR_COLORS = [
  "bg-brand-primary", "bg-purple-400", "bg-pink-400",
  "bg-green-400", "bg-amber-400", "bg-red-400",
];

export function MemberScreen() {
  const router = useRouter();
  const [username, setUsername]     = useState("");
  const [spaceName, setSpaceName]   = useState("여행 없음");
  const [spaceEmoji, setSpaceEmoji] = useState("✈️");
  const [members, setMembers]       = useState<MemberResponse[]>([]);
  const [inviteInput, setInviteInput] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const name        = localStorage.getItem("username");
    if (!storedToken) { router.replace("/"); return; }
    setUsername(name ?? "");
    listTeamSpaces(storedToken).then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        const sp = res.data[0] as TeamSpaceResponse;
        setSpaceName(sp.name);
        setSpaceEmoji(sp.emoji ?? "✈️");
        setMembers(sp.members);
      }
    }).catch((err) => console.error("[MemberScreen]", err));
  }, [router]);

  if (!username) return <LoadingScreen />;

  const owner  = members.find((m) => m.role === "owner");

  return (
    <DashboardLayout activeNav="member" username={username} spaceName={spaceName} spaceEmoji={spaceEmoji}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">멤버</h1>
          <p className="mt-1 text-sm text-slate-400">현재 {members.length}명이 함께하고 있어요</p>
        </div>
      </div>

      {/* 초대 박스 */}
      <div className="mb-6 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
        <p className="mb-3 text-sm font-bold text-slate-900">팀원 초대</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={inviteInput}
            onChange={(e) => setInviteInput(e.target.value)}
            placeholder="사용자명을 입력하세요"
            className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-brand-primary"
          />
          <button className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primaryHover">
            초대하기
          </button>
        </div>
      </div>

      {/* 멤버 목록 */}
      <div className="rounded-xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <p className="text-sm font-bold text-slate-900">멤버 목록</p>
        </div>
        <div className="flex flex-col divide-y divide-slate-50">
          {members.map((m, i) => (
            <div key={m.userId} className="flex items-center gap-4 px-5 py-4">
              <div className={cn(
                "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white",
                AVATAR_COLORS[i % AVATAR_COLORS.length],
              )}>
                {m.username[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">{m.username}</p>
                <p className="text-xs text-slate-400">{m.username.toLowerCase()}@reeltrip.com</p>
              </div>
              <span className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold",
                m.role === "owner"
                  ? "bg-brand-primary/10 text-brand-primary"
                  : "bg-slate-100 text-slate-500",
              )}>
                {m.role === "owner" ? "소유자" : "멤버"}
              </span>
              {m.role !== "owner" && username === owner?.username && (
                <button className="text-xs text-red-400 hover:text-red-500">내보내기</button>
              )}
            </div>
          ))}
          {members.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-400">멤버가 없습니다</div>
          )}
        </div>
      </div>

      {/* 역할 안내 */}
      <div className="mt-4 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
        <p className="mb-3 text-sm font-bold text-slate-900">역할 안내</p>
        <div className="flex flex-col gap-3">
          {[
            { role: "소유자", color: "bg-brand-primary/10 text-brand-primary", desc: "여행 스페이스 생성자. 모든 설정 권한 보유" },
            { role: "멤버",   color: "bg-slate-100 text-slate-500",            desc: "일정 추가·수정 가능. 스페이스 삭제 불가" },
          ].map((r) => (
            <div key={r.role} className="flex items-center gap-3">
              <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", r.color)}>{r.role}</span>
              <span className="text-xs text-slate-500">{r.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

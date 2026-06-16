"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/LoadingScreen";
import { listTeamSpaces } from "@/domains/teamspace/api";
import type { TeamSpaceResponse } from "@/domains/teamspace/api";
import { DashboardLayout } from "./DashboardLayout";
import { cn } from "@/lib/cn";

interface Message {
  id: number;
  author: string;
  text: string;
  time: string;
  isMine: boolean;
}

const DUMMY_MESSAGES: Message[] = [
  { id: 1, author: "민수",   text: "숙소 예약 어떻게 됐어요?",              time: "오전 10:12", isMine: false },
  { id: 2, author: "지은",   text: "아직 못 했어요 ㅠㅠ 오늘 저녁에 할게요", time: "오전 10:14", isMine: false },
  { id: 3, author: "나",     text: "제가 찾아봤는데 씨앤블루 어때요? 오션뷰에 가격도 적당해요", time: "오전 10:15", isMine: true },
  { id: 4, author: "민수",   text: "오 좋아 보이는데! 날짜 확인해볼게요",    time: "오전 10:16", isMine: false },
  { id: 5, author: "하람",   text: "저도 찬성! 일정에 추가해줘요",           time: "오전 10:18", isMine: false },
  { id: 6, author: "나",     text: "렌터카도 같이 알아볼까요? 8월 1일 오전에 공항 도착이니까", time: "오전 10:20", isMine: true },
  { id: 7, author: "정다해", text: "좋아요! 어디서 빌리는 게 나을까요",      time: "오전 10:22", isMine: false },
];

const AVATAR_COLORS: Record<string, string> = {
  "민수": "bg-brand-primary",
  "지은": "bg-purple-400",
  "하람": "bg-pink-400",
  "정다해": "bg-green-400",
};

export function ChatScreen() {
  const router  = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [username, setUsername]     = useState("");
  const [spaceName, setSpaceName]   = useState("여행 없음");
  const [spaceEmoji, setSpaceEmoji] = useState("✈️");
  const [messages, setMessages]     = useState<Message[]>(DUMMY_MESSAGES);
  const [input, setInput]           = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const name  = localStorage.getItem("username");
    if (!token) { router.replace("/"); return; }
    setUsername(name ?? "");
    listTeamSpaces(token).then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        const sp = res.data[0] as TeamSpaceResponse;
        setSpaceName(sp.name);
        setSpaceEmoji(sp.emoji ?? "✈️");
      }
    }).catch((err) => console.error("[ChatScreen]", err));
  }, [router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!username) return <LoadingScreen />;

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    const now = new Date();
    const time = `${now.getHours() < 12 ? "오전" : "오후"} ${now.getHours() % 12 || 12}:${String(now.getMinutes()).padStart(2, "0")}`;
    setMessages((prev) => [...prev, { id: Date.now(), author: "나", text, time, isMine: true }]);
    setInput("");
  };

  return (
    <DashboardLayout activeNav="chat" username={username} spaceName={spaceName} spaceEmoji={spaceEmoji}>
      <div className="flex h-full flex-col rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">

        {/* 채팅방 헤더 */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
          <span className="text-xl">{spaceEmoji}</span>
          <div>
            <p className="text-sm font-bold text-slate-900">{spaceName}</p>
            <p className="text-xs text-slate-400">팀 채팅</p>
          </div>
        </div>

        {/* 메시지 목록 */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex gap-3", msg.isMine && "flex-row-reverse")}>
              {!msg.isMine && (
                <div className={cn(
                  "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                  AVATAR_COLORS[msg.author] ?? "bg-slate-400",
                )}>
                  {msg.author[0]}
                </div>
              )}
              <div className={cn("flex flex-col gap-1", msg.isMine && "items-end")}>
                {!msg.isMine && (
                  <p className="text-xs font-semibold text-slate-600">{msg.author}</p>
                )}
                <div className={cn(
                  "max-w-[320px] rounded-2xl px-4 py-2.5 text-sm",
                  msg.isMine
                    ? "rounded-tr-sm bg-brand-primary text-white"
                    : "rounded-tl-sm bg-slate-100 text-slate-800",
                )}>
                  {msg.text}
                </div>
                <p className="text-[10px] text-slate-400">{msg.time}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* 입력창 */}
        <div className="border-t border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="메시지를 입력하세요..."
              className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
            <button
              onClick={handleSend}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary text-white hover:bg-brand-primaryHover"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

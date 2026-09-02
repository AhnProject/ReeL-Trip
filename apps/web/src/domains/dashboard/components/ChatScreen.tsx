"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/LoadingScreen";
import { listTeamSpaces } from "@/domains/teamspace/api";
import type { TeamSpaceResponse } from "@/domains/teamspace/api";
import { listMessages, sendMessage } from "@/domains/chat/api";
import type { MessageResponse } from "@/domains/chat/api";
import { DashboardLayout } from "./DashboardLayout";
import { cn } from "@/lib/cn";

const AVATAR_COLORS: Record<string, string> = {
  default: "bg-slate-400",
};

const AVATAR_COLOR_LIST = [
  "bg-brand-primary",
  "bg-purple-400",
  "bg-pink-400",
  "bg-green-400",
  "bg-yellow-400",
  "bg-orange-400",
];

function getAvatarColor(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLOR_LIST[Math.abs(hash) % AVATAR_COLOR_LIST.length] ?? AVATAR_COLORS.default;
}

function formatTime(sentAt: string): string {
  const date = new Date(sentAt);
  const h = date.getHours();
  const m = date.getMinutes();
  return `${h < 12 ? "오전" : "오후"} ${h % 12 || 12}:${String(m).padStart(2, "0")}`;
}

const POLL_INTERVAL_MS = 5000;

export function ChatScreen() {
  const router    = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [username, setUsername]   = useState("");
  const [token, setToken]         = useState("");
  const [spaceId, setSpaceId]     = useState<number | null>(null);
  const [spaceName, setSpaceName] = useState("여행 없음");
  const [spaceEmoji, setSpaceEmoji] = useState("✈️");
  const [messages, setMessages]   = useState<MessageResponse[]>([]);
  const [input, setInput]         = useState("");
  const [sending, setSending]     = useState(false);

  // 초기화: 토큰·유저명·팀스페이스 로드
  useEffect(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("username");
    if (!t) { router.replace("/"); return; }
    setToken(t);
    setUsername(u ?? "");
    listTeamSpaces(t).then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        const sp = res.data[0] as TeamSpaceResponse;
        setSpaceName(sp.name);
        setSpaceEmoji(sp.emoji ?? "✈️");
        setSpaceId(sp.id);
      }
    }).catch((err) => console.error("[ChatScreen] teamspace load:", err));
  }, [router]);

  // 메시지 목록 fetch
  const fetchMessages = useCallback(() => {
    if (!spaceId || !token) return;
    listMessages(spaceId, token).then((res) => {
      if (res.success && res.data) setMessages(res.data);
    }).catch((err) => console.error("[ChatScreen] fetch messages:", err));
  }, [spaceId, token]);

  // 초기 로드 + 5초 폴링
  useEffect(() => {
    fetchMessages();
    const timer = setInterval(fetchMessages, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [fetchMessages]);

  // 새 메시지 시 최하단 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!username) return <LoadingScreen />;

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !spaceId || sending) return;
    setSending(true);
    setInput("");
    try {
      const res = await sendMessage(spaceId, text, token);
      if (res.success && res.data) {
        setMessages((prev) => [...prev, res.data!]);
      }
    } catch (err) {
      console.error("[ChatScreen] send message:", err);
    } finally {
      setSending(false);
    }
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
          {messages.map((msg) => {
            const isMine = msg.authorUsername === username;
            return (
              <div key={msg.id} className={cn("flex gap-3", isMine && "flex-row-reverse")}>
                {!isMine && (
                  <div className={cn(
                    "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                    getAvatarColor(msg.authorUsername),
                  )}>
                    {msg.authorUsername[0]}
                  </div>
                )}
                <div className={cn("flex flex-col gap-1", isMine && "items-end")}>
                  {!isMine && (
                    <p className="text-xs font-semibold text-slate-600">{msg.authorUsername}</p>
                  )}
                  <div className={cn(
                    "max-w-[320px] rounded-2xl px-4 py-2.5 text-sm",
                    isMine
                      ? "rounded-tr-sm bg-brand-primary text-white"
                      : "rounded-tl-sm bg-slate-100 text-slate-800",
                  )}>
                    {msg.content}
                  </div>
                  <p className="text-[10px] text-slate-400">{formatTime(msg.sentAt)}</p>
                </div>
              </div>
            );
          })}
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
              disabled={sending}
              className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={sending || !input.trim()}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary text-white hover:bg-brand-primaryHover disabled:opacity-40"
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

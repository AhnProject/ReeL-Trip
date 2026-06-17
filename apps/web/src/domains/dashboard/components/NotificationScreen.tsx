"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/LoadingScreen";
import { listTeamSpaces } from "@/domains/teamspace/api";
import type { TeamSpaceResponse } from "@/domains/teamspace/api";
import { listNotifications, markAsRead } from "@/domains/notification/api";
import type { NotificationResponse } from "@/domains/notification/api";
import { DashboardLayout } from "./DashboardLayout";
import { cn } from "@/lib/cn";
import { timeAgo } from "@/lib/date";

const TYPE_META: Record<string, { icon: string; label: string; bg: string; color: string }> = {
  place:    { icon: "📍", label: "장소",   bg: "bg-blue-50",   color: "text-blue-500"   },
  schedule: { icon: "📅", label: "일정",   bg: "bg-green-50",  color: "text-green-600"  },
  ai:       { icon: "✨", label: "AI",     bg: "bg-purple-50", color: "text-purple-500" },
  member:   { icon: "👥", label: "멤버",   bg: "bg-orange-50", color: "text-orange-500" },
  default:  { icon: "🔔", label: "알림",   bg: "bg-slate-50",  color: "text-slate-500"  },
};

export function NotificationScreen() {
  const router = useRouter();
  const [username, setUsername]         = useState("");
  const [token, setToken]               = useState("");
  const [spaceName, setSpaceName]       = useState("여행 없음");
  const [spaceEmoji, setSpaceEmoji]     = useState("✈️");
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const name        = localStorage.getItem("username");
    if (!storedToken) { router.replace("/"); return; }
    setToken(storedToken);
    setUsername(name ?? "");
    listTeamSpaces(storedToken).then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        const sp = res.data[0] as TeamSpaceResponse;
        setSpaceName(sp.name);
        setSpaceEmoji(sp.emoji ?? "✈️");
      }
    }).catch((err) => console.error("[NotificationScreen]", err));
    listNotifications(storedToken).then((res) => {
      if (res.success && res.data) setNotifications(res.data);
    }).catch((err) => console.error("[NotificationScreen]", err));
  }, [router]);

  if (!username) return <LoadingScreen />;

  const unread = notifications.filter((n) => !n.isRead).length;

  const handleRead = async (id: number) => {
    await markAsRead(id, token).catch((err) => console.error("[NotificationScreen]", err));
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleReadAll = async () => {
    const unreadItems = notifications.filter((n) => !n.isRead);
    await Promise.all(unreadItems.map((n) => markAsRead(n.id, token))).catch((err) => console.error(err));
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <DashboardLayout activeNav="notification" username={username} spaceName={spaceName} spaceEmoji={spaceEmoji} unreadCount={unread}>
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">알림</h1>
          <p className="mt-1 text-sm text-slate-400">
            {unread > 0 ? `읽지 않은 알림 ${unread}개` : "모든 알림을 읽었어요"}
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={handleReadAll}
            className="text-sm text-brand-primary hover:underline"
          >
            모두 읽음 처리
          </button>
        )}
      </div>

      {/* 알림 목록 */}
      <div className="rounded-xl border border-slate-100 bg-white shadow-sm">
        {notifications.length === 0 ? (
          <div className="py-16 text-center">
            <p className="mb-2 text-4xl">🔔</p>
            <p className="text-sm text-slate-400">알림이 없습니다</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-slate-50">
            {notifications.map((n) => {
              const meta = TYPE_META[n.type ?? "default"] ?? TYPE_META.default;
              return (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && handleRead(n.id)}
                  className={cn(
                    "flex cursor-pointer items-start gap-4 px-5 py-4 transition-colors hover:bg-slate-50",
                    !n.isRead && "bg-brand-primary/[0.02]",
                  )}
                >
                  <div className={cn("flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg", meta.bg)}>
                    {meta.icon}
                  </div>
                  <div className="flex-1">
                    <p className={cn("text-sm", n.isRead ? "text-slate-500" : "font-semibold text-slate-900")}>
                      {n.message}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={cn("text-xs font-medium", meta.color)}>{meta.label}</span>
                      <span className="text-xs text-slate-400">{timeAgo(n.createdAt)}</span>
                    </div>
                  </div>
                  {!n.isRead && (
                    <div className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-brand-primary" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

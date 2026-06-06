import { useState } from "react";
import { useAuthStore } from "@/store/auth";
import { useSpaces } from "@/hooks/useSpaces";
import { useEvents, useToggleEvent } from "@/hooks/useEvents";
import { useNotifications } from "@/hooks/useNotifications";

function todayString() {
  const now = new Date();
  const y   = now.getFullYear();
  const m   = String(now.getMonth() + 1).padStart(2, "0");
  const d   = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function useHomeData() {
  const username = useAuthStore((s) => s.username);
  const [refreshing, setRefreshing] = useState(false);

  const spacesQuery    = useSpaces();
  const firstSpaceId   = spacesQuery.data?.[0]?.id ?? null;
  const todayStr       = todayString();
  const monthStr       = todayStr.slice(0, 7);

  const eventsQuery      = useEvents(firstSpaceId, monthStr);
  const notifsQuery      = useNotifications();
  const handleToggleEvent = useToggleEvent(firstSpaceId, monthStr);

  const todayEvents = (eventsQuery.data ?? []).filter((e) => {
    const d = e.startDate.includes("T") ? e.startDate.split("T")[0] : e.startDate;
    return d === todayStr;
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([spacesQuery.refetch(), eventsQuery.refetch(), notifsQuery.refetch()]);
    setRefreshing(false);
  };

  return {
    username,
    spaces:        spacesQuery.data ?? [],
    todayEvents,
    notifications: (notifsQuery.data ?? []).slice(0, 5),
    loading:       spacesQuery.isLoading,
    refreshing,
    handleRefresh,
    handleToggleEvent,
  };
}

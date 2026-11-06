import { useState } from "react";
import { useAuthStore } from "@/store/auth";
import { useSpaces } from "@/hooks/useSpaces";
import { useSpaceStore } from "@/store/space";
import { useEvents, useToggleEvent } from "@/hooks/useEvents";
import { useNotifications, useMarkNotificationRead, useDeleteNotification } from "@/hooks/useNotifications";
import { useTodos, useCreateTodo, useToggleTodo, useDeleteTodo } from "@/hooks/useTodos";

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
  const spaces         = spacesQuery.data ?? [];
  const selectedSpaceId = useSpaceStore((s) => s.selectedSpaceId);
  const currentSpaceId = spaces.some((s) => s.id === selectedSpaceId) ? selectedSpaceId : (spaces[0]?.id ?? null);
  const todayStr       = todayString();
  const monthStr       = todayStr.slice(0, 7);

  const eventsQuery      = useEvents(currentSpaceId, monthStr);
  const notifsQuery      = useNotifications();
  const handleReadNotification   = useMarkNotificationRead();
  const handleDeleteNotification = useDeleteNotification();
  const handleToggleEvent = useToggleEvent(currentSpaceId, monthStr);

  const todosQuery   = useTodos(currentSpaceId);
  const handleAddTodo    = useCreateTodo(currentSpaceId);
  const handleToggleTodo = useToggleTodo(currentSpaceId);
  const handleDeleteTodo = useDeleteTodo(currentSpaceId);

  const todayEvents = (eventsQuery.data ?? []).filter((e) => {
    const d = e.startDate.includes("T") ? e.startDate.split("T")[0] : e.startDate;
    return d === todayStr;
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([spacesQuery.refetch(), eventsQuery.refetch(), notifsQuery.refetch(), todosQuery.refetch()]);
    setRefreshing(false);
  };

  return {
    username,
    spaces:        spacesQuery.data ?? [],
    todayEvents,
    notifications: (notifsQuery.data ?? []).slice(0, 5),
    todos:         todosQuery.data ?? [],
    loading:       spacesQuery.isLoading,
    refreshing,
    handleRefresh,
    handleToggleEvent,
    handleAddTodo,
    handleToggleTodo,
    handleDeleteTodo,
    handleReadNotification,
    handleDeleteNotification,
  };
}

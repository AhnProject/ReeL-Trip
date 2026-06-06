import { useState } from "react";
import { useAuthStore } from "@/store/auth";
import { useSpaces } from "@/hooks/useSpaces";
import { useEvents, useToggleEvent } from "@/hooks/useEvents";

export function padZ(n: number) { return String(n).padStart(2, "0"); }
export function toDateStr(y: number, m: number, d: number) { return `${y}-${padZ(m + 1)}-${padZ(d)}`; }

export function useCalendarData() {
  const username = useAuthStore((s) => s.username);
  const today    = new Date();

  const [viewYear,      setViewYear]      = useState(today.getFullYear());
  const [viewMonth,     setViewMonth]     = useState(today.getMonth());
  const [selectedDate,  setSelectedDate]  = useState(
    toDateStr(today.getFullYear(), today.getMonth(), today.getDate()),
  );

  const spacesQuery  = useSpaces();
  const firstSpaceId = spacesQuery.data?.[0]?.id ?? null;
  const monthStr     = `${viewYear}-${padZ(viewMonth + 1)}`;

  const eventsQuery  = useEvents(firstSpaceId, monthStr);
  const handleToggle = useToggleEvent(firstSpaceId, monthStr);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const eventsOn = (d: string) => (eventsQuery.data ?? []).filter((e) => {
    const date = e.startDate.includes("T") ? e.startDate.split("T")[0] : e.startDate;
    return date === d;
  });

  return {
    username,
    spaceId: firstSpaceId,
    viewYear,
    viewMonth,
    selectedDate,
    today,
    setSelectedDate,
    prevMonth,
    nextMonth,
    handleToggle,
    eventsOn,
  };
}

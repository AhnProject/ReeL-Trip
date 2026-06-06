import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
import { listEvents, updateEvent } from "@/domains/event/api";
import type { EventResponse } from "@/domains/event/api";

export function useEvents(spaceId: number | null | undefined, monthStr: string) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["events", spaceId, monthStr],
    queryFn:  () => listEvents(spaceId!, monthStr, token!).then((r) => r.data ?? []),
    enabled:  !!token && !!spaceId,
    staleTime: 60_000,
  });
}

/** 낙관적 업데이트 포함 이벤트 상태 토글 */
export function useToggleEvent(spaceId: number | null | undefined, monthStr: string) {
  const token = useAuthStore((s) => s.token);
  const qc    = useQueryClient();
  const key   = ["events", spaceId, monthStr];

  return async (event: EventResponse) => {
    const newStatus = event.status === "confirmed" ? "pending" : "confirmed";

    qc.setQueryData<EventResponse[]>(key, (old) =>
      old?.map((e) => e.id === event.id ? { ...e, status: newStatus } : e) ?? [],
    );

    try {
      await updateEvent(event.id, {
        title:    event.title,
        startDate: event.startDate,
        endDate:  event.endDate,
        location: event.location ?? undefined,
        price:    event.price ?? undefined,
        color:    event.color,
        status:   newStatus,
      }, token!);
    } catch {
      qc.setQueryData<EventResponse[]>(key, (old) =>
        old?.map((e) => e.id === event.id ? { ...e, status: event.status } : e) ?? [],
      );
    }
  };
}

export function useInvalidateEvents() {
  const qc = useQueryClient();
  return (spaceId?: number) =>
    qc.invalidateQueries({ queryKey: spaceId ? ["events", spaceId] : ["events"] });
}

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
import { listNotifications, markAsRead, deleteNotification } from "@/domains/notification/api";
import type { NotificationResponse } from "@/domains/notification/api";
import { toast } from "@/store/toast";

const KEY = ["notifications"];

export function useNotifications() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: KEY,
    queryFn:  () => listNotifications(token!).then((r) => r.data ?? []),
    enabled:  !!token,
    staleTime: 60_000,
  });
}

/** 낙관적 업데이트 포함 읽음 처리 */
export function useMarkNotificationRead() {
  const token = useAuthStore((s) => s.token);
  const qc    = useQueryClient();

  return async (id: number) => {
    if (!token) return;
    const previous = qc.getQueryData<NotificationResponse[]>(KEY);
    qc.setQueryData<NotificationResponse[]>(KEY, (old) =>
      old?.map((n) => n.id === id ? { ...n, isRead: true } : n) ?? [],
    );
    try {
      await markAsRead(id, token);
    } catch {
      qc.setQueryData<NotificationResponse[]>(KEY, previous);
      toast.error("알림 읽음 처리에 실패했습니다");
    }
  };
}

export function useDeleteNotification() {
  const token = useAuthStore((s) => s.token);
  const qc    = useQueryClient();

  return async (id: number) => {
    if (!token) return;
    try {
      await deleteNotification(id, token);
      qc.setQueryData<NotificationResponse[]>(KEY, (old) => old?.filter((n) => n.id !== id) ?? []);
    } catch {
      toast.error("알림 삭제에 실패했습니다");
    }
  };
}

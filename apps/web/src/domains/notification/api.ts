import { apiRequest } from "@/lib/api-client";

export interface NotificationResponse {
  id: number;
  message: string;
  type: string | null;
  relatedSpaceId: number | null;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
}

export function listNotifications(token: string) {
  return apiRequest<NotificationResponse[]>("/api/notifications", {}, token);
}

export function getNotification(id: number, token: string) {
  return apiRequest<NotificationResponse>(`/api/notifications/${id}`, {}, token);
}

export function markAsRead(id: number, token: string) {
  return apiRequest<NotificationResponse>(`/api/notifications/${id}/read`, { method: "PUT" }, token);
}

export function deleteNotification(id: number, token: string) {
  return apiRequest<void>(`/api/notifications/${id}`, { method: "DELETE" }, token);
}

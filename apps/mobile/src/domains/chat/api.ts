import { apiRequest } from "@/lib/api-client";

export interface MessageResponse {
  id: number;
  spaceId: number;
  authorUsername: string;
  content: string;
  sentAt: string;
}

export function listMessages(spaceId: number, token: string) {
  return apiRequest<MessageResponse[]>(`/api/messages?spaceId=${spaceId}`, {}, token);
}

export function sendMessage(spaceId: number, content: string, token: string) {
  return apiRequest<MessageResponse>("/api/messages", {
    method: "POST",
    body: JSON.stringify({ spaceId, content }),
  }, token);
}

import { apiRequest } from "@/lib/api-client";

export interface EventResponse {
  id: number;
  spaceId: number;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  location: string | null;
  price: string | null;
  color: string;
  status: "confirmed" | "pending";
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventPayload {
  spaceId: number;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  price?: string;
  color?: string;
  status?: string;
}

export function listEvents(spaceId: number, month: string | null, token: string) {
  const params = new URLSearchParams({ spaceId: String(spaceId) });
  if (month) params.set("month", month);
  return apiRequest<EventResponse[]>(`/api/events?${params}`, {}, token);
}

export function getEvent(id: number, token: string) {
  return apiRequest<EventResponse>(`/api/events/${id}`, {}, token);
}

export function createEvent(payload: CreateEventPayload, token: string) {
  return apiRequest<EventResponse>("/api/events", {
    method: "POST",
    body: JSON.stringify(payload),
  }, token);
}

export function updateEvent(id: number, payload: Omit<CreateEventPayload, "spaceId">, token: string) {
  return apiRequest<EventResponse>(`/api/events/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }, token);
}

export function deleteEvent(id: number, token: string) {
  return apiRequest<void>(`/api/events/${id}`, { method: "DELETE" }, token);
}

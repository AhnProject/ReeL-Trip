import { apiRequest } from "@/lib/api-client";

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  plan: string;
  avatar: string | null;
  createdAt: string;
}

export function getProfile(token: string) {
  return apiRequest<UserProfile>("/api/user/profile", {}, token);
}

export function updateProfile(payload: { email?: string }, token: string) {
  return apiRequest<UserProfile>("/api/user/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  }, token);
}

export function updateAvatar(avatar: string, token: string) {
  return apiRequest<UserProfile>("/api/user/avatar", {
    method: "PUT",
    body: JSON.stringify({ avatar }),
  }, token);
}

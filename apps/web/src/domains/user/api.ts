import { apiRequest } from "@/lib/api-client";

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  plan: string;
  createdAt: string;
}

export interface AvatarResponse {
  avatar: string | null;
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

export function getAvatar(token: string) {
  return apiRequest<AvatarResponse>("/api/user/avatar", {}, token);
}

export function updateAvatar(avatar: string, token: string) {
  return apiRequest<AvatarResponse>("/api/user/avatar", {
    method: "PUT",
    body: JSON.stringify({ avatar }),
  }, token);
}

export function deleteAccount(token: string) {
  return apiRequest<null>("/api/user/account", { method: "DELETE" }, token);
}

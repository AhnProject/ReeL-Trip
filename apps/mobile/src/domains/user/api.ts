import { apiRequest } from "@/lib/api-client";

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  plan: string;
  createdAt: string;
}

export function getProfile(token: string) {
  return apiRequest<UserProfile>("/api/profile", {}, token);
}

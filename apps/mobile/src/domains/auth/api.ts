import { apiRequest } from "@/lib/api-client";
import type { AuthResponse } from "@reel-trip/types";

export function login(payload: { username: string; password: string }) {
  return apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function signup(payload: { username: string; email: string; password: string }) {
  return apiRequest<AuthResponse>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

import type { AuthResponse } from "@reel-trip/types";

export function persistSession(data: AuthResponse) {
  localStorage.setItem("token", data.accessToken);
  localStorage.setItem("username", data.username);
}

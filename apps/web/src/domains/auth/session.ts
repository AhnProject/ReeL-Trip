import type { AuthResponse } from "@reel-trip/types";

// ── 세션 저장 ─────────────────────────────────────────────────────────────────

export function persistSession(data: AuthResponse, autoLogin: boolean) {
  localStorage.setItem("token", data.accessToken);
  localStorage.setItem("username", data.username);
  if (autoLogin) {
    localStorage.setItem("refresh_token", data.refreshToken);
  }
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("username");
}

// ── 아이디 저장 ───────────────────────────────────────────────────────────────

export function getSavedUsername(): string {
  return localStorage.getItem("saved_username") ?? "";
}

export function setSavedUsername(username: string, save: boolean) {
  if (save) {
    localStorage.setItem("saved_username", username);
  } else {
    localStorage.removeItem("saved_username");
  }
}

// ── 설정 플래그 ───────────────────────────────────────────────────────────────

export function getAutoLoginEnabled(): boolean {
  return localStorage.getItem("auto_login") === "true";
}

export function setAutoLoginEnabled(enabled: boolean) {
  localStorage.setItem("auto_login", enabled ? "true" : "false");
}

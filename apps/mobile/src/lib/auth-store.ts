import * as SecureStore from "expo-secure-store";

const TOKEN_KEY          = "reel_trip_token";
const REFRESH_TOKEN_KEY  = "reel_trip_refresh_token";
const USERNAME_KEY       = "reel_trip_username";
const SAVED_USERNAME_KEY = "reel_trip_saved_username";
const AUTO_LOGIN_KEY     = "reel_trip_auto_login";

// ── Access Token ──────────────────────────────────────────────────────────────

export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function removeToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

// ── Refresh Token ─────────────────────────────────────────────────────────────

export async function saveRefreshToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function removeRefreshToken(): Promise<void> {
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

// ── Current Username ──────────────────────────────────────────────────────────

export async function saveUsername(username: string): Promise<void> {
  await SecureStore.setItemAsync(USERNAME_KEY, username);
}

export async function getUsername(): Promise<string | null> {
  return SecureStore.getItemAsync(USERNAME_KEY);
}

export async function removeUsername(): Promise<void> {
  await SecureStore.deleteItemAsync(USERNAME_KEY);
}

// ── Saved Username (아이디 저장) ───────────────────────────────────────────────

export async function saveSavedUsername(username: string): Promise<void> {
  await SecureStore.setItemAsync(SAVED_USERNAME_KEY, username);
}

export async function getSavedUsername(): Promise<string | null> {
  return SecureStore.getItemAsync(SAVED_USERNAME_KEY);
}

export async function removeSavedUsername(): Promise<void> {
  await SecureStore.deleteItemAsync(SAVED_USERNAME_KEY);
}

// ── Auto Login Flag ───────────────────────────────────────────────────────────

export async function saveAutoLoginFlag(enabled: boolean): Promise<void> {
  await SecureStore.setItemAsync(AUTO_LOGIN_KEY, enabled ? "true" : "false");
}

export async function getAutoLoginFlag(): Promise<boolean> {
  const val = await SecureStore.getItemAsync(AUTO_LOGIN_KEY);
  return val === "true";
}

// ── Clear Auth (토큰만 삭제, 설정값은 유지) ────────────────────────────────────

export async function clearAuth(): Promise<void> {
  await Promise.all([removeToken(), removeRefreshToken(), removeUsername()]);
}

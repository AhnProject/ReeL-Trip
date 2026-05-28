import type { ApiResponse } from "@reel-trip/types";
import Constants from "expo-constants";

// 개발환경: Metro 서버 호스트에서 API 포트(4000)를 자동 추론
// 프로덕션: EXPO_PUBLIC_API_URL 환경변수 사용
function getBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // Expo Go / dev build: Metro 호스트 기반으로 추론 (localhost 문제 우회)
  const metroHost =
    Constants.expoConfig?.hostUri?.split(":")[0] ?? "localhost";
  return `http://${metroHost}:4000`;
}

const BASE_URL = getBaseUrl();

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
  token?: string,
  timeoutMs = 10000,
): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const headers = new Headers(init?.headers);

  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers,
      signal: controller.signal,
    });
    return response.json() as Promise<ApiResponse<T>>;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Request timed out");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

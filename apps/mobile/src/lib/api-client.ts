import type { ApiResponse } from "@reel-trip/types";
import Constants from "expo-constants";
import { useAuthStore } from "@/store/auth";

// 개발환경: Metro 서버 호스트에서 API 포트(4000)를 자동 추론
// 프로덕션: EXPO_PUBLIC_API_URL 환경변수 사용
function getBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  const metroHost =
    Constants.expoConfig?.hostUri?.split(":")[0] ?? "localhost";
  return `http://${metroHost}:4000`;
}

export const BASE_URL = getBaseUrl();

// 동시 401 발생 시 refresh 요청을 하나로 합치기 위한 promise 공유
let refreshPromise: Promise<string | null> | null = null;

async function attemptRefresh(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) return null;

  refreshPromise = (async (): Promise<string | null> => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ refreshToken }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        const { setAuth, autoLogin } = useAuthStore.getState();
        // autoLogin 설정에 따라 refresh token 저장 여부가 setAuth 내부에서 결정됨
        setAuth(data.data.accessToken, data.data.username, data.data.refreshToken);
        return data.data.accessToken;
      }
      useAuthStore.getState().clearAuth();
      return null;
    } catch {
      useAuthStore.getState().clearAuth();
      return null;
    }
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

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

    if (response.status === 401) {
      // refresh 엔드포인트 자체가 401이면 무한 루프 방지
      if (path === "/api/auth/refresh") {
        useAuthStore.getState().clearAuth();
        return {
          success:   false,
          data:      null,
          message:   "인증이 만료되었습니다. 다시 로그인해주세요.",
          errorCode: "UNAUTHORIZED",
          timestamp: Date.now(),
        } as ApiResponse<T>;
      }

      const newToken = await attemptRefresh();
      if (newToken) {
        // 새 토큰으로 원래 요청 재시도
        const retryHeaders = new Headers(init?.headers);
        if (!retryHeaders.has("Content-Type") && init?.body) {
          retryHeaders.set("Content-Type", "application/json");
        }
        retryHeaders.set("Authorization", `Bearer ${newToken}`);

        const retryController = new AbortController();
        const retryTimer = setTimeout(() => retryController.abort(), timeoutMs);
        try {
          const retryResponse = await fetch(`${BASE_URL}${path}`, {
            ...init,
            headers: retryHeaders,
            signal:  retryController.signal,
          });
          return retryResponse.json() as Promise<ApiResponse<T>>;
        } finally {
          clearTimeout(retryTimer);
        }
      }

      return {
        success:   false,
        data:      null,
        message:   "인증이 만료되었습니다. 다시 로그인해주세요.",
        errorCode: "UNAUTHORIZED",
        timestamp: Date.now(),
      } as ApiResponse<T>;
    }

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

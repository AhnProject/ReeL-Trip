import type { ApiResponse } from "@reel-trip/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

// 동시 401 발생 시 refresh 요청을 하나로 합치기 위한 promise 공유
let refreshPromise: Promise<string | null> | null = null;

async function attemptRefresh(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  if (typeof window === "undefined") return null;

  const refreshToken = localStorage.getItem("refresh_token");
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
        localStorage.setItem("token", data.data.accessToken);
        localStorage.setItem("username", data.data.username);
        // 자동 로그인이 활성화된 경우 새 refresh token으로 교체
        if (localStorage.getItem("auto_login") === "true") {
          localStorage.setItem("refresh_token", data.data.refreshToken);
        }
        return data.data.accessToken;
      }
      // refresh 실패 → 세션 초기화
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("username");
      window.location.href = "/auth/login";
      return null;
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("username");
      window.location.href = "/auth/login";
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
): Promise<ApiResponse<T>> {
  const headers = new Headers(init?.headers);

  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  if (response.status === 401) {
    // refresh 엔드포인트 자체가 401이면 무한 루프 방지
    if (path === "/api/auth/refresh") {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("username");
        window.location.href = "/auth/login";
      }
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
      const retryHeaders = new Headers(init?.headers);
      if (!retryHeaders.has("Content-Type") && init?.body) {
        retryHeaders.set("Content-Type", "application/json");
      }
      retryHeaders.set("Authorization", `Bearer ${newToken}`);
      const retryResponse = await fetch(`${BASE_URL}${path}`, {
        ...init,
        headers: retryHeaders,
      });
      return retryResponse.json() as Promise<ApiResponse<T>>;
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
}

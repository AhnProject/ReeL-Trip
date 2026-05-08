import type { ApiResponse } from "@reel-trip/types";

const BASE_URL = "";

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
  token?: string
): Promise<ApiResponse<T>> {
  const headers = new Headers(init?.headers);

  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  return response.json() as Promise<ApiResponse<T>>;
}

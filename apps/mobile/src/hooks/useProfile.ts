import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
import { getProfile, getAvatar } from "@/domains/user/api";

export function useProfile() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["profile"],
    queryFn:  () => getProfile(token!).then((r) => r.data ?? null),
    enabled:  !!token,
    staleTime: 5 * 60_000,
  });
}

/** avatar는 /profile과 분리된 엔드포인트 — 용량이 커질 수 있어 필요한 화면에서만 조회 */
export function useAvatar() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["avatar"],
    queryFn:  () => getAvatar(token!).then((r) => r.data ?? null),
    enabled:  !!token,
    staleTime: 5 * 60_000,
  });
}

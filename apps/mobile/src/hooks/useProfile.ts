import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
import { getProfile } from "@/domains/user/api";

export function useProfile() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["profile"],
    queryFn:  () => getProfile(token!).then((r) => r.data ?? null),
    enabled:  !!token,
    staleTime: 5 * 60_000,
  });
}

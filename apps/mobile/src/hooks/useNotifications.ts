import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
import { listNotifications } from "@/domains/notification/api";

export function useNotifications() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["notifications"],
    queryFn:  () => listNotifications(token!).then((r) => r.data ?? []),
    enabled:  !!token,
    staleTime: 60_000,
  });
}

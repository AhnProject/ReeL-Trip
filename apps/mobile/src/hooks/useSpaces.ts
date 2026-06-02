import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
import { listTeamSpaces, createTeamSpace } from "@/domains/teamspace/api";
import { toast } from "@/store/toast";

export function useSpaces() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["spaces"],
    queryFn:  () => listTeamSpaces(token!).then((r) => r.data ?? []),
    enabled:  !!token,
    staleTime: 30_000,
  });
}

export function useInvalidateSpaces() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["spaces"] });
}

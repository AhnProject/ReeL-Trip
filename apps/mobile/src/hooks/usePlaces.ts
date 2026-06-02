import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
import { listPlaces } from "@/domains/place/api";

export function usePlaces(spaceId: number | null | undefined) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["places", spaceId],
    queryFn:  () => listPlaces(spaceId!, token!).then((r) => r.data ?? []),
    enabled:  !!token && !!spaceId,
    staleTime: 30_000,
  });
}

export function useInvalidatePlaces() {
  const qc = useQueryClient();
  return (spaceId?: number) =>
    qc.invalidateQueries({ queryKey: spaceId ? ["places", spaceId] : ["places"] });
}

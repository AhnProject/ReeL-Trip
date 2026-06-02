import { useState } from "react";
import { useAuthStore } from "@/store/auth";
import { useSpaces } from "@/hooks/useSpaces";
import { usePlaces } from "@/hooks/usePlaces";
import { updatePlace } from "@/domains/place/api";

export function useTravelData() {
  const token    = useAuthStore((s) => s.token);
  const [selectedIdx,  setSelectedIdx]  = useState(0);
  const [confirmedIds, setConfirmedIds] = useState<Set<number>>(new Set());

  const spacesQuery  = useSpaces();
  const spaces       = spacesQuery.data ?? [];
  const currentSpace = spaces[selectedIdx] ?? null;

  const placesQuery  = usePlaces(currentSpace?.id ?? null);
  const places       = placesQuery.data ?? [];

  const handleToggleConfirm = (placeId: number) => {
    setConfirmedIds((prev) => {
      const next = new Set(prev);
      if (next.has(placeId)) next.delete(placeId);
      else next.add(placeId);
      return next;
    });
    if (token) updatePlace(placeId, {}, token).catch(() => {});
  };

  return {
    spaces,
    selectedIdx,
    setSelectedIdx,
    places,
    confirmedIds,
    loading:      spacesQuery.isLoading,
    currentSpace,
    handleToggleConfirm,
  };
}

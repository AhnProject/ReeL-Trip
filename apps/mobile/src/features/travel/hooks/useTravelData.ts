import { useState } from "react";
import { useAuthStore } from "@/store/auth";
import { useSpaces } from "@/hooks/useSpaces";
import { usePlaces } from "@/hooks/usePlaces";
import { updatePlace } from "@/domains/place/api";
import { toast } from "@/store/toast";

export function useTravelData() {
  const token    = useAuthStore((s) => s.token);
  const [selectedIdx,  setSelectedIdx]  = useState(0);
  const [confirmedIds, setConfirmedIds] = useState<Set<number>>(new Set());

  const spacesQuery  = useSpaces();
  const spaces       = spacesQuery.data ?? [];
  const currentSpace = spaces[selectedIdx] ?? null;

  const placesQuery  = usePlaces(currentSpace?.id ?? null);
  const places       = placesQuery.data ?? [];

  const toggleConfirmedId = (placeId: number) => {
    setConfirmedIds((prev) => {
      const next = new Set(prev);
      if (next.has(placeId)) next.delete(placeId);
      else next.add(placeId);
      return next;
    });
  };

  const handleToggleConfirm = (placeId: number) => {
    toggleConfirmedId(placeId);
    if (!token) return;
    updatePlace(placeId, {}, token).then((res) => {
      if (!res.success) {
        toggleConfirmedId(placeId);
        toast.error("저장에 실패했습니다");
      }
    }).catch(() => {
      toggleConfirmedId(placeId);
      toast.error("저장에 실패했습니다");
    });
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

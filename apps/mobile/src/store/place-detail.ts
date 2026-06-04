import { create } from "zustand";
import type { PlaceResponse } from "@/domains/place/api";

interface PlaceDetailState {
  place: PlaceResponse | null;
  setPlace: (p: PlaceResponse | null) => void;
}

export const usePlaceDetailStore = create<PlaceDetailState>((set) => ({
  place: null,
  setPlace: (p) => set({ place: p }),
}));

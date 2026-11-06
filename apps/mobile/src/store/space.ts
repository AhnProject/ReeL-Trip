import { create } from "zustand";

interface SpaceState {
  selectedSpaceId: number | null;
  setSelectedSpaceId: (id: number | null) => void;
}

export const useSpaceStore = create<SpaceState>((set) => ({
  selectedSpaceId: null,
  setSelectedSpaceId: (id) => set({ selectedSpaceId: id }),
}));

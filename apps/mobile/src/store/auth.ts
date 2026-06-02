import { create } from "zustand";
import {
  getToken,
  getUsername,
  saveToken,
  saveUsername,
  clearAuth as clearSecureStore,
} from "@/lib/auth-store";

interface AuthState {
  token:    string | null;
  username: string;
  isReady:  boolean;
  setAuth:         (token: string, username: string) => void;
  clearAuth:       () => void;
  initFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token:    null,
  username: "",
  isReady:  false,

  setAuth: (token, username) => {
    saveToken(token);
    saveUsername(username);
    set({ token, username });
  },

  clearAuth: () => {
    clearSecureStore();
    set({ token: null, username: "" });
  },

  initFromStorage: async () => {
    const [tok, name] = await Promise.all([getToken(), getUsername()]);
    set({ token: tok, username: name ?? "", isReady: true });
  },
}));

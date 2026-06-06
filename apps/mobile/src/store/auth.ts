import { create } from "zustand";
import {
  getToken,
  getRefreshToken,
  getUsername,
  getSavedUsername,
  getAutoLoginFlag,
  saveToken,
  saveRefreshToken,
  saveUsername,
  saveSavedUsername,
  saveAutoLoginFlag,
  removeSavedUsername,
  clearAuth as clearSecureStore,
} from "@/lib/auth-store";

interface AuthState {
  token:         string | null;
  refreshToken:  string | null;
  username:      string;
  savedUsername: string;    // 아이디 저장용 (로그인 폼 pre-fill)
  autoLogin:     boolean;   // 자동 로그인 설정
  isReady:       boolean;

  setAuth:         (token: string, username: string, refreshToken: string) => void;
  clearAuth:       () => void;
  initFromStorage: () => Promise<void>;
  setSavedUsername:(username: string, save: boolean) => void;
  setAutoLogin:    (enabled: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token:         null,
  refreshToken:  null,
  username:      "",
  savedUsername: "",
  autoLogin:     false,
  isReady:       false,

  setAuth: (token, username, refreshToken) => {
    saveToken(token);
    saveUsername(username);
    if (get().autoLogin) {
      saveRefreshToken(refreshToken);
    }
    set({ token, username, refreshToken });
  },

  clearAuth: () => {
    clearSecureStore();
    set({ token: null, refreshToken: null, username: "" });
  },

  initFromStorage: async () => {
    const [tok, refreshTok, name, savedName, autoLoginFlag] = await Promise.all([
      getToken(),
      getRefreshToken(),
      getUsername(),
      getSavedUsername(),
      getAutoLoginFlag(),
    ]);
    set({
      token:         tok,
      refreshToken:  refreshTok,
      username:      name ?? "",
      savedUsername: savedName ?? "",
      autoLogin:     autoLoginFlag,
      isReady:       true,
    });
  },

  setSavedUsername: (username, save) => {
    if (save) {
      saveSavedUsername(username);
      set({ savedUsername: username });
    } else {
      removeSavedUsername();
      set({ savedUsername: "" });
    }
  },

  setAutoLogin: (enabled) => {
    saveAutoLoginFlag(enabled);
    if (!enabled) {
      // 자동 로그인 해제 시 refresh token도 제거
      const { refreshToken } = get();
      if (refreshToken) {
        // store에서만 제거 (서버 로그아웃은 명시적 로그아웃 시)
        import("@/lib/auth-store").then(({ removeRefreshToken }) => removeRefreshToken());
      }
      set({ autoLogin: false, refreshToken: null });
    } else {
      // 자동 로그인 활성화 시 현재 refresh token 저장
      const { refreshToken } = get();
      if (refreshToken) saveRefreshToken(refreshToken);
      set({ autoLogin: true });
    }
  },
}));

import { create } from "zustand";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id:      string;
  type:    ToastType;
  message: string;
}

interface ToastState {
  toasts: ToastItem[];
  show:   (type: ToastType, message: string) => void;
  hide:   (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  show: (type, message) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },

  hide: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** 컴포넌트 외부에서도 사용 가능한 toast 유틸 */
export const toast = {
  success: (message: string) => useToastStore.getState().show("success", message),
  error:   (message: string) => useToastStore.getState().show("error", message),
  info:    (message: string) => useToastStore.getState().show("info", message),
};

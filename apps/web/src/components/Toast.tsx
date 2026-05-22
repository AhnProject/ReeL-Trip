"use client";

import { useEffect, useState } from "react";

interface Props {
  visible: boolean;
  message?: string;
}

export function Toast({ visible, message = "준비중인 기능입니다." }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (visible) {
      setMounted(true);
    } else {
      const t = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [visible]);

  if (!mounted) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-8 left-1/2 z-[9999] -translate-x-1/2 transition-all duration-300"
      style={{ opacity: visible ? 1 : 0, transform: `translateX(-50%) translateY(${visible ? 0 : 8}px)` }}
    >
      <div
        className="flex items-center gap-2 rounded-2xl px-5 py-3 text-[13px] font-semibold text-white shadow-lg"
        style={{ background: "rgba(30,30,40,0.88)", backdropFilter: "blur(8px)" }}
      >
        <span>🔧</span>
        {message}
      </div>
    </div>
  );
}

/** 각 화면에서 사용하는 토스트 훅 */
export function useToast(duration = 2000) {
  const [visible, setVisible] = useState(false);

  const showToast = () => {
    setVisible(true);
    setTimeout(() => setVisible(false), duration);
  };

  return { visible, showToast };
}

"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[App Error]", error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-slate-50">
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-10 py-10 shadow-sm">
        <span className="text-4xl">⚠️</span>
        <h2 className="text-lg font-bold text-slate-800">문제가 발생했습니다</h2>
        <p className="text-sm text-slate-500">잠시 후 다시 시도해주세요.</p>
        <button
          onClick={reset}
          className="mt-2 cursor-pointer rounded-xl border-none bg-[#4A6CF7] px-6 py-2.5 text-sm font-semibold text-white"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}

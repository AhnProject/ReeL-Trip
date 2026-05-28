"use client";

import { useState } from "react";
import { createEvent } from "@/domains/event/api";
import type { EventResponse } from "@/domains/event/api";

const COLOR_OPTIONS = [
  "#4A6CF7", "#7C3AED", "#DB2777", "#DC2626",
  "#D97706", "#16A34A", "#0891B2", "#64748B",
];

interface Props {
  spaceId: number;
  token: string;
  defaultDate: string;
  onClose: () => void;
  onCreated: (event: EventResponse) => void;
}

export function CreateEventModal({ spaceId, token, defaultDate, onClose, onCreated }: Props) {
  const [title, setTitle]       = useState("");
  const [startDate, setStartDate] = useState(defaultDate);
  const [endDate, setEndDate]   = useState(defaultDate);
  const [location, setLocation] = useState("");
  const [price, setPrice]       = useState("");
  const [color, setColor]       = useState("#4A6CF7");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async () => {
    if (!title.trim()) { setError("제목을 입력해주세요."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await createEvent({
        spaceId,
        title: title.trim(),
        startDate,
        endDate,
        location: location.trim() || undefined,
        price: price.trim() || undefined,
        color,
        status: "pending",
      }, token);
      if (res.success && res.data) {
        onCreated(res.data);
      } else {
        setError("일정 생성에 실패했습니다.");
      }
    } catch {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="mb-4 text-lg font-bold text-slate-900">일정 추가</h2>

        <label className="mb-1 block text-[12px] font-semibold text-slate-600">제목 *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 성수 재즈 페스티벌"
          maxLength={50}
          autoFocus
          className="mb-4 w-full rounded-xl border px-3 py-2 text-[13px] text-slate-800 outline-none focus:border-[#4A6CF7]"
          style={{ borderColor: "#E2E6F0" }}
          onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
        />

        <div className="mb-4 flex gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-[12px] font-semibold text-slate-600">시작일</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (e.target.value > endDate) setEndDate(e.target.value);
              }}
              className="w-full rounded-xl border px-3 py-2 text-[13px] text-slate-800 outline-none focus:border-[#4A6CF7]"
              style={{ borderColor: "#E2E6F0" }}
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-[12px] font-semibold text-slate-600">종료일</label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-[13px] text-slate-800 outline-none focus:border-[#4A6CF7]"
              style={{ borderColor: "#E2E6F0" }}
            />
          </div>
        </div>

        <label className="mb-1 block text-[12px] font-semibold text-slate-600">장소</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="예: 서울 성동구"
          className="mb-4 w-full rounded-xl border px-3 py-2 text-[13px] text-slate-800 outline-none focus:border-[#4A6CF7]"
          style={{ borderColor: "#E2E6F0" }}
        />

        <label className="mb-1 block text-[12px] font-semibold text-slate-600">가격</label>
        <input
          type="text"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="예: ₩35,000"
          className="mb-4 w-full rounded-xl border px-3 py-2 text-[13px] text-slate-800 outline-none focus:border-[#4A6CF7]"
          style={{ borderColor: "#E2E6F0" }}
        />

        <label className="mb-1 block text-[12px] font-semibold text-slate-600">색상</label>
        <div className="mb-5 flex gap-2">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="h-7 w-7 cursor-pointer rounded-full border-2 transition-all"
              style={{
                background: c,
                borderColor: color === c ? "#1e293b" : "transparent",
                transform: color === c ? "scale(1.15)" : "scale(1)",
              }}
            />
          ))}
        </div>

        {error && <p className="mb-3 text-[12px] text-red-500">{error}</p>}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 cursor-pointer rounded-xl border border-slate-200 bg-white py-2.5 text-[13px] font-semibold text-slate-600 hover:bg-slate-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !title.trim()}
            className="flex-1 cursor-pointer rounded-xl border-none py-2.5 text-[13px] font-semibold text-white disabled:opacity-50"
            style={{ background: "#4A6CF7" }}
          >
            {loading ? "추가 중…" : "추가"}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { createTeamSpace } from "../api";
import type { TeamSpaceResponse } from "../api";

const EMOJI_OPTIONS = ["✈️", "🏖️", "🏔️", "🗺️", "🌏", "🎒", "🏕️", "🚢", "🌴", "🗼"];
const COLOR_OPTIONS = [
  "#4A6CF7", "#7C3AED", "#DB2777", "#DC2626",
  "#D97706", "#16A34A", "#0891B2", "#64748B",
];

interface Props {
  token: string;
  onClose: () => void;
  onCreated: (space: TeamSpaceResponse) => void;
}

export function CreateSpaceModal({ token, onClose, onCreated }: Props) {
  const [name, setName]       = useState("");
  const [emoji, setEmoji]     = useState("✈️");
  const [bgColor, setBgColor] = useState("#4A6CF7");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) { setError("이름을 입력해주세요."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await createTeamSpace({ name: name.trim(), emoji, bgColor }, token);
      if (res.success && res.data) {
        onCreated(res.data);
      } else {
        setError("생성에 실패했습니다. 다시 시도해주세요.");
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
        <h2 className="mb-4 text-lg font-bold text-slate-900">새 팀스페이스 만들기</h2>

        {/* 이름 */}
        <label className="mb-1 block text-[12px] font-semibold text-slate-600">이름</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 제주 여행"
          maxLength={30}
          className="mb-4 w-full rounded-xl border px-3 py-2 text-[13px] text-slate-800 outline-none focus:border-[#4A6CF7]"
          style={{ borderColor: "#E2E6F0" }}
          onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
          autoFocus
        />

        {/* 이모지 */}
        <label className="mb-1 block text-[12px] font-semibold text-slate-600">아이콘</label>
        <div className="mb-4 flex flex-wrap gap-2">
          {EMOJI_OPTIONS.map((e) => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border-2 text-xl transition-all"
              style={{
                borderColor: emoji === e ? "#4A6CF7" : "#E2E6F0",
                background: emoji === e ? "#EEF2FF" : "transparent",
              }}
            >
              {e}
            </button>
          ))}
        </div>

        {/* 색상 */}
        <label className="mb-1 block text-[12px] font-semibold text-slate-600">색상</label>
        <div className="mb-5 flex gap-2">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              onClick={() => setBgColor(c)}
              className="h-7 w-7 cursor-pointer rounded-full border-2 transition-all"
              style={{
                background: c,
                borderColor: bgColor === c ? "#1e293b" : "transparent",
                transform: bgColor === c ? "scale(1.15)" : "scale(1)",
              }}
            />
          ))}
        </div>

        {error && <p className="mb-3 text-[12px] text-red-500">{error}</p>}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 cursor-pointer rounded-xl border border-slate-200 bg-white py-2.5 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !name.trim()}
            className="flex-1 cursor-pointer rounded-xl border-none py-2.5 text-[13px] font-semibold text-white transition-opacity disabled:opacity-50"
            style={{ background: "#4A6CF7" }}
          >
            {loading ? "생성 중…" : "만들기"}
          </button>
        </div>
      </div>
    </div>
  );
}

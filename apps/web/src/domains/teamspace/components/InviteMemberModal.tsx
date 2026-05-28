"use client";

import { useState } from "react";
import { inviteMember } from "../api";
import type { MemberResponse } from "../api";

interface Props {
  spaceId: number;
  token: string;
  onClose: () => void;
  onInvited: (member: MemberResponse) => void;
}

export function InviteMemberModal({ spaceId, token, onClose, onInvited }: Props) {
  const [username, setUsername] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async () => {
    if (!username.trim()) { setError("사용자 이름을 입력해주세요."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await inviteMember(spaceId, username.trim(), token);
      if (res.success && res.data) {
        onInvited(res.data);
        onClose();
      } else {
        setError("초대에 실패했습니다. 사용자 이름을 확인해주세요.");
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
        <h2 className="mb-2 text-lg font-bold text-slate-900">멤버 초대</h2>
        <p className="mb-4 text-[13px] text-slate-500">초대할 사용자 이름을 입력하세요.</p>

        <label className="mb-1 block text-[12px] font-semibold text-slate-600">사용자 이름</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="예: gildong123"
          autoFocus
          className="mb-4 w-full rounded-xl border px-3 py-2 text-[13px] text-slate-800 outline-none focus:border-[#4A6CF7]"
          style={{ borderColor: "#E2E6F0" }}
          onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
        />

        {error && <p className="mb-3 text-[12px] text-red-500">{error}</p>}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 cursor-pointer rounded-xl border border-slate-200 bg-white py-2.5 text-[13px] font-semibold text-slate-600"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !username.trim()}
            className="flex-1 cursor-pointer rounded-xl border-none py-2.5 text-[13px] font-semibold text-white disabled:opacity-50"
            style={{ background: "#4A6CF7" }}
          >
            {loading ? "초대 중…" : "초대"}
          </button>
        </div>
      </div>
    </div>
  );
}

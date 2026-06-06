"use client";

interface Props {
  onClose: () => void;
  onAddToSchedule?: () => void;
}

export function TravelMapMarkerPopup({ onClose, onAddToSchedule }: Props) {
  return (
    <div
      className="absolute z-[1000] w-[260px] font-sans"
      style={{
        bottom: "calc(100% + 12px)",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#FFFFFF",
        borderRadius: "12px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.14)",
        padding: "14px",
      }}
    >
      {/* 꼬리 */}
      <div
        style={{
          position: "absolute",
          bottom: -7,
          left: "50%",
          transform: "translateX(-50%)",
          width: 14,
          height: 7,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            background: "#FFFFFF",
            boxShadow: "0 4px 24px rgba(0,0,0,0.14)",
            transform: "rotate(45deg)",
            transformOrigin: "top left",
            marginTop: -7,
            marginLeft: 0,
          }}
        />
      </div>

      {/* 헤더 */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-bold text-slate-900">성수 재즈 페스티벌</span>
          <span
            className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-slate-500"
            style={{ background: "#F1F3F6" }}
          >
            번
          </span>
        </div>
        <button
          onClick={onClose}
          className="cursor-pointer rounded-full border-none bg-transparent p-0.5 text-slate-400 hover:text-slate-600"
          style={{ lineHeight: 1 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 장소 */}
      <div className="mb-1 text-[12px] text-slate-500">📍 서울 성동구 연무장길</div>
      {/* 시간 */}
      <div className="mb-3 text-[12px] text-slate-500">🕐 19:00 ~ 21:00</div>

      {/* 버튼 2개 */}
      <div className="flex gap-2">
        <button
          onClick={onAddToSchedule}
          className="flex-1 cursor-pointer rounded-[24px] border-none py-2 text-[12px] font-semibold text-white"
          style={{ background: "#4A6CF7" }}
        >
          일정에 추가
        </button>
        <button
          className="flex-1 cursor-pointer rounded-[24px] bg-white py-2 text-[12px] font-semibold text-slate-700"
          style={{ border: "1.5px solid #D1D5DB" }}
        >
          자세히보기
        </button>
      </div>
    </div>
  );
}

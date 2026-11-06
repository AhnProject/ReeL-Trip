"use client";

export interface MapMarkerPlace {
  id: string;
  name: string;
  tag: string;
  address: string;
  hours: string;
}

interface Props {
  place: MapMarkerPlace;
  onClose: () => void;
}

export function TravelPlaceDetailModal({ place, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-[360px] overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">장소 상세</span>
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
              {place.tag}
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-slate-50"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-4 p-5">
          <h2 className="text-lg font-bold text-slate-900">{place.name}</h2>

          <div className="flex flex-col gap-1 rounded-xl bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <span className="text-base">📍</span>
              <span>{place.address}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <span className="text-base">🕐</span>
              <span>{place.hours}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

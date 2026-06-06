"use client";

import { useEffect, useRef, useState } from "react";
import { TravelMapMarkerPopup } from "./TravelMapMarkerPopup";

/* 서울 성수동 중심 좌표 */
const CENTER: [number, number] = [37.5446, 127.0569];

const MARKERS = [
  { id: "jazz",   pos: [37.5470, 127.0550] as [number, number], color: "#4A6CF7", size: 22 },
  { id: "cafe",   pos: [37.5430, 127.0590] as [number, number], color: "#7C3AED", size: 16 },
];

interface Props {
  onAddToSchedule?: () => void;
}

export function TravelMapView({ onAddToSchedule }: Props) {
  const mapRef   = useRef<HTMLDivElement>(null);
  const mapInst  = useRef<import("leaflet").Map | null>(null);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  /* marker DOM 위치 → popup 절대 위치용 */
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || mapInst.current) return;

    import("leaflet").then((L) => {
      /* Leaflet CSS */
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id   = "leaflet-css";
        link.rel  = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      const map = L.map(mapRef.current!, {
        center: CENTER,
        zoom: 15,
        zoomControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      /* 줌 컨트롤 우하단 배치 */
      L.control.zoom({ position: "bottomright" }).addTo(map);

      MARKERS.forEach((m) => {
        const icon = L.divIcon({
          className: "",
          html: `<div style="
            width:${m.size * 2}px;height:${m.size * 2}px;
            background:${m.color};
            border-radius:50%;
            border:3px solid #fff;
            box-shadow:0 2px 8px rgba(0,0,0,0.25);
            cursor:pointer;
          "></div>`,
          iconSize:   [m.size * 2, m.size * 2],
          iconAnchor: [m.size,     m.size],
        });

        const marker = L.marker(m.pos, { icon }).addTo(map);

        marker.on("click", () => {
          const point = map.latLngToContainerPoint(m.pos);
          setPopupPos({ x: point.x, y: point.y });
          setActiveMarker(m.id);
        });
      });

      map.on("click", () => setActiveMarker(null));

      mapInst.current = map;
    });

    return () => {
      mapInst.current?.remove();
      mapInst.current = null;
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      {/* Leaflet 지도 */}
      <div ref={mapRef} className="h-full w-full" />

      {/* 마커 팝업 말풍선 */}
      {activeMarker && popupPos && (
        <div
          style={{
            position: "absolute",
            left: popupPos.x,
            top:  popupPos.y,
            zIndex: 1000,
            pointerEvents: "auto",
          }}
        >
          <TravelMapMarkerPopup
            onClose={() => setActiveMarker(null)}
            onAddToSchedule={onAddToSchedule}
          />
        </div>
      )}

      {/* 현재 위치 버튼 */}
      <button
        onClick={() => mapInst.current?.flyTo(CENTER, 15, { duration: 1 })}
        className="absolute bottom-5 right-5 z-[999] flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-none bg-white shadow-md hover:bg-slate-50"
        title="현재 위치"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4A6CF7" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
        </svg>
      </button>
    </div>
  );
}

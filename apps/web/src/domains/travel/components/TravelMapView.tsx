"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TravelMapMarkerPopup } from "./TravelMapMarkerPopup";
import type { MapMarkerPlace } from "./TravelPlaceDetailModal";
import type { PlaceResponse } from "@/domains/place/api";

/* 서울 성수동 중심 좌표 (장소에 좌표가 하나도 없을 때의 기본 뷰) */
const CENTER: [number, number] = [37.5446, 127.0569];
const DEFAULT_COLOR = "#4A6CF7";
const DEFAULT_SIZE  = 18;

interface Props {
  places?: PlaceResponse[];
  onAddToSchedule?: () => void;
  onViewDetail?: (place: MapMarkerPlace) => void;
}

export function TravelMapView({ places = [], onAddToSchedule, onViewDetail }: Props) {
  // 좌표가 없는 장소는 지도에 찍을 수 없어 조용히 제외(에러 아님) — A5에서 정식으로 다룸
  const markers = useMemo<(MapMarkerPlace & { pos: [number, number]; color: string; size: number })[]>(
    () => places
      .filter((p) => p.latitude != null && p.longitude != null)
      .map((p) => ({
        id:       p.id,
        pos:      [p.latitude as number, p.longitude as number],
        color:    DEFAULT_COLOR,
        size:     DEFAULT_SIZE,
        name:     p.name,
        category: p.category,
        address:  p.address,
        hours:    p.hours,
      })),
    [places],
  );
  const mapRef        = useRef<HTMLDivElement>(null);
  const mapInst       = useRef<import("leaflet").Map | null>(null);
  const markerLayers  = useRef<import("leaflet").Marker[]>([]);
  const [activeMarker, setActiveMarker] = useState<number | null>(null);
  /* marker DOM 위치 → popup 절대 위치용 */
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null);
  /* 지도 인스턴스 생성 완료 여부 — 마커 동기화 effect가 레이스 없이 뒤따라 실행되게 함 */
  const [mapReady, setMapReady] = useState(false);

  /* 지도 인스턴스는 마운트 시 한 번만 생성 */
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

      map.on("click", () => setActiveMarker(null));

      mapInst.current = map;
      setMapReady(true);
    });

    return () => {
      mapInst.current?.remove();
      mapInst.current = null;
    };
  }, []);

  /* places(실데이터)가 바뀔 때마다 마커만 다시 그림 — 지도 인스턴스는 재사용.
     mapReady를 의존성에 넣어 지도 생성(비동기)이 끝난 직후 레이스 없이 뒤따라 실행되게 함 */
  useEffect(() => {
    if (typeof window === "undefined" || !mapReady || !mapInst.current) return;

    import("leaflet").then((L) => {
      const map = mapInst.current;
      if (!map) return;

      markerLayers.current.forEach((layer) => layer.remove());
      markerLayers.current = [];

      markers.forEach((m) => {
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

        markerLayers.current.push(marker);
      });
    });
  }, [markers, mapReady]);

  return (
    <div className="relative h-full w-full">
      {/* Leaflet 지도 */}
      <div ref={mapRef} className="h-full w-full" />

      {/* 마커 팝업 말풍선 */}
      {activeMarker && popupPos && (() => {
        const marker = markers.find((m) => m.id === activeMarker);
        if (!marker) return null;
        return (
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
              place={marker}
              onClose={() => setActiveMarker(null)}
              onAddToSchedule={onAddToSchedule}
              onViewDetail={() => onViewDetail?.(marker)}
            />
          </div>
        );
      })()}

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

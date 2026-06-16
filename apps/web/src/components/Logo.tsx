export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 112 40"
      height="36"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Reel Trip"
    >
      {/*
        R 형태 경로 그래프
        노드 좌표:
          TL  (4, 11)  — 기둥 상단
          TR  (20, 11) — 볼 상단 ← 위치핀
          ML  (4, 23)  — 기둥 중간 (중간 가로선 접점)
          MR  (20, 23) — 볼 하단 / 다리 시작
          BL  (4, 34)  — 기둥 하단
          BR  (24, 34) — 다리 하단
      */}

      {/* ── 연결선 ── */}
      {/* 세로 기둥: BL → TL */}
      <line x1="4"  y1="34" x2="4"  y2="11" stroke="#1C1C2E" strokeWidth="1.5" strokeLinecap="round" />
      {/* 상단 가로: TL → TR */}
      <line x1="4"  y1="11" x2="20" y2="11" stroke="#1C1C2E" strokeWidth="1.5" strokeLinecap="round" />
      {/* 볼 우측: TR → MR */}
      <line x1="20" y1="11" x2="20" y2="23" stroke="#1C1C2E" strokeWidth="1.5" strokeLinecap="round" />
      {/* 중간 가로: MR → ML */}
      <line x1="20" y1="23" x2="4"  y2="23" stroke="#1C1C2E" strokeWidth="1.5" strokeLinecap="round" />
      {/* 대각선 다리: MR → BR */}
      <line x1="20" y1="23" x2="24" y2="34" stroke="#1C1C2E" strokeWidth="1.5" strokeLinecap="round" />

      {/* ── 노드 (핀 제외 5개) ── */}
      <circle cx="4"  cy="34" r="3.5" fill="#1C1C2E" />  {/* BL */}
      <circle cx="4"  cy="23" r="3.5" fill="#1C1C2E" />  {/* ML */}
      <circle cx="4"  cy="11" r="3.5" fill="#1C1C2E" />  {/* TL */}
      <circle cx="20" cy="23" r="3.5" fill="#1C1C2E" />  {/* MR */}
      <circle cx="24" cy="34" r="3.5" fill="#1C1C2E" />  {/* BR */}

      {/* ── TR 노드: 위치핀 오버레이 (20, 11) ── */}
      {/* 핀 몸통: 눈물방울형 — 중심 (20, 9), 뾰족한 끝 y=20 */}
      <path
        d="M20 2 C16.2 2 13.5 4.8 13.5 8.5 C13.5 13.5 20 20 20 20 C20 20 26.5 13.5 26.5 8.5 C26.5 4.8 23.8 2 20 2Z"
        fill="#4A6CF7"
      />
      {/* 핀 내부 원 */}
      <circle cx="20" cy="8" r="1.8" fill="white" />

      {/* ── 텍스트 ── */}
      <text
        x="32"
        y="27"
        fontFamily="Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
        fontSize="18"
        fontWeight="600"
        fill="#1C1C2E"
        letterSpacing="-0.3"
      >
        Reel Trip
      </text>
    </svg>
  );
}

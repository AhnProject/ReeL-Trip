import { BRAND_NAME, BRAND_TAGLINE } from "@/constants/brand";

/* 카드 썸네일용 브랜드 로고 (22x22) */
function InstagramLogo() {
  return (
    <div
      className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-[7px]"
      style={{
        background:
          "linear-gradient(45deg, #FEDA75, #FA7E1E, #D62976, #962FBF, #4F5BD5)",
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="white" stroke="none" />
      </svg>
    </div>
  );
}

function YoutubeLogo() {
  return (
    <div className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-[7px] bg-[#FF0000]">
      <div className="ml-[1px] h-0 w-0 border-y-[4px] border-l-[6px] border-y-transparent border-l-white" />
    </div>
  );
}

function NaverLogo() {
  return (
    <div className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-[7px] bg-[#03C75A] text-[12px] font-extrabold leading-none text-white">
      N
    </div>
  );
}

/* 왼쪽 브랜드 패널에 표시되는 샘플 여행 카드 (디자인 시안용 정적 데이터) */
const SAMPLE_CARDS = [
  {
    bar: "#A855F7",
    Logo: InstagramLogo,
    title: "성수 재즈 페스티벌",
    meta: "🗺 성수동 XYZ 재즈홀 · 🕐 19:00 · ₩35,000",
    badges: ["공연", "확정"],
  },
  {
    bar: "#EF4444",
    Logo: YoutubeLogo,
    title: "다운타운 파스타",
    meta: "🗺 서울숲 성수동 · 🕐 18:00 · ₩22,000~",
    badges: ["식당"],
  },
  {
    bar: "#22C55E",
    Logo: NaverLogo,
    title: "북촌 핸드드립 카페 – 온도",
    meta: "🗺 종로구 계동길 · 🕐 10:00 · ₩8,500~",
    badges: [],
  },
];

/* 지도 경로 위 핀 (컨테이너 대비 % 좌표) */
const PINS = [
  { x: 12.9, y: 87.8, fill: "#F59E0B", icon: "🍽" },
  { x: 41.4, y: 73.3, fill: "#A855F7", icon: "🎵" },
  { x: 70.0, y: 60.6, fill: "#3B82F6", icon: "☕" },
  { x: 91.4, y: 52.2, fill: "#2DD4BF", icon: "🛍" },
];

const FEATURES = [
  "링크 → 토큰 자동분석",
  "지도 + 일정 통합",
  "팀 공동 캘린더",
];

export function OrbitBrandPanel() {
  return (
    <aside className="relative hidden w-[48.6%] overflow-hidden bg-gradient-to-br from-orbit-from to-orbit-to text-white md:block">
      {/* 지도 점선 경로 (배경 레이어, 0~100 좌표계를 컨테이너에 꽉 채움) */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden
      >
        <polyline
          points="12.9,87.8 41.4,73.3 70,60.6 91.4,52.2"
          stroke="rgba(255,255,255,0.6)"
          fill="none"
          strokeDasharray="6 7"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ strokeWidth: 2 }}
        />
      </svg>

      {/* 지도 핀 (HTML 오버레이 — 이모지 확실히 렌더) */}
      {PINS.map((p) => (
        <div
          key={`${p.x}-${p.y}`}
          className="pointer-events-none absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[11px]"
          style={{ left: `${p.x}%`, top: `${p.y}%`, background: p.fill }}
        >
          {p.icon}
        </div>
      ))}

      {/* 콘텐츠 레이어 */}
      <div className="relative flex h-full flex-col px-[9%] py-[8.7%]">
        {/* 상단: 로고 + 태그라인 */}
        <header>
          <h1 className="text-[42px] font-bold leading-none">{BRAND_NAME}</h1>
          <p className="mt-3 text-base text-white/75">{BRAND_TAGLINE}</p>
        </header>

        {/* 여행 카드 3개 */}
        <div className="mt-6 flex flex-col gap-[14px]">
          {SAMPLE_CARDS.map((card) => (
            <div
              key={card.title}
              className="relative flex w-[300px] max-w-full items-start gap-2.5 overflow-hidden rounded-xl bg-white/[0.16] py-3 pl-5 pr-3 backdrop-blur-[2px]"
            >
              {/* 카드 좌측 가장자리 컬러바 */}
              <span
                className="absolute inset-y-0 left-0 w-1"
                style={{ background: card.bar }}
              />
              <card.Logo />
              <div className="min-w-0 pt-0.5">
                <p className="text-[13px] font-bold leading-tight">{card.title}</p>
                <p className="mt-1 text-[11px] text-white/70">{card.meta}</p>
                {card.badges.length > 0 && (
                  <div className="mt-1.5 flex gap-1.5">
                    {card.badges.map((b) => (
                      <span
                        key={b}
                        className="rounded-md bg-white/20 px-2 py-[3px] text-[9px] font-bold leading-none"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 하단: 핵심 기능 */}
        <footer className="mt-auto flex flex-wrap gap-x-8 gap-y-2 text-[13px] font-bold text-white/90">
          {FEATURES.map((f) => (
            <span key={f}>✦ {f}</span>
          ))}
        </footer>
      </div>
    </aside>
  );
}

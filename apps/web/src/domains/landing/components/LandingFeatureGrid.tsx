const FEATURES = [
  {
    icon: "🔗",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    title: "링크로 정보 수집",
    desc: "인스타그램, 블로그, 유튜브 등 다양한 링크에서 여행 정보를 한 번에 모아보세요.",
  },
  {
    icon: "✨",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-500",
    title: "AI가 추천하는 여행",
    desc: "관심사와 일정을 분석해 최적의 장소와 일정을 추천해드려요.",
  },
  {
    icon: "👥",
    iconBg: "bg-green-50",
    iconColor: "text-green-500",
    title: "팀과 함께 계획하기",
    desc: "팀 스페이스에서 일정을 공유하고 함께 여행을 계획하세요.",
  },
  {
    icon: "📅",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    title: "일정을 한눈에 관리",
    desc: "캘린더와 지도에서 전체 일정을 직관적으로 확인할 수 있어요.",
  },
] as const;

const HOW_TO_ITEMS = [
  { step: "01", color: "text-brand-primary", icon: "🔗", title: "링크 추가",   desc: "여행 관련 링크를 추가해요." },
  { step: "02", color: "text-purple-500",    icon: "✨", title: "AI 정보 추출", desc: "AI가 장소, 일정 정보를 추출해요." },
  { step: "03", color: "text-green-500",     icon: "📅", title: "일력 구성",   desc: "추천 정보를 바탕으로 일정을 만들어보세요." },
  { step: "04", color: "text-orange-500",    icon: "👥", title: "함께 공유",   desc: "팀과 공유하고 실시간으로 계획을 조율해요." },
] as const;

const TRUST_ITEMS = [
  { icon: "🛡", label: "안전한 여행을 위한 플랫폼입니다." },
  { icon: "🔒", label: "개인정보 암호화" },
  { icon: "💾", label: "안전한 데이터 관리" },
  { icon: "🎧", label: "24/7 고객 지원" },
] as const;

export function LandingFeatureGrid() {
  return (
    <>
      {/* ── 기능 4열 그리드 ── */}
      <section className="border-t border-slate-100 bg-white px-8 py-16">
        <div className="mx-auto grid max-w-[1280px] grid-cols-4 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex gap-4">
              <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-2xl ${f.iconBg}`}>
                {f.icon}
              </div>
              <div>
                <h3 className="mb-1 text-sm font-bold text-slate-900">{f.title}</h3>
                <p className="text-xs leading-relaxed text-slate-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 사용 방법 스텝 ── */}
      <section className="bg-slate-50 px-8 py-20">
        <div className="mx-auto max-w-[1280px]">
          <h2 className="mb-12 text-center text-2xl font-extrabold text-slate-900">
            Reel Trip, 이렇게 사용해요
          </h2>
          <div className="flex items-start gap-4">
            {HOW_TO_ITEMS.map((item, i) => (
              <div key={item.step} className="flex flex-1 items-start gap-3">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm text-2xl">
                    {item.icon}
                  </div>
                  <div className="text-left">
                    <p className={`text-xs font-bold ${item.color}`}>{item.step}</p>
                    <p className="text-sm font-bold text-slate-900">{item.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{item.desc}</p>
                  </div>
                </div>
                {i < HOW_TO_ITEMS.length - 1 && (
                  <div className="mt-7 flex-shrink-0 text-slate-300">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 신뢰 배지 ── */}
      <section className="border-t border-slate-100 bg-white px-8 py-6">
        <div className="mx-auto flex max-w-[1280px] items-center justify-center gap-12">
          {TRUST_ITEMS.map((t) => (
            <div key={t.label} className="flex items-center gap-2 text-slate-400">
              <span className="text-lg">{t.icon}</span>
              <span className="text-xs">{t.label}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

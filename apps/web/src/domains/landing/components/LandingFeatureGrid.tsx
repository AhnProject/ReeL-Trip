const FEATURES = [
  {
    icon: "📱",
    iconBg: "#4A6CF7",
    title: "공유만 하면 끝",
    desc: "자동으로 정리해요",
  },
  {
    icon: "📅",
    iconBg: "#10B981",
    title: "실시간 협업",
    desc: "친구들과 함께 일정을 조율하고 확정해요",
  },
  {
    icon: "🎯",
    iconBg: "#EF4444",
    title: "똑똑한 추천",
    desc: "AI가 최적의 동선과 시간을 제안해요",
  },
] as const;

export function LandingFeatureGrid() {
  return (
    <section className="bg-white px-6 py-20">
      <div className="mx-auto max-w-[1200px]">
        {/* 타이틀 */}
        <div className="mb-12 text-center">
          <p className="mb-2 text-[15px] font-medium text-slate-400">핵심 기능</p>
          <h2 className="text-[32px] font-extrabold leading-tight tracking-tight text-slate-900">
            여행 계획이 이렇게 쉬워집니다
          </h2>
        </div>

        {/* 기능 카드 3개 */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl bg-white p-7 transition hover:shadow-md"
              style={{
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                borderRadius: "12px",
              }}
            >
              <div
                className="mb-5 flex h-12 w-12 items-center justify-center rounded-full text-2xl"
                style={{ background: feature.iconBg + "1A" }}
              >
                {feature.icon}
              </div>
              <h3 className="mb-2 text-[16px] font-bold text-slate-900">{feature.title}</h3>
              <p className="text-[13px] leading-relaxed text-slate-500">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

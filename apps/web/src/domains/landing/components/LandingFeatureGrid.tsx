const FEATURES = [
  {
    icon: "🔗",
    title: "URL 붙여넣기",
    desc: "YouTube Shorts나 Instagram Reels URL만 붙여넣으면 여행지 정보를 자동으로 추출합니다.",
  },
  {
    icon: "✈️",
    title: "AI 여행 추천",
    desc: "취향과 여행 스타일에 맞는 여행지를 AI가 맞춤 추천해드립니다.",
  },
  {
    icon: "🔍",
    title: "스마트 검색",
    desc: "벡터 검색으로 저장한 콘텐츠에서 유사한 여행지를 빠르게 찾습니다.",
  },
  {
    icon: "📄",
    title: "여행 문서 관리",
    desc: "추출한 여행 정보를 저장하고 나만의 여행 아카이브를 만들어보세요.",
  },
] as const;

export function LandingFeatureGrid() {
  return (
    <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-5 px-8 pb-20 sm:grid-cols-2 lg:grid-cols-4">
      {FEATURES.map((feature) => (
        <div
          key={feature.title}
          className="rounded-3xl border border-slate-200/60 bg-white/80 p-8 backdrop-blur-md"
        >
          <div className="mb-4 text-4xl">{feature.icon}</div>
          <h3 className="mb-2.5 text-xl font-bold text-slate-900">{feature.title}</h3>
          <p className="text-sm leading-relaxed text-slate-500">{feature.desc}</p>
        </div>
      ))}
    </section>
  );
}

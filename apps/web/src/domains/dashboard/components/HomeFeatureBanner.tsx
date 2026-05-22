interface Props {
  label: string;
  title: string;
  sub: string;
  memberColors: string[];
  onEnter: () => void;
}

export function HomeFeatureBanner({ label, title, sub, memberColors, onEnter }: Props) {
  return (
    <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-brand-panelFrom to-brand-panelTo p-7 pb-6 shadow-[0_8px_32px_rgba(74,108,247,0.25)]">
      {/* 데코 원 */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/[0.08]" />
      <div className="pointer-events-none absolute bottom-[-20px] right-20 h-20 w-20 rounded-full bg-white/[0.06]" />

      <div className="relative z-10">
        <span className="mb-2.5 inline-block rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white/70">
          {label}
        </span>

        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="mb-1.5 text-[28px] font-extrabold tracking-tight text-white">
              {title}
            </h2>
            <p className="text-sm text-white/75">{sub}</p>
          </div>
          {/* 멤버 아바타 스택 */}
          <div className="flex flex-shrink-0 items-center">
            {memberColors.map((color, i) => (
              <div
                key={i}
                className="relative h-[34px] w-[34px] rounded-full border-2 border-white/60"
                style={{ background: color, marginLeft: i === 0 ? 0 : -10, zIndex: memberColors.length - i }}
              />
            ))}
            <span className="ml-2.5 text-xs text-white/75">{memberColors.length}명</span>
          </div>
        </div>

        <button
          onClick={onEnter}
          className="cursor-pointer rounded-xl border border-white/35 bg-white/[0.18] px-5 py-[9px] text-sm font-semibold text-white backdrop-blur-sm"
        >
          일정 보기 →
        </button>
      </div>
    </div>
  );
}

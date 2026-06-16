import Link from "next/link";
import { Logo } from "@/components/Logo";

/* ── 더미 데이터 ── */

const MEMBER_AVATARS = [
  { initial: "김", color: "bg-brand-primary" },
  { initial: "이", color: "bg-purple-400" },
  { initial: "박", color: "bg-pink-400" },
];

const TODO_ITEMS = [
  { label: "숙소 예약하기",     badge: "우선순위 높음", badgeClass: "bg-red-50 text-red-500"    },
  { label: "렌터카 확정하기",   badge: "우선순위 중간", badgeClass: "bg-amber-50 text-amber-500" },
  { label: "일정 투표 참여하기", badge: "마감까지 2일",  badgeClass: "bg-slate-100 text-slate-500" },
];

const ACTIVITY_ITEMS = [
  { initial: "민", color: "bg-brand-primary",  text: "민수가 새로운 장소를 추가했어요.", sub: "축제디 맛집 '돈사돈'", time: "2시간 전", icon: "📍" },
  { initial: "지", color: "bg-purple-400",     text: "지은님이 2일차 일정을 수정했어요.", sub: "카페 '모모' 일정 추가", time: "5시간 전", icon: "📅" },
  { initial: "AI", color: "bg-blue-500",       text: "AI가 새로운 장소 3곳을 추천했어요.", sub: "우도 해변 외 2곳",     time: "1일 전",  icon: "✨" },
];

/* ── 아이콘 ── */

const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);
const IconBell = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const IconChevronRight = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const IconArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);
const IconPlay = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
  </svg>
);

export function LandingHero() {
  return (
    <section className="bg-white px-8 pb-20 pt-14">
      <div className="mx-auto max-w-[1280px]">
        <div className="flex items-start gap-10">

          {/* ── 좌측 텍스트 (약 480px) ── */}
          <div className="flex w-[440px] flex-shrink-0 flex-col pt-8">
            <p className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-brand-primary">
              <span>✦</span> 여행을 더 쉽고, 함께
            </p>
            <h1 className="mb-4 text-[52px] font-extrabold leading-[1.15] tracking-tight text-slate-900">
              여행의 모든 순간,<br />
              <span className="text-brand-primary">Reel Trip과 함께</span>
            </h1>
            <p className="mb-8 text-[16px] leading-relaxed text-slate-500">
              여행 링크를 모으고, AI가 추천하는 장소와 일정을<br />
              팀과 함께 계획해보세요.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="flex items-center gap-2 rounded-xl bg-brand-primary px-7 py-3 text-sm font-semibold text-white transition hover:bg-brand-primaryHover"
              >
                무료로 시작하기 <IconArrowRight />
              </Link>
              <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-600 transition hover:border-brand-primary hover:text-brand-primary">
                <IconPlay /> 서비스 둘러보기
              </button>
            </div>
            <div className="mt-8 flex items-center gap-3">
              <div className="flex">
                {MEMBER_AVATARS.map((m, i) => (
                  <div
                    key={i}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white ${m.color}`}
                    style={{ marginLeft: i === 0 ? 0 : -8, zIndex: MEMBER_AVATARS.length - i, position: "relative" }}
                  >
                    {m.initial}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">10,000+ 팀이</p>
                <p className="text-xs text-slate-400">Reel Trip과 함께하고 있어요</p>
              </div>
            </div>
          </div>

          {/* ── 우측 앱 미리보기 카드 ── */}
          <div className="flex-1 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-200/60">

            {/* 미니 GNB */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <Logo />
              <div className="flex items-center gap-3">
                <button className="text-slate-400 hover:text-slate-600"><IconSearch /></button>
                <button className="text-slate-400 hover:text-slate-600"><IconBell /></button>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white">민</div>
              </div>
            </div>

            <div className="flex min-h-0">
              {/* 미니 사이드바 */}
              <div className="w-[160px] flex-shrink-0 border-r border-slate-100 bg-white px-3 py-4">
                {/* 인사 + D-day */}
                <div className="mb-3 px-2">
                  <p className="text-xs font-bold text-slate-800">안녕하세요, 민수님 👋</p>
                  <p className="text-[10px] text-slate-400">제주도 여름 여행 · D-12</p>
                </div>
                {[
                  { label: "대시보드", active: true },
                  { label: "여행 일정", active: false },
                  { label: "장소 리스트", active: false },
                  { label: "AI 추천", active: false },
                  { label: "멤버", active: false },
                  { label: "채팅", active: false },
                  { label: "알림", active: false, badge: 3 },
                  { label: "설정", active: false },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-[11px] font-medium ${
                      item.active
                        ? "bg-brand-primary/10 text-brand-primary"
                        : "text-slate-500"
                    }`}
                  >
                    {item.label}
                    {item.badge && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                        {item.badge}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* 메인 콘텐츠 */}
              <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-slate-50 p-4">

                {/* 히어로 카드 */}
                <div className="flex gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="h-[90px] w-[120px] flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-blue-200 to-green-200">
                    <div className="flex h-full w-full items-center justify-center text-3xl">🏝️</div>
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900">제주도 여름 여행</p>
                      <p className="text-[10px] text-slate-400">2026.08.01 (토) ~ 08.04 (화) · 3박 4일</p>
                    </div>
                    <div className="flex items-end gap-4">
                      <div>
                        <p className="text-2xl font-extrabold text-brand-primary">D-12</p>
                        <p className="text-[9px] text-slate-400">여행까지 남은 시간</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">65<span className="text-xs">%</span></p>
                        <div className="mt-0.5 h-1.5 w-[70px] overflow-hidden rounded-full bg-slate-100">
                          <div className="h-1.5 w-[45px] rounded-full bg-brand-primary" />
                        </div>
                        <p className="mt-0.5 text-[9px] text-slate-400">준비 진행률</p>
                      </div>
                    </div>
                    <div className="flex gap-4 border-t border-slate-50 pt-2">
                      {[
                        { icon: "📍", count: "12개", label: "저장된 장소" },
                        { icon: "📅", count: "4일",  label: "일정"       },
                        { icon: "👥", count: "5명",  label: "참여 멤버"  },
                        { icon: "✅", count: "4개",  label: "예약 완료"  },
                      ].map((s) => (
                        <div key={s.label} className="flex items-center gap-1">
                          <span className="text-[10px]">{s.icon}</span>
                          <div>
                            <p className="text-[10px] font-bold text-slate-800">{s.count}</p>
                            <p className="text-[8px] text-slate-400">{s.label}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 할일 + 최근활동 2열 */}
                <div className="grid grid-cols-2 gap-3">
                  {/* 할 일 */}
                  <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                    <div className="mb-2 flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-900">다음에 해야 할 일</p>
                      <span className="rounded-full bg-brand-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-brand-primary">3</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      {TODO_ITEMS.map((todo) => (
                        <div key={todo.label} className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] text-slate-700">{todo.label}</p>
                            <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${todo.badgeClass}`}>{todo.badge}</span>
                          </div>
                          <span className="text-slate-300"><IconChevronRight /></span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 최근 활동 */}
                  <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900">최근 활동</p>
                      <button className="text-[9px] text-brand-primary">전체 보기</button>
                    </div>
                    <div className="flex flex-col gap-2">
                      {ACTIVITY_ITEMS.map((act) => (
                        <div key={act.text} className="flex items-start gap-1.5">
                          <div className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[8px] font-bold text-white ${act.color}`}>
                            {act.initial}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-[9px] text-slate-700">{act.text}</p>
                            <p className="text-[8px] text-slate-400">{act.sub}</p>
                            <p className="text-[8px] text-slate-400">{act.time}</p>
                          </div>
                          <span className="text-[10px]">{act.icon}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

import Link from "next/link";

const TAG_BADGES = [
  { label: "AI 자동 파싱",  bg: "#EDE9FE", color: "#7C3AED" },
  { label: "공유 캘린더",   bg: "#DCFCE7", color: "#16A34A" },
  { label: "실시간 협업",   bg: "#DBEAFE", color: "#1D4ED8" },
];

const SCHEDULE_TAGS = [
  { dot: "#EF4444", label: "공원",     time: "19:00" },
  { dot: "#22C55E", label: "카페",     time: "15:30" },
  { dot: "#F59E0B", label: "레스토랑", time: ""      },
];

const MEMBER_COLORS = ["#EF4444", "#4A6CF7", "#F59E0B"];

export function LandingHero() {
  return (
    <section className="bg-white px-6 pb-24 pt-16">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex items-center gap-12">

          {/* ── 좌측 텍스트 영역 ── */}
          <div className="flex flex-1 flex-col">
            {/* 메인 타이틀 */}
            <h1 className="mb-5 text-[48px] font-extrabold leading-[1.2] tracking-tight text-slate-900">
              공유한 순간이<br />
              <span style={{ color: "#4A6CF7" }}>여행이 되는 곳</span>
            </h1>

            {/* 태그 뱃지 3개 */}
            <div className="mb-6 flex flex-wrap gap-2">
              {TAG_BADGES.map((badge) => (
                <span
                  key={badge.label}
                  className="rounded-full px-3.5 py-1.5 text-[12px] font-semibold"
                  style={{ background: badge.bg, color: badge.color }}
                >
                  {badge.label}
                </span>
              ))}
            </div>

            {/* 설명 박스 */}
            <div
              className="mb-8 rounded-2xl px-5 py-4 text-[14px] leading-relaxed text-slate-600"
              style={{ background: "#F5F6FA" }}
            >
              인스타그램, 링크, 포스터를 공유하면<br />
              AI가 자동으로 여행 일정을 만들어드려요
            </div>

            {/* CTA 버튼 2개 */}
            <div className="flex gap-3">
              <Link
                href="/auth/login"
                className="rounded-[24px] bg-[#4A6CF7] px-8 py-3 text-[14px] font-semibold text-white transition hover:bg-[#3A5CE0]"
              >
                로그인
              </Link>
              <button
                className="cursor-pointer rounded-[24px] border bg-white px-8 py-3 text-[14px] font-medium text-slate-600 transition hover:border-[#4A6CF7] hover:text-[#4A6CF7]"
                style={{ borderColor: "#D1D5DB" }}
              >
                데모 보기
              </button>
            </div>
          </div>

          {/* ── 우측 장식 카드 ── */}
          <div className="flex flex-1 justify-end">
            <div
              className="w-full max-w-[420px] rounded-2xl p-6"
              style={{ background: "#F5F6FA" }}
            >
              {/* 점선 경로 + 컬러 포인트 */}
              <div className="relative mb-5 flex h-[56px] items-center justify-between px-6">
                <div
                  className="absolute left-8 right-8 top-1/2 -translate-y-1/2"
                  style={{ borderTop: "2px dashed #CBD5E1" }}
                />
                {[
                  { color: "#EF4444" },
                  { color: "#4A6CF7" },
                  { color: "#F59E0B" },
                ].map((pt, i) => (
                  <div
                    key={i}
                    className="relative z-10 h-[18px] w-[18px] rounded-full border-2 border-white"
                    style={{ background: pt.color, boxShadow: "0 2px 6px rgba(0,0,0,0.18)" }}
                  />
                ))}
              </div>

              {/* 일정 태그 3개 */}
              <div className="mb-6 flex flex-wrap gap-2">
                {SCHEDULE_TAGS.map((tag, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold"
                    style={{ background: tag.dot + "18", color: tag.dot }}
                  >
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ background: tag.dot }}
                    />
                    {tag.label}
                    {tag.time && <span className="opacity-70">{tag.time}</span>}
                  </span>
                ))}
              </div>

              {/* 카드 하단 정보 */}
              <div
                className="rounded-xl p-4"
                style={{ background: "#FFFFFF", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
              >
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-[15px] font-bold text-slate-800">서울 문화 투어</div>
                    <div className="mt-0.5 text-[12px] text-slate-400">5월 3일 · 3개 장소 · 친구 4명</div>
                  </div>
                  {/* 멤버 아바타 3개 */}
                  <div className="flex">
                    {MEMBER_COLORS.map((color, i) => (
                      <div
                        key={i}
                        className="h-7 w-7 rounded-full border-2 border-white"
                        style={{
                          background: color,
                          marginLeft: i === 0 ? 0 : -8,
                          position: "relative",
                          zIndex: MEMBER_COLORS.length - i,
                        }}
                      />
                    ))}
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

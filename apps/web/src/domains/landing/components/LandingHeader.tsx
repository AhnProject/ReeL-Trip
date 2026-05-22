import Link from "next/link";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-100 bg-white">
      <div className="mx-auto flex h-[64px] max-w-[1200px] items-center justify-between px-6">
        {/* 좌측 로고 */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-extrabold text-white"
            style={{ background: "#4A6CF7" }}
          >
            RT
          </div>
          <span className="text-[17px] font-bold tracking-tight text-slate-900">ReelTrip</span>
        </div>

        {/* 중앙 네비 */}
        <nav className="flex items-center gap-7">
          {["여행 만들기", "둘러보기", "가이드"].map((label) => (
            <span
              key={label}
              className="cursor-pointer text-[14px] font-medium text-slate-600 transition hover:text-[#4A6CF7]"
            >
              {label}
            </span>
          ))}
        </nav>

        {/* 우측 로그인 버튼 */}
        <Link
          href="/auth/login"
          className="rounded-[24px] bg-[#4A6CF7] px-6 py-2 text-[14px] font-semibold text-white transition hover:bg-[#3A5CE0]"
        >
          로그인
        </Link>
      </div>
    </header>
  );
}

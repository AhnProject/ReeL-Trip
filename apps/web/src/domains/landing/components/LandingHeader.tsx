import Link from "next/link";
import { Logo } from "@/components/Logo";

const NAV_LINKS = ["서비스 소개", "주요 기능", "사용 방법", "요금제", "커뮤니티"];

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-100 bg-white">
      <div className="mx-auto flex h-[64px] max-w-[1280px] items-center justify-between px-8">
        <Logo className="h-9" />

        <nav className="flex items-center gap-8">
          {NAV_LINKS.map((label) => (
            <span
              key={label}
              className="cursor-pointer text-sm font-medium text-slate-600 transition hover:text-brand-primary"
            >
              {label}
            </span>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-sm font-medium text-slate-600 transition hover:text-brand-primary"
          >
            로그인
          </Link>
          <Link
            href="/auth/login"
            className="rounded-xl bg-brand-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-primaryHover"
          >
            무료로 시작하기
          </Link>
        </div>
      </div>
    </header>
  );
}

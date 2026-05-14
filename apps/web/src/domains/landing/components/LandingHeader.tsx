import Link from "next/link";
import { BRAND_NAME } from "@/constants/brand";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/50 bg-white/70 px-8 py-5 backdrop-blur-md">
      <span className="text-xl font-bold tracking-wide">{BRAND_NAME}</span>
      <nav className="flex items-center gap-3">
        <Link
          href="/auth/login"
          className="rounded-full border border-slate-300 px-5 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
        >
          로그인
        </Link>
        <Link
          href="/auth/signup"
          className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          회원가입
        </Link>
      </nav>
    </header>
  );
}

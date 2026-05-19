import Link from "next/link";
import { BRAND_TAGLINE } from "@/constants/brand";

export function LandingHero() {
  return (
    <section className="flex flex-col items-center justify-center px-6 pb-20 pt-24 text-center">
      <span className="mb-7 inline-block rounded-full bg-brand-primary/10 px-4 py-1.5 text-sm font-semibold text-brand-primary">
        {BRAND_TAGLINE}
      </span>
      <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-slate-900">
        짧은 영상 하나로
        <br />
        여행 계획 완성
      </h1>
      <p className="mb-10 max-w-xl text-lg leading-relaxed text-slate-500">
        YouTube Shorts · Instagram Reels의 여행 콘텐츠 URL을 붙여넣으면
        <br />
        AI가 여행지 정보를 자동으로 추출하고 맞춤 일정을 만들어드립니다.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/auth/signup"
          className="rounded-full bg-slate-900 px-8 py-3.5 text-base font-semibold text-white transition hover:bg-slate-700"
        >
          무료로 시작하기
        </Link>
        <Link
          href="/auth/login"
          className="rounded-full border border-slate-300 bg-white/70 px-8 py-3.5 text-base text-slate-700 transition hover:bg-white"
        >
          로그인
        </Link>
      </div>
    </section>
  );
}

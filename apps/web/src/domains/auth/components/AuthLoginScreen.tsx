import Link from "next/link";
import { OrbitBrandPanel } from "./OrbitBrandPanel";
import { OAuthButtons } from "./OAuthButtons";
import { LoginForm } from "./LoginForm";
import { Divider } from "@/components/Divider";
import { BRAND_WELCOME } from "@/constants/brand";

export function AuthLoginScreen() {
  return (
    <main className="flex min-h-screen w-full bg-[#FFF5F2]">
      <OrbitBrandPanel />

      <section className="flex w-full flex-col items-center justify-center px-6 py-12 md:w-1/2">
        <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-[0_8px_40px_rgba(0,0,0,0.06)]">
          <header className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-slate-900">로그인</h2>
            <p className="mt-1 text-sm text-slate-500">{BRAND_WELCOME}</p>
          </header>

          <OAuthButtons />

          <div className="my-6">
            <Divider label="또는 이메일로" />
          </div>

          <LoginForm />

          <footer className="mt-6 text-center">
            <p className="text-xs font-bold text-slate-500">
              계정이 없으신가요?{" "}
              <Link href="/auth/signup" className="text-orbit-point">
                회원가입
              </Link>
            </p>
            <p className="mt-3 text-[10px] text-slate-400">
              로그인 시 이용약관 및 개인정보처리방침에 동의합니다
            </p>
          </footer>
        </div>
      </section>
    </main>
  );
}

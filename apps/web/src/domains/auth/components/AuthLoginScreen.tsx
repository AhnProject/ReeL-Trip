import Link from "next/link";
import { BrandPanel } from "./BrandPanel";
import { AuthCard } from "./AuthCard";
import { OAuthButtons } from "./OAuthButtons";
import { LoginForm } from "./LoginForm";
import { Divider } from "@/components/Divider";
import { BRAND_WELCOME } from "@/constants/brand";

export function AuthLoginScreen() {
  return (
    <main className="flex min-h-screen w-full">
      <BrandPanel />
      <section className="flex w-full flex-col items-center justify-center bg-white px-6 py-12 md:w-1/2">
        <AuthCard>
          <header className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-slate-900">로그인</h2>
            <p className="mt-1 text-sm text-slate-500">{BRAND_WELCOME}</p>
          </header>

          <OAuthButtons />

          <div className="my-6">
            <Divider label="또는 아이디로" />
          </div>

          <LoginForm />
        </AuthCard>

        <footer className="mt-8 text-center text-sm text-slate-500">
          <p>
            계정이 없으신가요?{" "}
            <Link
              href="/auth/signup"
              className="font-semibold text-accent-danger"
            >
              회원가입
            </Link>
          </p>
          <p className="mt-2 text-xs text-slate-400">
            로그인 시 이용약관 및 개인정보처리방침에 동의합니다
          </p>
        </footer>
      </section>
    </main>
  );
}

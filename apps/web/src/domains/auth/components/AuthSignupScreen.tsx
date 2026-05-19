import Link from "next/link";
import { BrandPanel } from "./BrandPanel";
import { AuthCard } from "./AuthCard";
import { OAuthButtons } from "./OAuthButtons";
import { SignupForm } from "./SignupForm";
import { Divider } from "@/components/Divider";
import { BRAND_WELCOME } from "@/constants/brand";

export function AuthSignupScreen() {
  return (
    <main className="flex min-h-screen w-full">
      <BrandPanel />
      <section className="flex w-full flex-col items-center justify-center bg-white px-6 py-12 md:w-1/2">
        <AuthCard>
          <header className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-slate-900">회원가입</h2>
            <p className="mt-1 text-sm text-slate-500">{BRAND_WELCOME}</p>
          </header>

          <OAuthButtons />

          <div className="my-6">
            <Divider label="또는 이메일로" />
          </div>

          <SignupForm />
        </AuthCard>

        <footer className="mt-8 text-center text-sm text-slate-500">
          <p>
            이미 계정이 있으신가요?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-accent-danger"
            >
              로그인
            </Link>
          </p>
        </footer>
      </section>
    </main>
  );
}

import { LandingAuthRedirect } from "./LandingAuthRedirect";
import { LandingHeader } from "./LandingHeader";
import { LandingHero } from "./LandingHero";
import { LandingFeatureGrid } from "./LandingFeatureGrid";

export function LandingScreen() {
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-purple-100 via-slate-50 to-slate-200 text-slate-900">
      <LandingAuthRedirect />
      <LandingHeader />
      <LandingHero />
      <LandingFeatureGrid />
      <footer className="mt-auto border-t border-slate-200/50 py-6 text-center text-sm text-slate-400">
        © 2025 ReeL Trip · AI 기반 여행지 추천 서비스
      </footer>
    </main>
  );
}

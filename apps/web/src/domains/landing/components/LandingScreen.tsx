import { LandingAuthRedirect } from "./LandingAuthRedirect";
import { LandingHeader } from "./LandingHeader";
import { LandingHero } from "./LandingHero";
import { LandingFeatureGrid } from "./LandingFeatureGrid";

export function LandingScreen() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <LandingAuthRedirect />
      <LandingHeader />
      <LandingHero />
      <LandingFeatureGrid />
      <footer className="border-t border-slate-100 bg-white py-8 text-center text-sm text-slate-400">
        © 2025 ReeL Trip · AI 기반 여행지 추천 서비스
      </footer>
    </main>
  );
}

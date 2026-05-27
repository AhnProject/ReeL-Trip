import { BRAND_NAME, BRAND_TAGLINE } from "@/constants/brand";

export function BrandPanel() {
  return (
    <aside className="hidden min-h-screen w-1/2 flex-col justify-start self-stretch bg-gradient-to-br from-brand-panelFrom to-brand-panelTo px-16 pt-20 text-white md:flex">
      <h1 className="text-5xl font-bold tracking-tight">{BRAND_NAME}</h1>
      <p className="mt-3 text-base text-white/85">{BRAND_TAGLINE}</p>
    </aside>
  );
}

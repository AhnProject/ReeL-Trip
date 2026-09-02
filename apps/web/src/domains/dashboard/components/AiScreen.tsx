"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/LoadingScreen";
import { listTeamSpaces } from "@/domains/teamspace/api";
import type { TeamSpaceResponse } from "@/domains/teamspace/api";
import { listPlaces } from "@/domains/place/api";
import type { PlaceResponse } from "@/domains/place/api";
import { DashboardLayout } from "./DashboardLayout";
import { cn } from "@/lib/cn";
import { CATEGORY_LABEL, categoryLabel } from "@/constants/categories";

/* ── 더미 AI 추천 (팝업 하단 고정) ── */
const DUMMY_AI_RECS = [
  { id: 901, name: "우도 해변", region: "서귀포시 우도면", emoji: "🏖️", reason: "저장된 장소와 유사한 해변 스팟" },
  { id: 902, name: "월정리 해수욕장", region: "제주시 구좌읍", emoji: "🌊", reason: "에메랄드 바다 카테고리 일치" },
  { id: 903, name: "섭지코지", region: "서귀포시 성산읍", emoji: "🌅", reason: "자연 경관 추천 상위 일치" },
];

/* ── 플랫폼 배지 ── */
function PlatformBadge({ platform }: { platform: string | null }) {
  if (!platform) return null;
  const isYt = platform === "youtube_shorts";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
        isYt ? "bg-red-50 text-red-500" : "bg-pink-50 text-pink-500",
      )}
    >
      {isYt ? "▶ YouTube" : "◎ Reels"}
    </span>
  );
}

/* ── 신뢰도 배지 ── */
function ConfidenceBadge({ value }: { value: string | null }) {
  if (!value) return null;
  const map = {
    high:   { label: "높음", cls: "bg-green-50 text-green-600" },
    medium: { label: "보통", cls: "bg-amber-50 text-amber-600" },
    low:    { label: "낮음", cls: "bg-red-50 text-red-400" },
  } as const;
  const cfg = map[value as keyof typeof map];
  if (!cfg) return null;
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", cfg.cls)}>
      신뢰도 {cfg.label}
    </span>
  );
}

/* ── 장소 카드 썸네일 ── */
function PlaceThumbnail({ url, name, size = "md" }: { url: string | null; name: string; size?: "sm" | "md" }) {
  const h = size === "sm" ? "h-[72px]" : "h-[130px]";
  if (url) {
    return (
      <div className={cn("w-full overflow-hidden rounded-xl", h)}>
        <img src={url} alt={name} className="h-full w-full object-cover" />
      </div>
    );
  }
  return (
    <div className={cn("flex w-full items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200", h)}>
      <span className="text-3xl">📍</span>
    </div>
  );
}

/* ══════════════════════════════════════
   장소 상세 팝업
══════════════════════════════════════ */
function PlaceDetailModal({
  place,
  onClose,
  onAddRec,
}: {
  place: PlaceResponse;
  onClose: () => void;
  onAddRec: (name: string) => void;
}) {
  const [maximized, setMaximized] = useState(false);
  const [added, setAdded] = useState<number[]>([]);

  /* 외부 클릭 닫기 */
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const modalW = maximized ? "w-[92vw] max-w-[1100px]" : "w-[520px]";
  const modalH = maximized ? "max-h-[92vh]" : "max-h-[80vh]";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleBackdrop}
    >
      <div
        className={cn(
          "relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-200",
          modalW,
          modalH,
        )}
      >
        {/* ── 팝업 헤더 ── */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">장소 상세</span>
            <PlatformBadge platform={place.sourcePlatform} />
          </div>
          <div className="flex items-center gap-1.5">
            {/* 최대화/원래대로 버튼 */}
            <button
              onClick={() => setMaximized((v) => !v)}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-slate-50"
              title={maximized ? "원래 크기" : "최대화"}
            >
              {maximized ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/>
                  <line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/>
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
                  <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
                </svg>
              )}
            </button>
            {/* 닫기 */}
            <button
              onClick={onClose}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-slate-50"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── 팝업 바디 (스크롤) ── */}
        <div className="flex-1 overflow-y-auto">
          {/* 최대화 시 2단 레이아웃 */}
          <div className={cn("p-5", maximized && "grid grid-cols-2 gap-6")}>

            {/* 좌측: 썸네일 + 기본 정보 */}
            <div className="flex flex-col gap-4">
              {/* 썸네일 */}
              {place.thumbnailUrl ? (
                <img
                  src={place.thumbnailUrl}
                  alt={place.name}
                  className={cn("w-full rounded-xl object-cover", maximized ? "h-[240px]" : "h-[190px]")}
                />
              ) : (
                <div className={cn("flex w-full items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200", maximized ? "h-[240px]" : "h-[190px]")}>
                  <span className="text-5xl">📍</span>
                </div>
              )}

              {/* 이름 + 카테고리 */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-bold text-slate-900">{place.name}</h2>
                  <ConfidenceBadge value={place.confidence} />
                </div>
                {place.category && (
                  <span className="mt-1 inline-block rounded-lg bg-brand-primary/10 px-2.5 py-0.5 text-xs font-semibold text-brand-primary">
                    {categoryLabel(place.category)}
                  </span>
                )}
              </div>

              {/* 위치 */}
              {(place.region || place.address) && (
                <div className="flex flex-col gap-1 rounded-xl bg-slate-50 px-4 py-3">
                  {place.region && (
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <span className="text-base">📍</span>
                      <span>{place.region}</span>
                      {place.country && <span className="text-slate-400">· {place.country}</span>}
                    </div>
                  )}
                  {place.address && (
                    <div className="text-xs text-slate-400 pl-6">{place.address}</div>
                  )}
                </div>
              )}
            </div>

            {/* 우측 (최대화) 또는 하단 연속: 상세 정보 */}
            <div className="flex flex-col gap-4">
              {/* 영업시간 */}
              {place.hours && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold text-slate-400">영업시간</p>
                  <p className="text-sm text-slate-700">🕐 {place.hours}</p>
                </div>
              )}

              {/* 가격 */}
              {(place.priceDesc || place.priceMin != null) && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold text-slate-400">가격</p>
                  <p className="text-sm text-slate-700">
                    💰{" "}
                    {place.priceDesc ??
                      (place.priceMin != null && place.priceMax != null
                        ? `${place.priceMin.toLocaleString()} ~ ${place.priceMax.toLocaleString()} ${place.currency ?? ""}`
                        : place.priceMin != null
                        ? `${place.priceMin.toLocaleString()} ${place.currency ?? ""} ~`
                        : "")}
                  </p>
                </div>
              )}

              {/* 메뉴 */}
              {(place.menu ?? []).length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold text-slate-400">메뉴 / 항목</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(place.menu ?? []).map((m) => (
                      <span key={m} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 태그 */}
              {(place.tags ?? []).length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold text-slate-400">태그</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(place.tags ?? []).map((t) => (
                      <span key={t} className="rounded-full bg-brand-primary/10 px-2.5 py-0.5 text-xs font-medium text-brand-primary">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 원본 링크 */}
              {place.sourceUrl && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold text-slate-400">원본 출처</p>
                  <a
                    href={place.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-brand-primary underline-offset-2 hover:underline"
                  >
                    <PlatformBadge platform={place.sourcePlatform} />
                    <span className="truncate max-w-[200px]">{place.sourceUrl}</span>
                  </a>
                </div>
              )}

              {/* 등록일 */}
              <p className="text-[11px] text-slate-300">
                등록: {new Date(place.createdAt).toLocaleDateString("ko-KR")}
              </p>
            </div>
          </div>

          {/* ── AI 추천: 비슷한 여행지 ── */}
          <div className="mx-5 mb-5 rounded-xl border border-brand-primary/15 bg-gradient-to-br from-[#EEF2FF] to-slate-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-base">✨</span>
              <span className="text-sm font-bold text-brand-primary">비슷한 여행지 (AI 추천)</span>
            </div>
            <div className="flex flex-col gap-2">
              {DUMMY_AI_RECS.map((rec) => (
                <div key={rec.id} className="flex items-center justify-between rounded-xl bg-white px-3.5 py-2.5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{rec.emoji}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{rec.name}</p>
                      <p className="text-xs text-slate-400">{rec.region}</p>
                      <p className="mt-0.5 text-[10px] text-slate-300">{rec.reason}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setAdded((prev) => prev.includes(rec.id) ? prev : [...prev, rec.id]);
                      onAddRec(rec.name);
                    }}
                    className={cn(
                      "flex-shrink-0 cursor-pointer rounded-full border-none px-3 py-1.5 text-[11px] font-semibold transition-colors",
                      added.includes(rec.id)
                        ? "bg-green-100 text-green-600"
                        : "bg-brand-primary text-white hover:bg-brand-primaryHover",
                    )}
                  >
                    {added.includes(rec.id) ? "추가됨" : "+ 내 여행지 추가"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   메인 스크린
══════════════════════════════════════ */
const PLATFORMS = ["전체", "YouTube Shorts", "Instagram Reels"] as const;
type PlatformFilter = (typeof PLATFORMS)[number];

/* API가 저장하는 영문 코드 기준 */
const CATEGORY_KEYS = ["전체", "restaurant", "cafe", "attraction", "accommodation", "activity", "other"] as const;
type CategoryFilter = (typeof CATEGORY_KEYS)[number];

export function AiScreen() {
  const router = useRouter();

  const [username, setUsername]     = useState("");
  const [spaceName, setSpaceName]   = useState("여행 없음");
  const [spaceEmoji, setSpaceEmoji] = useState("✈️");
  const [places, setPlaces]         = useState<PlaceResponse[]>([]);
  const [loading, setLoading]       = useState(true);

  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("전체");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("전체");
  const [search, setSearch]                 = useState("");
  const [selected, setSelected]             = useState<PlaceResponse | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const name        = localStorage.getItem("username");
    if (!storedToken) { router.replace("/"); return; }
    setUsername(name ?? "");

    listTeamSpaces(storedToken).then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        const sp = res.data[0] as TeamSpaceResponse;
        setSpaceName(sp.name);
        setSpaceEmoji(sp.emoji ?? "✈️");

        listPlaces(sp.id, storedToken).then((pRes) => {
          if (pRes.success && pRes.data) setPlaces(pRes.data);
        }).catch((err) => console.error("[AiScreen]", err))
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }).catch((err) => { console.error("[AiScreen]", err); setLoading(false); });
  }, [router]);

  if (!username) return <LoadingScreen />;

  /* ── 필터 적용 ── */
  const filtered = places.filter((p) => {
    if (platformFilter === "YouTube Shorts"  && p.sourcePlatform !== "youtube_shorts")  return false;
    if (platformFilter === "Instagram Reels" && p.sourcePlatform !== "instagram_reels") return false;
    if (categoryFilter !== "전체" && p.category !== categoryFilter)                     return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()))                 return false;
    return true;
  });

  return (
    <DashboardLayout activeNav="ai" username={username} spaceName={spaceName} spaceEmoji={spaceEmoji}>
      {/* ── 페이지 헤더 ── */}
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">저장된 장소</h1>
          <p className="mt-0.5 text-sm text-slate-400">릴스·쇼츠 링크로 불러온 장소 목록이에요</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
          총 {places.length}개
        </span>
      </div>

      {/* ── 검색 + 플랫폼 필터 ── */}
      <div className="mb-4 flex items-center gap-3">
        {/* 검색 */}
        <div className="flex h-9 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="장소명으로 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>

        {/* 플랫폼 필터 */}
        <div className="flex gap-1.5">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              onClick={() => setPlatformFilter(p)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                platformFilter === p
                  ? "bg-brand-primary text-white"
                  : "border border-slate-200 bg-white text-slate-500 hover:border-brand-primary hover:text-brand-primary",
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── 카테고리 필터 ── */}
      <div className="mb-5 flex gap-1.5">
        {CATEGORY_KEYS.map((c) => (
          <button
            key={c}
            onClick={() => setCategoryFilter(c)}
            className={cn(
              "rounded-lg px-3 py-1 text-xs font-medium transition-colors",
              categoryFilter === c
                ? "bg-slate-800 text-white"
                : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50",
            )}
          >
            {c === "전체" ? "전체" : (CATEGORY_LABEL[c] ?? c)}
          </button>
        ))}
      </div>

      {/* ── 리스트 ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
          <p className="text-sm">장소 불러오는 중…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
          <span className="mb-3 text-5xl">🔗</span>
          <p className="text-sm font-semibold text-slate-500">저장된 장소가 없어요</p>
          <p className="mt-1 text-xs text-slate-400">릴스·쇼츠 링크를 공유하면 자동으로 장소가 추가됩니다</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((place) => (
            <button
              key={place.id}
              onClick={() => setSelected(place)}
              className="group overflow-hidden rounded-xl border border-slate-100 bg-white text-left shadow-sm transition-shadow hover:shadow-md"
            >
              {/* 썸네일 */}
              <div className="relative">
                <PlaceThumbnail url={place.thumbnailUrl} name={place.name} />
                {/* 플랫폼 배지 */}
                <div className="absolute left-2 top-2">
                  <PlatformBadge platform={place.sourcePlatform} />
                </div>
                {/* 신뢰도 */}
                <div className="absolute right-2 top-2">
                  <ConfidenceBadge value={place.confidence} />
                </div>
              </div>

              {/* 정보 */}
              <div className="p-3">
                <p className="truncate font-semibold text-slate-900 group-hover:text-brand-primary">
                  {place.name}
                </p>
                {(place.region || place.address) && (
                  <p className="mt-0.5 truncate text-xs text-slate-400">
                    📍 {place.region ?? place.address}
                  </p>
                )}
                {place.category && (
                  <span className="mt-1.5 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                    {categoryLabel(place.category)}
                  </span>
                )}
                {(place.tags ?? []).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(place.tags ?? []).slice(0, 3).map((t) => (
                      <span key={t} className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-[10px] font-medium text-brand-primary">
                        {t}
                      </span>
                    ))}
                    {(place.tags ?? []).length > 3 && (
                      <span className="text-[10px] text-slate-300">+{(place.tags ?? []).length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── 상세 팝업 ── */}
      {selected && (
        <PlaceDetailModal
          place={selected}
          onClose={() => setSelected(null)}
          onAddRec={(name) => {
            /* 실제 추가 로직 연결 포인트 — 현재는 콘솔만 */
            console.log("[AiScreen] AI 추천 장소 추가:", name);
          }}
        />
      )}
    </DashboardLayout>
  );
}

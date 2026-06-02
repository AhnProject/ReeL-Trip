import { useEffect } from "react";
import { useShareIntentContext } from "expo-share-intent";
import { useAuthStore } from "@/store/auth";
import { listTeamSpaces } from "@/domains/teamspace/api";
import { addPlace } from "@/domains/place/api";
import { parseUrl } from "@/domains/url-parser/api";
import { toast } from "@/store/toast";
import { useInvalidatePlaces } from "@/hooks/usePlaces";

export function ShareHandler() {
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntentContext();
  const token = useAuthStore((s) => s.token);
  const invalidatePlaces = useInvalidatePlaces();

  useEffect(() => {
    if (!hasShareIntent) return;
    const url = shareIntent?.text ?? shareIntent?.webUrl;
    if (!url) { resetShareIntent(); return; }
    handleAutoSave(url);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasShareIntent]);

  const handleAutoSave = async (url: string) => {
    if (!token) {
      toast.error("로그인이 필요합니다.");
      resetShareIntent();
      return;
    }

    try {
      toast.info("URL 분석 중...");

      const parseRes = await parseUrl(url, token);
      if (!parseRes.success || !parseRes.data) {
        toast.error("파싱에 실패했습니다.");
        resetShareIntent();
        return;
      }

      const parsed = parseRes.data;
      toast.info("저장 중...");

      const spacesRes = await listTeamSpaces(token);
      if (!spacesRes.success || !spacesRes.data || spacesRes.data.length === 0) {
        toast.error("팀스페이스가 없습니다.");
        resetShareIntent();
        return;
      }

      const spaceId = spacesRes.data[0].id;

      const saveRes = await addPlace({
        spaceId,
        name:           parsed.name ?? "이름 없음",
        category:       parsed.category ?? undefined,
        address:        parsed.location.address ?? undefined,
        region:         parsed.location.region ?? undefined,
        country:        parsed.location.country ?? undefined,
        priceDesc:      parsed.price.description ?? undefined,
        priceMin:       parsed.price.min ?? undefined,
        priceMax:       parsed.price.max ?? undefined,
        currency:       parsed.price.currency ?? undefined,
        hours:          parsed.hours ?? undefined,
        thumbnailUrl:   parsed.thumbnailUrl ?? undefined,
        sourceUrl:      parsed.sourceUrl,
        sourcePlatform: parsed.sourcePlatform,
        tags:           parsed.tags,
        menu:           parsed.menu,
        confidence:     parsed.confidence,
      }, token);

      if (saveRes.success) {
        toast.success(`"${parsed.name ?? "장소"}" 저장됨`);
        invalidatePlaces();
      } else {
        toast.error("저장에 실패했습니다.");
      }
    } catch {
      toast.error("오류가 발생했습니다.");
    } finally {
      resetShareIntent();
    }
  };

  return null;
}

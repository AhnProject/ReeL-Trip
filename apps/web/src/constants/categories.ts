/** 여행지 카테고리 코드 → 한글 라벨 */
export const CATEGORY_LABEL: Record<string, string> = {
  restaurant: "식당",
  cafe: "카페",
  attraction: "관광지",
  accommodation: "숙소",
  activity: "액티비티",
  other: "기타",
};

/** 카테고리 코드를 한글 라벨로 변환 (없으면 원본 반환) */
export function categoryLabel(raw: string | null): string | null {
  if (!raw) return null;
  return CATEGORY_LABEL[raw] ?? raw;
}

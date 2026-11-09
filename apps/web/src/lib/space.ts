const KEY = "selectedSpaceId";

export function getSelectedSpaceId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY);
}

export function setSelectedSpaceId(id: string | number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, String(id));
}

/** 저장된 선택값이 있으면 그 스페이스를, 없거나 목록에 없으면 첫 번째 스페이스를 반환 */
export function pickSpace<T extends { id: string | number }>(spaces: T[]): T | undefined {
  const stored = getSelectedSpaceId();
  if (stored) {
    const found = spaces.find((s) => String(s.id) === stored);
    if (found) return found;
  }
  return spaces[0];
}

# 완료보고서

> 작업 완료 후 Claude가 작성하는 문서입니다.

---

## 작업 정보

| 항목 | 내용 |
|------|------|
| **완료일** | 2026-07-22 |
| **작업지시서 참조** | 2026-07-22-teamspace-events-real-db.md |
| **대상 앱** | Web |
| **대상 페이지/화면** | `/dashboard` (DashboardScreen) |
| **작업 유형** | 실DB 전환 |

---

## 작업 결과 요약

TeamSpace의 events를 하드코딩 mock에서 실 API(`GET /api/events?spaceId=`)로 전환하고, dead code인 `mock.ts`를 제거했습니다.

---

## 변경된 파일

| 파일 경로 | 변경 유형 | 주요 변경 내용 |
|-----------|-----------|----------------|
| `apps/web/src/domains/teamspace/mock.ts` | **삭제** | 미사용 dead code 제거 |
| `apps/web/src/domains/teamspace/mappers.ts` | 수정 | `toTripEvent()` 매퍼 추가 |
| `apps/web/src/domains/dashboard/components/DashboardScreen.tsx` | 수정 | events 실 API 연동, space 전환 시 재fetch |

---

## 변경 사항 상세

### mappers.ts — `toTripEvent()` 추가

**변경 전:**
```ts
events: [],  // toTeamSpace()가 항상 빈 배열 반환
```

**변경 후:**
```ts
export function toTripEvent(res: EventResponse): TripEvent {
  return {
    id: String(res.id),
    title: res.title,
    startDate: res.startDate,
    endDate: res.endDate,
    location: res.location ?? "",
    color: res.color,
  };
}
```

### DashboardScreen.tsx — events fetch 추가

**변경 후 추가된 useEffect:**
```ts
useEffect(() => {
  if (!token || !selectedSpaceId) return;
  listEvents(Number(selectedSpaceId), null, token).then((res) => {
    if (res.success && res.data) {
      const events = res.data.map(toTripEvent);
      setSpaces((prev) =>
        prev.map((s) => s.id === selectedSpaceId ? { ...s, events } : s)
      );
    }
  }).catch((err) => console.error("[DashboardScreen] events", err));
}, [token, selectedSpaceId]);
```

- `selectedSpaceId`가 바뀔 때마다 해당 space의 events를 재요청
- 응답 결과를 `spaces` state에 merge하여 `TravelHeroCard`의 D-day·날짜 범위 정상 표시

---

## 테스트 체크리스트

- [ ] 대시보드 진입 시 TravelHeroCard D-day 정상 표시 확인
- [ ] 사이드바에서 다른 여행으로 전환 시 events 재요청 및 반영 확인
- [ ] events 없는 space 진입 시 fallback 정상 표시 확인
- [x] TypeScript 타입 오류 없음 (`tsc --noEmit` 통과)

---

## 잔여 이슈 / 후속 작업

- `ScheduleTimeline`의 `DUMMY_SCHEDULE` → 실 events 데이터 연동 (실DB 전환 #2)
- `AiRecommendSection`의 `DUMMY_PLACES` → 실 places API 연동 (실DB 전환 #3)
- `TodoPanel`의 `DUMMY_TODOS` → todos API 미구현, 별도 확인 필요 (실DB 전환 #4)
- 추후 TanStack Query 도입 시 events fetch 로직 교체 권장

---

## 특이 사항

- `MOCK_TEAM_SPACES`는 export만 되어 있고 import하는 파일이 전혀 없었음 — 빌드 영향 없이 안전하게 삭제
- `toTeamSpace()`의 `events: []` 초기값은 유지 — 이후 별도 useEffect에서 채워지는 구조

# Review

_(reviewer writes here: findings, verdict APPROVED / CHANGES REQUESTED)_

검토 기준: `.team/RESEARCH.md`(버그 근거)와 `.team/TASKS.md` "3. 수정" 섹션(수정 방향)에 대해, 각 커밋의 실제 diff가 (1) 지정된 범위를 벗어난 리팩토링/코드 정리를 하지 않았는지, (2) 버그가 실제로 해소되는지, (3) 사이드이펙트가 없는지를 확인.

---

## [1] A1 — 모바일 리프레시토큰 없음 리다이렉트 버그 (da7f827)

**APPROVED**

- `apps/mobile/src/lib/api-client.ts` `attemptRefresh`의 `if (!refreshToken) return null;` 분기에 `useAuthStore.getState().clearAuth()` 추가. 다른 분기(41/44/84줄 상당)와 동일한 `clearAuth()` 호출 패턴, 웹 f1d6d08과 동일 구조.
- `clearAuth()` → `token`이 falsy로 바뀌고 `AuthGuard`(`app/_layout.tsx`)가 이를 감지해 로그인 화면으로 리다이렉트 — RESEARCH.md A1에서 지적한 증상(반복 401, 리다이렉트 안 됨)이 해소됨.
- 변경 라인 수 4줄, 지정 파일·지정 범위 외 수정 없음. 리팩토링 없음.

## [2] B1 — Place 수정이 서버에 저장되지 않음 (3aa39d1)

**APPROVED**

- 백엔드: `PlaceController`에 `PATCH /{id}` 추가, `PlaceService`/`PlaceServiceImpl`에 `update` 신규 구현. 각 필드 `if (request.getX() != null) place.setX(...)` 패턴으로 병합 후 `placeMapper.update(place)` 호출 — 부분 업데이트가 Java 레이어에서 머지되므로 MyBatis `<set>`의 무조건 `#{field}` 바인딩과 결합해도 안전(머지된 전체 상태를 다시 쓰는 것이므로 데이터 유실 없음). `checkSpaceMember`로 기존 add/findById/delete와 동일한 멤버십 체크 패턴 적용 확인. `PlaceMapper.xml`의 `<update>`도 `insert`/`resultMap`과 컬럼·타입핸들러 일치.
- 프런트: web `TravelMapScreen`/mobile `useTravelData` 모두 `.catch(() => {})` 제거하고, 실패 시 동일한 토글 함수를 재호출해 로컬 상태를 되돌리는 방식으로 롤백 구현 + 기존 토스트 유틸(`toast`/`useToast`) 재사용(신규 유틸 생성 없음, import도 기존 패턴 재사용 확인). mobile `PlaceCorrectSection`은 `res.success` 체크 후 실패 시 `onUpdate` 미호출 + `toast.error` — 지시사항과 정확히 일치.
- `updatePlace(placeId, {}, token)`(장소 확정 토글)은 여전히 서버에 "confirmed" 상태 자체를 영속화하지 않는 설계(Place 모델에 confirmed 컬럼 없음)이지만, 이는 TASKS.md에 명시된 수정 범위(에러 무시 제거 + 롤백)를 벗어나는 기존 설계이며 RESEARCH.md B1도 에러 무시 문제만 지적함 — 범위 내에서 올바르게 처리됨.
- 6개 파일 모두 지정된 대상과 일치, 추가 리팩토링 없음.

## [3] C2 — 웹 `/dashboard/member` 초대·내보내기 버튼 미동작 (1cdf00a)

**APPROVED**

- `inviteMember`/`removeMember` import 추가, 각 버튼에 `onClick` 연결. `handleInvite`/`handleRemove` 모두 로딩 상태(`inviting`/`removingId`) + 인라인 성공/실패 메시지(`message` state) 처리.
- 에러 코드 분기(`USER_NOT_FOUND`, `ALREADY_MEMBER`)는 백엔드 `ErrorCode.java`에 실제 존재하는 코드와 일치. `inviteMember`/`removeMember` 함수 시그니처(스페이스ID, username/userId, token) 및 반환 타입(`MemberResponse`/`void`)도 `apps/web/src/domains/teamspace/api.ts`와 일치.
- 지정 파일(`MemberScreen.tsx`) 외 수정 없음. 기존 `InviteMemberModal`/`DashboardScreen` 호출 패턴을 재사용한다는 지시와 부합(동일한 성공/실패 분기 스타일).

## [4] D1 — 모바일 탭 간 "현재 스페이스" 불일치 (c90b86b)

**APPROVED**

- `store/space.ts`에 최소한의 zustand store(`selectedSpaceId`/`setSelectedSpaceId`) 신규 추가. `useTravelData`/`useHomeData`/`useCalendarData`/`ShareHandler` 네 곳 모두 "선택된 id가 현재 스페이스 목록에 있으면 사용, 없으면 `spaces[0]`로 폴백" 패턴으로 통일되게 수정됨.
- `useTravelData`의 `setSelectedIdx(idx)`가 인덱스 → 전역 `selectedSpaceId`로 변환 — 기존 소비자인 `TravelScreen.tsx` → `SpaceTabs`의 `onSelect={setSelectedIdx}`(인덱스 기반 콜백) 시그니처와 호환됨을 확인(변경 불필요, 실제로 변경 안 됨).
- `useHomeData`/`useCalendarData`에서 `firstSpaceId` 참조가 전부 `currentSpaceId`로 교체되어 누락된 참조 없음(grep으로 확인).
- `ShareHandler`의 `selectedSpaceId as number` 캐스트는 `.some()` 조건이 true인 분기에서만 사용되므로 런타임상 안전(TS 타입 좁히기의 한계를 캐스트로 보완한 것일 뿐, 실제 null이 들어갈 경로 없음).
- 지정 파일 4개 + 신규 store 파일, 범위 밖 수정 없음.

## [5] C1 — 팀스페이스 오너 자기제거 서버 방어 누락 (16c6299)

**APPROVED**

- `TeamSpaceServiceImpl.removeMember`에 `checkOwner` 이후 `userId.equals(space.getOwnerId())` 체크 + `OWNER_CANNOT_BE_REMOVED` 신규 에러코드로 즉시 차단. `MEMBER_NOT_FOUND` 체크보다 먼저 수행되어 오너 대상 호출 시 정확한 에러코드 반환.
- `ErrorCode.java`에 한 줄 추가 외 다른 수정 없음. 지시사항("가드 한 줄 추가")과 정확히 일치, 리팩토링 없음.

## [6] C3 — Todo `dueDate` 부분수정 시 유실 가능 (fa49378)

**APPROVED**

- `TodoServiceImpl.update`에서 `todo.setDueDate(request.getDueDate())` → `if (request.getDueDate() != null) todo.setDueDate(...)`로 변경, `priority`/`isDone`과 동일한 패턴.
- `title`은 지시사항에도 없고 RESEARCH.md에서도 버그로 지적되지 않아 그대로 유지됨(범위 이탈 없음, 불필요한 겸손한 수정 거부가 아니라 정확히 지시된 범위만 수정).
- 1줄 변경, 범위 이탈 없음.

---

## 종합

6개 항목 전부 **APPROVED**. 공통적으로 확인된 사항:
- 모든 커밋이 TASKS.md에 명시된 대상 파일·수정 방향을 벗어나지 않음(리팩토링/코드 정리 없음).
- 각 버그는 RESEARCH.md의 재현 시나리오 기준으로 실제로 해소됨(코드 추적 기준, 런타임 실행 검증은 아님).
- 신규 코드(zustand store, DTO, ErrorCode 등)는 기존 리포지토리 패턴(멤버십 체크, 토스트 유틸, ApiResponse 포맷)을 그대로 재사용해 사이드이펙트 위험이 낮음.
- 사이드이펙트 우려 지점(B1의 MyBatis `<set>` 무조건 바인딩, D1의 타입 캐스트)은 모두 검토했고 실제 데이터 유실/런타임 오류로 이어지지 않음을 확인.

다음 단계: CHANGES REQUESTED 항목 없음 — TASKS.md "4. 검토" 완료, "5. 완료보고" 단계로 진행 가능.

---

# 묶음 A — 빠른 승리 [1]~[5] (기능 격차/버그 혼합 사이클, 2026-11-06)

검토 기준: `.team/RESEARCH.md` "## G. 기능 격차 조사" 섹션(G-1~G-5, G4-3)과 `.team/TASKS.md` "4. 개발 > 묶음 A" 설명. 각 커밋이 (1) 지정 범위를 벗어난 리팩토링을 하지 않았는지, (2) 기능이 실제로 동작하는지(타입/시그니처/백엔드 대조 기준), (3) 사이드이펙트가 없는지 확인. 웹/모바일 `npx tsc --noEmit`을 직접 실행해 교차검증(둘 다 clean, 모바일 쪽 사전 존재하던 무관 오류 4건은 이번 커밋이 건드린 파일/라인이 아님을 diff와 대조해 확인).

## [1] G4-3 — 모바일 `getProfile()` 경로 버그 수정 (e6f72f7)

**APPROVED**

- `apps/mobile/src/domains/user/api.ts`에서 `/api/profile` → `/api/user/profile`로 1줄 수정. 백엔드 `UserController`(`@RequestMapping("/api/user")` + `@GetMapping("/profile")`)와 웹 wrapper(`apps/web/src/domains/user/api.ts:12`)와 정확히 일치.
- RESEARCH.md G4-3에서 지적한 "항상 404 → 프로필 화면 항상 빈 값" 증상이 해소됨. 범위 이탈 없음.

## [2] G2-3/G4-1 — 웹 AI 추천 실연동 (43e09fb)

**APPROVED**

- `apps/web/src/domains/recommend/api.ts` 신설, 모바일 `RecommendScreen.tsx`와 동일한 엔드포인트(`POST /api/recommend`)·파라미터(`topK=5`, `threshold=0.5`) 패턴 확인.
- `AiScreen.tsx`의 `DUMMY_AI_RECS` 완전 제거, `PlaceDetailModal`이 선택 장소 기준 쿼리로 `recommend()` 호출 후 로딩/에러/빈 상태 3분기 모두 처리.
- 타입 대조 확인: `RecommendOutput.results`는 `SimilarDocumentRecord[]`(`packages/types`)이고 이를 `RecommendResult[]` state에 담는데, `SimilarDocumentRecord`가 `RecommendResult`의 모든 필드(id/title/content/similarity/createdAt)를 상위집합으로 포함하므로 구조적으로 안전. `res.message ?? "..."` 부분은 `ApiResponse.message`가 항상 `string`(nullable 아님)이라 `??`가 사실상 도달 불가능한 코드이지만 런타임 오류를 일으키지 않는 수준의 경미한 중복이라 blocking 아님.
- 백엔드 변경 없음(기존 `/api/recommend` 재사용) — 커밋 메시지와 일치. "추가" 버튼(`onAddRec`)의 "콘솔만 출력" 플레이스홀더는 이번 작업 범위(더미→실제 추천 데이터 연동) 밖이라 그대로 유지된 것이 맞음 — 범위 이탈 아님.

## [3] D3 — 웹 Todo 위젯 보완 (026fdeb) — **이전 세션 중단 후 재작업분, 집중 검토**

**APPROVED**

- **JSX 태그 검증**: 기존 코드는 todo 아이템을 `<div className="flex-1">...</div>`로 감싸고 있었는데, 이번 커밋에서 열림 태그를 `<button onClick={() => handleToggle(todo)} className="flex-1 ...">`로 바꾸면서 **닫힘 태그도 `</div>` → `</button>`로 정확히 함께 변경**됨(diff 마지막 hunk). 현재 파일 전체(255~410줄)를 직접 읽어 중첩 구조(`<button>` → 내부 `<div>`×2 → `</button>`, 형제로 삭제 `<button>`)가 완전히 균형 잡혀 있음을 확인. `npx tsc --noEmit`(apps/web) 직접 실행 결과 **0 에러** — JSX/타입 모두 정상.
- **`onToggle` prop 연결 검증**: `TodoPanel` props 타입에 `onToggle: (todo: TodoResponse) => void` 추가 → 내부 `handleToggle`이 `updateTodo` 호출 성공 시 `onToggle(res.data)` 호출 → 체크박스 역할의 `<button onClick={() => handleToggle(todo)}>`에서 실제로 트리거됨 → 호출부(`DashboardInner`)에서 `onToggle={(todo) => setTodos((prev) => prev.map((t) => (t.id === todo.id ? todo : t)))}`로 실제 연결 확인. prop 선언 → 내부 연결 → 호출부 전달까지 3단계 모두 끊김 없이 이어짐.
- `updateTodo` 호출 시 `title`/`priority`/`dueDate`를 기존 값 그대로 보내고 `isDone`만 토글 — 직전 사이클 C3(TodoServiceImpl dueDate null 체크)에서 고친 부분수정 로직과도 충돌 없음(항상 전체 필드를 채워 보내는 기존 호출 관례 유지).
- 완료 시 체크 아이콘(파란 배경+체크) / 미완료 시 빈 테두리 아이콘 분기, 완료 시 제목 취소선(`line-through`) — 모바일 `TodoPanel.tsx` 패턴 참고 지시와 부합.
- 추가 시 우선순위 select/마감일 date input은 `createTodo` payload에 바로 반영되고 추가 성공 시 입력값 리셋됨. 백엔드 변경 없음(기존 `CreateTodoPayload`/`UpdateTodoPayload` 타입에 이미 있는 필드 재사용). 범위 이탈 없음.

## [4] D2 — 모바일 팀스페이스 수정/삭제 화면 (2c24cc2)

**APPROVED**

- `apps/mobile/src/domains/teamspace/api.ts`에 `updateTeamSpace`/`deleteTeamSpace`/`listMembers` wrapper 추가 — 엔드포인트·메서드·payload 모두 웹(`apps/web/src/domains/teamspace/api.ts`)과 1:1 일치.
- 신규 `SpaceSettingsModal.tsx`: `isOwner` 체크(이름/이모지 입력 `editable={isOwner}`, 저장/삭제 버튼은 `isOwner` 분기에서만 노출)로 UI 레벨 방어 + 백엔드 `TeamSpaceServiceImpl.update`/`delete`에 이미 `checkOwner()`가 걸려 있음을 직접 확인(148줄 `checkOwner` 메서드, update/delete 양쪽에서 호출) — UI가 우회되어도 서버가 최종 방어함.
- `FormInput`/`Button` 컴포넌트 props(label/placeholder/value/onChangeText/editable, label/onPress/loading/disabled/variant) 전부 실제 컴포넌트 정의와 일치, `useInvalidateSpaces`/`toast` 등 기존 유틸 재사용 확인.
- `TravelScreen.tsx`에 설정 아이콘 버튼 + 모달 렌더 추가 — 기존 `MemberModal` 호출부와 동일한 `{showX && currentSpace && <Modal space={currentSpace} .../>}` 패턴 재사용, `currentSpace` 타입(`TeamSpaceResponse`)도 기존 `MemberModal`에 이미 전달되던 것과 동일.
- `listMembers`는 신설되었으나 실제로는 어디서도 호출되지 않음(웹 쪽 동일 wrapper도 마찬가지로 미사용) — TASKS.md가 명시적으로 "wrapper 추가"만 지시했고 웹에도 동일한 선례가 있어 범위 이탈은 아니나, 참고용으로 기록.
- `npx tsc --noEmit`(apps/mobile) 결과 4건 에러는 모두 `FAB.tsx`/`SignupScreen.tsx`/`TravelScreen.tsx`(37·44줄, 이번 커밋이 건드리지 않은 기존 `router.push` 라인)로, 이번 커밋이 추가한 코드와 무관함을 diff 대조로 확인. 백엔드 변경 없음.

## [5] G2-2 — 프로필 수정 폼 (80a866a)

**APPROVED**

- 웹: `SettingsScreen.tsx`의 하드코딩 이메일(`${username}@reeltrip.com`)을 실제 `getProfile` 응답의 `email` 필드로 교체, `updateProfile` 호출(기존 wrapper 재사용, 백엔드 `UserServiceImpl.updateProfile` + `EMAIL_ALREADY_EXISTS` 에러코드까지 실제 존재 확인) 연동. 사용자명 입력은 `disabled`로 읽기 전용 처리 — 지시사항과 일치.
- 모바일: `domains/user/api.ts`에 `updateProfile` wrapper 신설(웹과 동일 시그니처), 신규 `EditProfileModal.tsx` + `ProfileScreen.tsx` 헤더 수정 버튼 연결. 저장 성공 시 `qc.invalidateQueries({queryKey: ["profile"]})` 호출 — `useProfile.ts`의 실제 `queryKey: ["profile"]`과 정확히 일치해 프로필 캐시 갱신이 실제로 일어남.
- 경미한 참고사항(blocking 아님): `EditProfileModal`이 `visible` prop으로만 토글되고 조건부 마운트되지 않아 `initialEmail`을 `useState` 초기값으로만 받음 — 현재 유일한 사용 흐름(프로필 로드 완료 후 모달 마운트, 이후 같은 화면 내에서만 열고 닫음)에서는 문제없으나, 추후 다른 경로로 `profile.email`이 바뀌는 상황이 생기면 모달이 그 변경을 반영하지 못할 수 있음 — 참고로만 기록, 현재 범위에서 수정 요구하지 않음.
- 백엔드 변경 없음(기존 엔드포인트/DTO 재사용) — 커밋 메시지와 일치. 범위 이탈 없음.

## 묶음 A 종합

5건 전부 **APPROVED**. 특히 [3]은 지시받은 대로 JSX 태그 짝과 `onToggle` prop의 선언→내부 호출→부모 전달 3단계를 전부 코드 추적 + `tsc --noEmit` 실행으로 교차검증했고 문제 없음을 확인. 5건 모두 "백엔드 변경 없음" 명시가 실제 diff(백엔드 파일 미포함)와 일치하며, 신규 코드는 기존 컴포넌트(`FormInput`/`Button`/`toast`)·훅(`useInvalidateSpaces`/`useProfile`)·타입(`TeamSpaceResponse`/`UserProfile`)을 그대로 재사용해 사이드이펙트 위험이 낮음. CHANGES REQUESTED 없음 — 묶음 B([6] 알림 생성) 진행 가능.

---

# 묶음 B — 알림 생성 로직 [6-a]~[6-e] (2026-11-06)

검토 기준: `.team/RESEARCH.md` G3-1("백엔드 전체에 알림을 생성하는 코드가 전무")과 `.team/TASKS.md` "4. 개발 > 묶음 B" 설명. 지시받은 4가지 관점으로 전부 확인: (1) 6-a가 기존 멤버십 체크/트랜잭션 패턴을 따르는지, (2) 6-b~6-e가 행위자 본인을 제외하고 나머지 멤버 전체에게만 알림을 생성하는지, (3) N+1/성능 및 **알림 생성 실패가 본 기능 실패로 전파되지 않는지(best-effort)**, (4) 범위 이탈 여부. `apps/api-spring`에서 직접 `mvn -o compile` 실행해 컴파일 상태 교차검증(클린, 에러 없음).

## [6-a] 알림 생성 공통 인프라 (f94d30e)

**CHANGES REQUESTED**

- **(1) 멤버십 체크/패턴 확인 — 통과**: `NotificationService.create(userId, message, type, relatedSpaceId)`는 `username` 기반 소유권 체크를 하지 않는데, 이는 설계상 올바름 — `findById`/`markAsRead`/`delete`는 사용자가 **자신의** 알림에 접근하는 외부 노출 경로라 `getNotification(id, userId)`로 소유권을 검증하지만, `create()`는 이미 멤버십이 검증된 호출자(TeamSpace/Event/Place/Message 서비스가 `findMembersBySpaceId`로 뽑은 멤버 목록)만 내부적으로 호출하는 신뢰된 헬퍼이므로 별도 소유권 체크가 불필요함. `NotificationMapper.xml`의 `<insert useGeneratedKeys="true" keyProperty="id" keyColumn="id">`도 `PlaceMapper`/`TeamSpaceMapper` 등 기존 insert 패턴과 동일. `NotificationController`에 `create`가 REST로 노출되지 않음도 확인(diff에 컨트롤러 변경 없음).
- **(1) 트랜잭션 처리 확인 — 기존 패턴은 따르지만, 그 자체가 문제**: 저장소 전체(`grep -rn "@Transactional"`)에 `@Transactional` 사용이 **0건**이라 `create()`에 트랜잭션 어노테이션이 없는 것 자체는 기존 관례와 일치함. 하지만 이 "트랜잭션 없음" 상태에서 `create()`가 예외를 던지면(예: DB 커넥션 일시 장애) 호출부(6-b~6-e)의 try-catch 없는 호출 때문에 예외가 그대로 전파되어 `GlobalExceptionHandler.handleGenericException`이 **HTTP 500**을 반환함 — 이미 메인 쓰기(`insertMember`/`eventMapper.insert`/`placeMapper.update`/`messageMapper.insert`)는 트랜잭션이 없어 롤백되지 않고 **DB에는 이미 커밋된 상태**인데도, 사용자에게는 "실패"로 보임.
- **요청하신 (3)번 관점(best-effort)에 대한 핵심 결론**: 알림 생성은 명세상 본 기능에 대해 best-effort여야 하는데, `create()` 자체도 호출부(6-b~6-e)도 예외를 흡수하는 코드가 전혀 없어(grep 결과 `notification` 관련 코드에 `try`/`catch` 0건) **이 보장이 어디에도 구현되어 있지 않음**. 재현 시나리오: 팀스페이스 멤버가 많은 스페이스에서 초대 처리 중 N번째 알림 INSERT가 DB 커넥션 풀 고갈 등으로 실패 → `inviteMember` 전체가 예외를 던짐 → 컨트롤러가 500 반환 → **프런트는 "초대 실패" 토스트를 보여주지만 실제로는 멤버가 이미 추가되어 있음**(`teamSpaceMapper.insertMember`는 이미 커밋됨) → 사용자가 재시도하면 `ALREADY_MEMBER` 에러를 보게 되는 혼란스러운 상태로 이어짐. 일정/장소/채팅도 동일한 패턴.
- **수정 권장(가장 효율적인 지점)**: `NotificationServiceImpl.create()` 내부(또는 6-b~6-e가 공통으로 거치는 지점)에서 예외를 잡아 로그만 남기고 삼키도록 수정하는 것을 권장 — 이 한 곳만 고치면 6-b~6-e 4개 커밋을 전부 다시 건드리지 않고도 best-effort 보장이 성립함. 멤버 반복 루프(`.forEach(m -> notificationService.create(...))`) 중 하나가 실패해도 나머지 멤버에 대한 알림 생성이 계속되도록(현재 `forEach` 안에서 예외가 나면 스트림 자체가 중단됨) 루프 레벨에서도 개별 실패를 흡수해야 함.

## [6-b] 팀스페이스 초대/제거 시 알림 생성 (47c32e7)

**CHANGES REQUESTED** (6-a와 동일한 근본 원인 — 아래 "묶음 B 종합" 참조)

- **(2) 자기제외 검증 — 통과**: `inviteMember`는 삽입 **전** 멤버 목록(`existingMembers`)을 떠서 `requester.getId()`만 제외하고 알림 — 요청자(행위자) 본인에게는 알림이 가지 않음, 새로 초대된 당사자도 (삽입 전 목록이라) 자연히 제외됨(자신이 참여했다는 알림을 자신에게 보낼 필요 없음, 스펙 상 문제 없음). `removeMember`는 `requester.getId()`와 제거 대상(`userId`) **둘 다** 제외 — 제거된 사용자에게 "너를 내보냈다"는 알림이 가지 않는 것도 합리적(이미 접근 권한이 없어짐). 자기 자신에게 알림이 가는 경로는 없음.
- `removeMember`가 기존 `existsMember` 단독 호출을 `findMembersBySpaceId` 조회 + 스트림 필터로 대체해 제거 대상의 `username`을 확보한 것은 원래 멤버 존재 체크 로직(존재하지 않으면 `MEMBER_NOT_FOUND`)과 동등하게 동작 — round-trip 1회 절약이라는 설명과도 일치, 회귀 없음.
- **(3) 성능**: 멤버 목록 조회는 스페이스당 1회(N+1 아님), 알림 INSERT는 멤버 수만큼(N회) — TASKS.md가 명시한 "`notificationMapper.insert` 호출 추가" 방식 그대로이며, 여행 팀스페이스의 통상적인 멤버 규모를 고려하면 즉시 배치 처리로 바꿀 필요는 없음(참고 사항일 뿐 blocking 아님).
- **(4) 범위**: `TeamSpaceServiceImpl`만 수정, 지시 대상과 일치. 범위 이탈 없음.

## [6-c] 일정(Event) 추가/변경 시 알림 생성 (ef8d231)

**CHANGES REQUESTED** (6-a와 동일한 근본 원인)

- **(2) 자기제외 검증 — 통과**: `notifyOtherMembers(spaceId, actorId, message)` 헬퍼가 `!m.getUserId().equals(actorId)`로 필터링, create/update 둘 다 `user.getId()`(행위자)를 넘겨 자기 자신 제외 확인.
- **(4) 범위**: 지시사항("추가/변경")대로 `create`/`update`에만 추가, `delete`에는 미추가(grep으로 확인) — 범위 이탈 없음. `TeamSpaceServiceImpl`과 거의 동일한 로직을 별도 `notifyOtherMembers` 사설 헬퍼로 재구현한 것은 파일 간 중복이 발생하지만(각 서비스가 각자 헬퍼를 가짐 — `NotificationService` 쪽에 공통화하지 않음), 묶음을 서브태스크별로 독립 커밋하라는 작업 방식과 충돌하지 않고 당장 버그는 아니므로 참고 사항으로만 기록.

## [6-d] Place 확정/추가 시 알림 생성 (99c726d)

**CHANGES REQUESTED** (6-a와 동일한 근본 원인)

- **(2) 자기제외 검증 — 통과**: `add`/`update` 모두 `notifyOtherMembers(spaceId, user.getId(), ...)`로 행위자 제외 확인.
- Place에 실제 "confirmed" 컬럼이 없어 "확정 토글"과 "정보 보완"이 같은 `update()`를 공유해 알림 문구가 항상 "확정했습니다"로 나가는 것은 커밋 메시지에 이미 명시된 기존 스키마 한계이고, 스키마 변경(확정 컬럼 신설)은 이번 사이클 범위(G3-1 알림 생성)가 아니라 별도 데이터 모델링 작업이므로 범위 밖으로 보류한 판단에 동의. 범위 이탈 없음.

## [6-e] 채팅 메시지 알림 생성 (679dfce)

**CHANGES REQUESTED** (6-a와 동일한 근본 원인)

- **(2) 자기제외 검증 — 통과**: `!m.getUserId().equals(user.getId())`로 발신자 제외 확인.
- `request.getContent()`가 `@NotBlank`로 컨트롤러 레벨에서 검증되어 `null`이 들어올 수 없음을 확인 — 30자 미리보기 로직(`substring(0, 30)`)에서 NPE 위험 없음.
- `type="chat"`이 프런트 `TYPE_META`(웹)·모바일 알림 UI 양쪽에서 안전하게 기본 아이콘으로 폴백됨을 직접 확인(`TYPE_META[n.type ?? "default"] ?? TYPE_META.default`, 모바일은 타입별 분기 자체가 없음) — 크래시 위험 없음. UI 전용 아이콘 매핑 추가는 범위 밖이라는 판단에 동의.

## 묶음 B 종합

**5건 중 5건 CHANGES REQUESTED** — 전부 동일한 근본 원인 하나 때문입니다.

요청하신 체크리스트 (1)(2)(4)는 전부 통과했습니다: 6-a는 기존 멤버십/트랜잭션 패턴을 그대로 따르고, 6-b~6-e 전부 행위자 본인을 정확히 제외하고 나머지 멤버에게만 알림을 생성하며(자기 자신에게 알림이 가는 버그 없음), 범위 이탈도 없습니다.

하지만 **(3) "알림 생성 실패가 본 기능 실패로 전파되지 않아야 한다(best-effort)"는 요건이 어디에도 구현되어 있지 않습니다.** `notificationService.create(...)` 호출부(6-b~6-e) 어디에도 try-catch가 없고, `create()` 자신도 예외를 흡수하지 않습니다. 저장소 전체에 `@Transactional`이 없어(기존 관례) 메인 쓰기는 이미 커밋되지만, 알림 INSERT가 실패하면 예외가 컨트롤러까지 전파되어 `GlobalExceptionHandler`가 HTTP 500을 반환합니다 — **실제로는 초대/일정/장소/채팅 작업이 성공했는데 사용자에게는 실패로 보이는** 사용자 체감 버그가 발생할 수 있습니다(멤버 수가 많은 스페이스에서 커넥션 풀 고갈 등 흔치 않지만 실제 가능한 시나리오).

**권장 수정 범위**: `NotificationServiceImpl.create()`(6-a) 내부에서 예외를 잡아 로그만 남기고 삼키도록 한 줄 추가 + 멤버 반복 루프(`forEach`)가 한 멤버에 대한 알림 실패로 전체 루프가 중단되지 않도록 보장. 이 한 지점만 고치면 6-b/6-c/6-d/6-e는 **코드 변경 없이** 안전해지므로, 재작업 범위는 6-a 커밋 하나로 좁게 잡을 수 있습니다(6-b~6-e의 "CHANGES REQUESTED"는 재작업이 필요하다는 뜻이 아니라, 6-a가 고쳐지기 전까지는 안전성이 보장되지 않는다는 의존 관계를 표시한 것입니다).

---

## 재검토 결과 (2026-11-06, 커밋 3f0ff68)

워커가 위 CHANGES REQUESTED 사유를 커밋 **3f0ff68** 하나로 수정. `NotificationServiceImpl.create()` 본문 전체(builder 생성 + `notificationMapper.insert`)를 `try { ... } catch (Exception e) { log.error(...); }`로 감싸고, catch 블록에 `throw` 없이 `log.error("알림 생성 실패 (userId={}, type={}, relatedSpaceId={})", ..., e)`만 남김 — 클래스에 `@Slf4j` 추가(기존 `GlobalExceptionHandler`와 동일 스타일, 신규 로깅 프레임워크 도입 아님). `apps/api-spring`에서 직접 `mvn -o compile` 재실행해 클린 컴파일 확인.

**(a) 예외를 실제로 흡수하는지**: `catch (Exception e)` 블록 안에 `throw`/`rethrow` 문이 전혀 없고 로깅만 수행 — `create()`를 호출하는 쪽에서 더 이상 어떤 예외도 받지 않음. 확인됨.

**(b) 로그만 남기고 삼키는지**: `log.error(...)`에 `userId`/`type`/`relatedSpaceId`와 예외 객체(`e`)까지 포함해 디버깅에 필요한 컨텍스트를 남기면서도 호출자에게는 아무 신호도 돌려주지 않음(반환값 없음, 예외 없음) — "로그만 남기고 삼킨다"는 설명과 정확히 일치.

**(c) 6-b~6-e의 forEach 호출부가 추가 수정 없이 안전해졌다는 판단이 맞는지**: 현재 소스에서 5개 호출부를 전부 직접 재확인함 —
- `TeamSpaceServiceImpl.inviteMember`(114줄), `removeMember`(150줄)
- `EventServiceImpl.notifyOtherMembers`(132줄, create/update 양쪽에서 호출)
- `PlaceServiceImpl.notifyOtherMembers`(147줄, add/update 양쪽에서 호출)
- `MessageServiceImpl.send`(77줄)

다섯 곳 모두 `.forEach(m -> notificationService.create(m.getUserId(), ..., ...))` **단 한 줄짜리 람다**이고, `create()` 호출 외에 람다 안에서 별도로 예외를 던질 수 있는 로직이 없음. `create()`가 더 이상 예외를 전파하지 않으므로 (1) 호출부의 상위 메서드(`inviteMember`/`removeMember`/`create`/`update`/`add`/`send`)가 알림 실패로 인해 더 이상 500을 반환하지 않고, (2) 스트림의 `forEach`도 한 멤버에서 예외로 중단되는 일 없이 나머지 멤버에게 계속 알림을 시도함 — 이전 리뷰에서 지적한 "루프 중단" 우려까지 함께 해소됨. **워커의 판단이 정확함 — 6-b~6-e는 추가 코드 변경이 필요 없음.**

**종합 — 묶음 B: APPROVED로 재분류**

- [6-a] f94d30e + 3f0ff68(수정분 포함): **APPROVED**
- [6-b] 47c32e7: **APPROVED** (6-a 수정으로 안전성 확보, 추가 변경 없음)
- [6-c] ef8d231: **APPROVED** (〃)
- [6-d] 99c726d: **APPROVED** (〃)
- [6-e] 679dfce: **APPROVED** (〃)

이전에 기록한 CHANGES REQUESTED와 그 근거는 위에 그대로 남겨두고, 이 섹션을 재검토 결과로 추가함. 묶음 C([7] 알림 설정 저장) 진행 가능.

---

# 묶음 C — 알림 설정 저장 [7-a]~[7-d] (2026-11-06)

검토 기준: `.team/RESEARCH.md` G1-3("웹 알림설정 토글 미저장")/G4-2("알림설정 모바일 부재")와 `.team/TASKS.md` "4. 개발 > 묶음 C" 설명. 지시받은 5가지 관점 전부 확인: (1) V9 마이그레이션의 네이밍/스타일/충돌 여부, (2) 백엔드가 본인 설정만 조회/저장하는지, (3) 웹/모바일이 실제 저장 API를 호출하고 새로고침 후에도 값이 유지되는지, (4) **묶음 B의 알림 생성 로직이 이 설정값을 실제로 참조하는지**, (5) 범위 이탈 여부. `apps/api-spring`에서 `mvn -o compile`, `apps/web`·`apps/mobile`에서 `npx tsc --noEmit` 직접 실행해 교차검증(전부 클린, 모바일 사전 존재 오류 4건은 이번 커밋과 무관함을 재확인).

## [7-a] DB 마이그레이션 (92f2738)

**APPROVED**

- `V9__add_notification_settings.sql`을 직접 V1~V8과 대조: 파일명 규칙(`V{n}__{설명}.sql`), 한글 주석 한 줄, `CREATE TABLE IF NOT EXISTS`, 컬럼 타입 정렬, `NOT NULL DEFAULT`, `created_at`/`updated_at TIMESTAMP NOT NULL DEFAULT NOW()` 전부 V8(`todos`)·V5(`notifications`) 스타일과 일치.
- `user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE`로 1:1 설정 테이블을 구성 — 기존 V1~V8에 동일한 패턴이 없지만 표준적인 1:1 관계 설계이고 다른 테이블명과 충돌 없음(`notifications`와 `notification_settings`는 별개 테이블). 기존 스키마에 `ALTER`를 가하지 않아 충돌 없음.
- 기본값(`new_place`/`schedule_change`/`member_join = true`, `ai_recommend = false`)이 커밋 메시지에 명시된 대로 웹 `SettingsScreen`의 기존 로컬 state 초기값과 정확히 일치.

## [7-b] 백엔드 설정 조회/저장 엔드포인트 (86b639d)

**APPROVED** (단, 아래 "묶음 C 종합"의 (4)번 발견에 걸려 있음 — 이 커밋 자체는 지시된 범위를 올바르게 구현함)

- **(2) 본인 설정만 조회/저장하는지 — 통과**: `GET/PUT /api/notifications/settings` 둘 다 `Principal principal` → `principal.getName()`(JWT 서명에서 유도된 username) → `getUser(username).getId()`로만 `userId`를 결정. `UpdateNotificationSettingsRequest` DTO에 `userId` 필드 자체가 없어 클라이언트가 요청 바디로 다른 사용자의 `userId`를 보낼 방법이 원천적으로 없음. 기존 `UserController.updateProfile(Principal, ...)` 패턴과 동일함을 직접 대조 확인 — 커밋 메시지의 "기존 패턴과 동일" 주장이 정확함.
- `upsert`는 `INSERT ... ON CONFLICT (user_id) DO UPDATE`로 1회 round-trip, `#{}` 파라미터 바인딩으로 SQL 인젝션 위험 없음. `getSettings`에서 행이 없으면(최초 조회) DB에 쓰지 않고 메모리상 기본값 객체로만 응답 — 불필요한 쓰기 없이 깨끗하게 처리됨.
- `NotificationController`에 `/settings`를 `/{id}` 매핑보다 먼저 선언했지만, Spring MVC는 리터럴 경로를 경로변수 패턴보다 항상 우선 매칭하므로 선언 순서와 무관하게 라우팅 충돌 없음.

## [7-c] 웹 알림 설정 실연동 (998dcf0)

**APPROVED**

- **(3) 저장 API 호출 + 새로고침 후 유지 — 통과**: 마운트 시 `getNotificationSettings(storedToken)`로 서버 값을 가져와 `notifSettings` state를 교체(기존엔 하드코딩된 초기값만 있었음) — 새로고침하면 서버에 저장된 실제 값이 로드됨. 토글 클릭 시 `handleToggleNotifSetting`이 낙관적 업데이트 후 `updateNotificationSettings` 호출, 실패 시 이전 값으로 롤백 + 에러 메시지 표시.
- `item.key`(`newPlace`/`scheduleChange`/`memberJoin`/`aiRecommend`) 목록과 `NotificationSettingsResponse` 타입 필드가 정확히 일치함을 직접 대조. `npx tsc --noEmit`(apps/web) 클린.
- 커밋 메시지에 명시된 "여행 스페이스 탭의 미연동 저장/삭제 버튼은 7-c 범위 밖"이라는 판단에 동의 — 실제로 손대지 않음(diff 확인).

## [7-d] 모바일 알림 설정 화면 신설 (49dbf26)

**APPROVED**

- 웹과 동일한 엔드포인트/페이로드(`NotificationSettingsResponse` 타입까지 동일하게 재정의)로 `domains/notification/api.ts`에 wrapper 추가. 신규 `NotificationSettingsModal`이 모달이 열릴 때마다(`useEffect([visible, token])`) 서버에서 재조회 — **(3) 유지 여부 통과**: 모달을 닫고 다시 열어도 항상 서버 값을 다시 불러오므로 로컬에만 남는 상태가 없음.
- 토글 시 낙관적 업데이트 + 실패 롤백 + `toast.error` — 기존 `EditProfileModal`/`SpaceSettingsModal`과 동일한 에러 처리 패턴 재사용.
- `ProfileScreen`에 추가된 "알림 설정" 행은 기존 `Modal`+`SafeAreaView`+`modalHeader` 패턴 재사용, 커스텀 토글 트랙 UI는 "기존 프로젝트에 네이티브 Switch 사용 사례 없음"이라는 설명을 실제로 grep해 확인(네이티브 `Switch` import 0건) — 범위 이탈 아닌 합리적 판단.
- `npx tsc --noEmit`(apps/mobile) 결과 기존 사전 존재 오류 4건(FAB.tsx/SignupScreen.tsx/TravelScreen.tsx)만 남고 신규 오류 없음.

## 묶음 C 종합

**(1)(2)(3)(5)는 전부 통과**: 마이그레이션은 기존 스타일/네이밍을 그대로 따르고 스키마 충돌이 없으며, 백엔드는 JWT에서 유도한 본인 `userId`만 사용해 다른 사용자 설정을 건드릴 방법이 없고, 웹·모바일 모두 실제로 GET/PUT을 호출해 새로고침(모바일은 모달 재오픈) 후에도 값이 유지되며, 네 커밋 모두 지시된 파일/대상 범위를 벗어나지 않았습니다.

**그러나 (4)번 — "묶음 B의 알림 생성 로직이 이 설정값을 실제로 참조하는지"는 확인 결과 전혀 참조하지 않습니다.** `grep -rln "NotificationSettings" apps/api-spring/src/main/java`로 전체 백엔드를 검색한 결과 `NotificationSettingsMapper`/`NotificationSettingsResponse`/`NotificationSettings` 모델을 참조하는 파일은 `NotificationController`/`NotificationService`/`NotificationServiceImpl`뿐이고, `TeamSpaceServiceImpl`/`EventServiceImpl`/`PlaceServiceImpl`/`MessageServiceImpl` 어디에도 설정 조회 코드가 없습니다. 더 결정적으로, 묶음 B가 실제로 알림을 생성하는 유일한 지점인 `NotificationServiceImpl.create(Long userId, String message, String type, Long relatedSpaceId)`(현재 소스 61~75줄)를 직접 읽어도 `notificationSettingsMapper`를 호출하는 코드가 전혀 없습니다 — 예외 처리(3f0ff68)만 추가됐을 뿐, 설정 체크 로직은 처음부터 없었습니다.

**재현 시나리오**: 사용자가 Settings에서 "새 장소 추가" 토글을 꺼도, 팀원이 장소를 추가하면 `PlaceServiceImpl.add()` → `notifyOtherMembers(..., "place", ...)` → `NotificationServiceImpl.create(..., "place", ...)`가 설정값을 확인하지 않고 그대로 INSERT합니다 — **"설정이 꺼져 있어도 알림이 계속 옴" 사용자 체감 버그가 실제로 존재합니다.**

**추가로 발견한 설계 공백(설정-알림 매핑 자체의 불완전성)**: `grep`으로 묶음 B가 실제로 생성하는 `type` 값은 `"member"`(TeamSpace), `"schedule"`(Event), `"place"`(Place), `"chat"`(Message) 4가지뿐입니다. 이를 설정 컬럼(`newPlace`/`scheduleChange`/`memberJoin`/`aiRecommend`)에 대응시키면 `place↔newPlace`, `schedule↔scheduleChange`, `member↔memberJoin`까지는 1:1로 깔끔하게 맞지만, (a) `aiRecommend` 설정에 대응하는 `"ai"` 타입 알림은 백엔드 어디에서도 생성되지 않아(AI 추천은 동기 API 응답이라 알림 자체가 발생하지 않음) **이 토글은 처음부터 아무것도 제어하지 않는 죽은 설정**이고, (b) `"chat"` 타입은 웹/모바일 설정 화면 UI(토글 4종: 새 장소/일정변경/멤버참여/AI추천)에 애초에 대응 항목이 없어 **사용자가 채팅 알림을 끌 수 있는 방법 자체가 UI에도 없습니다.** 이는 "설정값을 참조하지 않는다"는 문제와 별개로, 설정을 참조하도록 고치더라도 그 전에 매핑 설계(채팅 토글 추가 여부, AI 추천 토글 제거 또는 실제 트리거 연결)가 먼저 필요하다는 뜻입니다.

**결론 — 묶음 C: 개별 커밋은 APPROVED, 전체 기능 완성도는 CHANGES REQUESTED**

7-a/7-b/7-c/7-d는 각자 지시받은 작업(마이그레이션/엔드포인트/웹 연동/모바일 화면)을 정확하고 안전하게 구현했습니다. 하지만 RESEARCH.md G1-3/G4-2가 지적한 원래 문제("알림 설정이 사용자에게 아무 효과가 없다")는 "저장이 안 됨" 증상만 고쳐졌을 뿐, "설정을 꺼도 알림이 계속 온다"는 더 근본적인 체감 문제는 그대로 남아 있습니다. **권장 후속 작업**(새 서브태스크로 플래너가 TASKS.md에 추가 필요): `NotificationServiceImpl.create()`가 INSERT 전에 `notificationSettingsMapper.findByUserId(userId)`를 조회해 `type`에 대응하는 컬럼이 `false`면 삽입을 건너뛰도록 수정 — 단, 그 전에 (a) `"chat"` 알림을 설정으로 제어할지(설정 컬럼/UI 토글 추가 필요) (b) `aiRecommend` 토글을 제거할지 또는 실제 AI 추천 알림 생성 로직을 추가할지를 먼저 결정해야 합니다. 이 커밋 4건을 되돌릴 필요는 없고(기반 작업으로는 유효함), 위 후속 작업이 완료되어야 "알림 설정" 기능이 사용자에게 실질적 효과를 갖습니다.

---

## 재검토 결과 (2026-11-06, 커밋 1c8d1b9 — [7-e])

워커가 위 "권장 후속 작업"을 **[7-e]** 서브태스크(커밋 1c8d1b9)로 구현. `NotificationServiceImpl.create()` 본문 맨 앞에 `isSuppressedByUserSettings(userId, type)` 체크를 추가해 `true`면 INSERT 없이 즉시 `return`. `apps/api-spring`에서 `mvn -o compile` 재실행해 클린 컴파일 확인.

**요청하신 3가지 항목을 현재 소스(`NotificationServiceImpl.java` 62~99줄)로 직접 확인:**

1. **member/schedule/place만 설정을 체크하는지**: `isSuppressedByUserSettings`의 첫 줄이 `if (!"member".equals(type) && !"schedule".equals(type) && !"place".equals(type)) return false;`로, 이 세 타입이 아니면 설정 조회 자체를 하지 않고 즉시 "차단 안 함"을 반환함. 세 타입에 대해서만 `switch (type) { case "member" -> !settings.isMemberJoin(); case "schedule" -> !settings.isScheduleChange(); case "place" -> !settings.isNewPlace(); }`로 각각 대응 컬럼을 확인 — `member↔memberJoin`, `schedule↔scheduleChange`, `place↔newPlace` 매핑이 정확함(앞서 리뷰에서 추론한 매핑과 일치). 확인됨.
2. **chat은 항상 생성되는지**: `"chat"`은 위 세 타입에 포함되지 않으므로 `isSuppressedByUserSettings`가 타입 분기 이전에 바로 `false`를 반환 — `notificationSettingsMapper`를 조회하지도 않고 무조건 생성으로 이어짐. `MessageServiceImpl.send()`의 호출부도 그대로(변경 없음) 확인. **의도대로 chat은 항상 생성됨.**
3. **aiRecommend를 건드리지 않았는지**: `create()`/`isSuppressedByUserSettings` 어디에도 `aiRecommend`/`isAiRecommend()` 참조가 없음(grep 결과 0건) — 이전 리뷰에서 지적한 "대응 알림이 없는 죽은 설정" 상태를 그대로 두고 손대지 않음. `getSettings`/`updateSettings`(7-b)의 `aiRecommend` 조회·저장 자체는 당연히 그대로 동작(설정값 저장/조회 기능은 멀쩍 — 단지 알림 생성과 연결되지 않았을 뿐). 확인됨.

**설정 없는 사용자(최초 상태, DB row 없음)의 기본값 처리**: `notificationSettingsMapper.findByUserId(userId).orElse(null)` 후 `if (settings == null) return false;`(차단 안 함, 즉 생성) — **직접 수치로 대조**: V9 마이그레이션의 컬럼 기본값(`new_place`/`schedule_change`/`member_join DEFAULT true`)과 7-b `getSettings()`의 `orElseGet` 기본 객체(`newPlace(true)`, `scheduleChange(true)`, `memberJoin(true)`)가 `isSuppressedByUserSettings`의 세 타입 전부와 정확히 일치(세 컬럼 모두 기본값 `true` → "꺼짐"이 아니므로 차단하지 않음이 옳은 동작). 즉 **"설정 행이 없다고 알림이 막히는" 문제는 없으며, 설정 화면에서 보여주는 기본값(토글 ON)과 실제 알림 생성 동작이 일치**함. (참고: `aiRecommend`는 기본값이 `false`이지만 이 메서드가 `aiRecommend`를 다루지 않으므로 이 사례와 무관.)

**부가 확인**: `isSuppressedByUserSettings` 호출이 `create()`의 `try` 블록 안쪽에 있어, 설정 조회 중 예외가 나더라도 6-a에서 확립한 best-effort 보장(예외가 호출자의 본 작업으로 전파되지 않음)이 그대로 유지됨. 커밋 메시지에 명시된 "멤버 수만큼 매번 조회(최적화 안 함)"는 성능보다 정확성을 우선한 의도적 선택이며, 여행 팀스페이스의 통상적 멤버 규모를 고려하면 즉시 문제가 될 수준은 아님(이전 리뷰의 N+1 참고사항과 동일한 결론) — blocking 아님.

**종합 — 묶음 C: APPROVED로 최종 재분류**

- [7-a] 92f2738: **APPROVED**
- [7-b] 86b639d: **APPROVED**
- [7-c] 998dcf0: **APPROVED**
- [7-d] 49dbf26: **APPROVED**
- [7-e] 1c8d1b9: **APPROVED** — 이전 재검토에서 지적한 "설정을 꺼도 알림이 계속 옴" 문제가 정확한 타입별 매핑과 안전한 기본값 처리로 해소됨.

이전에 기록한 CHANGES REQUESTED와 그 근거(매핑 공백 포함)는 위에 그대로 남겨두고, 이 섹션을 재검토 결과로 추가함. 묶음 A/B/C 전체 APPROVED — 완료보고 단계로 진행 가능.

---

# 묶음 A (2차 사이클) — 전면 UI 동작 검토 "프런트 단독 빠른 승리" [1]~[8] (2026-11-06)

검토 기준: `.team/RESEARCH.md` "## H. 전면 UI 동작 재조사" 섹션(H3-1~H3-14)과 `.team/TASKS.md` "4. 개발 > 묶음 A" 설명. `apps/web`에서 `npx tsc --noEmit` 직접 실행(8개 커밋 전체 반영된 HEAD 기준) — 클린. `git diff --stat`으로 전체 범위에 `apps/api-spring`/`apps/mobile` 파일이 전혀 없음을 확인(묶음 A "백엔드 변경 없음" 전제와 일치).

## [1] H3-6 — 검색창 4곳 실연동 (31ed1e2)

**APPROVED**

- `DashboardScreen`/`CalendarScreen`/`TravelMapScreen`은 각자 화면에 맞는 로컬 필터링(일정 제목/장소 이름)으로 연결, `AiScreen.tsx`의 기존 동작 패턴과 동일한 `value`/`onChange` 방식.
- `DashboardLayout`(공유 GNB, 자체 데이터 없음)은 Enter 제출 시 `/dashboard/travel?q=...`로 이동하고, `TravelMapScreen`이 마운트 시 URL `q` 파라미터를 읽어 검색어를 프리필 — 지시 대상 4개 파일 모두 실질적으로 "검색이 동작"하게 됨. TASKS.md가 "화면마다 검색 대상이 달라 개별 구현 필요"라고 명시한 전제와 정확히 일치하는 접근.
- 백엔드 호출 없이 클라이언트 필터링만 사용 — 묶음 A 제약과 일치.

## [2] H3-2 — "여행 드롭다운" 스페이스 전환 연결 (cba9171)

**APPROVED** — 단, 질문의 전제 정정 필요

질문에서 "워커가 범위를 `DashboardScreen.tsx`로만 엄격히 좁혔다"고 들으셨다고 하셨는데, **실제 커밋과 `.team/LOG.md` 48번째 줄 기록은 정반대입니다.** 워커는 작업 중 TASKS.md가 가리키는 "전역 `store/space.ts`(D1 신설)"가 실제로는 모바일 전용 zustand store이고 웹에는 대응하는 전역 상태가 없다는 스코프 충돌을 발견했고, 이를 **사용자에게 직접 확인**해 "`DashboardLayout.tsx`+`DashboardScreen.tsx` 2개만 고치면 `DashboardLayout`을 쓰는 5개 화면(Ai/Chat/Member/Notification/Settings)은 전환 UI만 생기고 데이터는 안 바뀌는 반쪽 기능이 된다"는 문제를 보고 → **사용자가 범위를 "5개 화면도 포함해 전역 선택 상태를 완전히 연동"으로 확장 승인**한 뒤 진행된 것으로 LOG.md에 기록되어 있습니다. 실제 diff도 이와 일치 — `DashboardLayout.tsx`(드롭다운 팝오버 UI 자체), `DashboardScreen.tsx`, 그리고 `AiScreen`/`ChatScreen`/`MemberScreen`/`NotificationScreen`/`SettingsScreen` 5개 파일 전부가 수정되었고, 신규 `apps/web/src/lib/space.ts`(localStorage 기반)까지 추가됨. **"DashboardLayout.tsx는 전역 상태 부재로 범위 밖"이라는 판단은 이 커밋에는 해당하지 않습니다** — DashboardLayout.tsx는 범위에 포함되어 실제로 수정되었습니다.
- **TASKS.md 지시와 충돌 여부**: 없음. TASKS.md는 애초에 `DashboardLayout.tsx:65`와 `DashboardScreen.tsx:551` **둘 다** 대상으로 명시했고, "기존 SpaceSwitcher.tsx 재사용 가능 여부 먼저 확인"도 지시대로 수행(확인 결과 "다른 구조의 풀 사이드바 컴포넌트"라 재사용 불가 판단 — `SpaceSwitcher.tsx`를 직접 열어 대조한 결과 실제로 사이드바 전체를 감싸는 별도 구조이고 현재 어디서도 import되지 않는 죽은 코드임을 확인, 판단이 정확함). "전역 store 갱신" 지시를 "웹에 맞는 동등한 전역 상태(localStorage 모듈)"로 해석해 구현한 것은 지시의 문자가 아니라 지시의 의도(여러 화면 간 선택 상태 공유)를 정확히 충족하는 합리적 해석이며, 이 해석 자체도 사용자 확인을 거쳤습니다.
- **DashboardScreen에서 전환이 완전히 동작하는지**: 코드로 확인 — `handleSelectSpace`가 `setSelectedSpaceId`(화면 상태) + `persistSelectedSpaceId`(localStorage) + 메뉴 닫기를 모두 수행. 기존 URL 딥링크(`?space=` 파라미터) 우선순위도 깨지지 않음(`found ?? pickSpace(converted) ?? converted[0]` — paramId 우선, 없으면 localStorage, 없으면 첫 스페이스로 안전한 폴백 체인). "최근 본 여행" 리스트와 "새 스페이스 생성" 흐름도 동일한 `handleSelectSpace`/헬퍼로 통일돼 일관됨.
- **5개 화면으로의 전파까지 확인**: 각 화면이 `listTeamSpaces` 전체 결과를 `spaces` state로 보관하고, 최초 로드 시 `pickSpace(res.data)`(localStorage 우선)로 초기 스페이스를 선택하며, `DashboardLayout`의 드롭다운에서 다른 스페이스를 고르면 각 화면의 `handleSelectSpace`가 해당 화면의 의존 데이터(AiScreen: `listPlaces`, ChatScreen: `spaceId`→메시지 재조회, MemberScreen: `members`, 등)를 다시 불러옴 — 단순 UI 전환이 아니라 실제 데이터까지 갱신됨을 5개 파일 모두에서 확인.
- 결론: 질문의 전제("DashboardScreen.tsx로만 좁혔다")는 사실과 다르며, 실제로는 **더 넓은, 사용자 승인을 거친 범위**로 구현되어 TASKS.md의 원래 의도(크로스 페이지 전환 유지)를 제대로 달성했습니다.

## [3] H3-1 — AI 추천 "추가" 버튼 실동작 (3ffeb28)

**APPROVED**

- **실패 시 "담김" 상태 롤백 여부 — 통과**: 낙관적 업데이트를 전혀 쓰지 않는 방식으로 구현됨 — `handleAddRec`(모달 내부)은 `addingIds`에 추가해 "추가 중…" 표시만 하고, 실제 `added`(초록 "추가됨") state는 `onAddRec(rec.title)`이 `true`를 반환한 **이후에만** 갱신됨. 실패(`false` 반환) 시 `addingIds`에서만 제거되고 `added`에는 추가되지 않아 버튼이 원래의 "+ 내 여행지 추가" 상태로 정확히 돌아가며, `addError` 메시지("장소 추가에 실패했습니다.")가 노출됨. "롤백할 낙관적 상태 자체가 없는" 더 안전한 설계로, 질문이 우려한 "실패했는데도 담김으로 남는" 케이스가 발생할 수 없음을 코드로 확인.
- 바깥쪽 `AiScreen.handleAddRec`도 `addPlace` 호출 후 `res.success && res.data`일 때만 `true` 반환, 그 외(실패 응답/예외) 전부 `false` 반환 — 성공 조건이 엄격함.
- 중복 클릭 방지(`addingIds`/`added` 포함 여부로 얼리 리턴), 버튼 `disabled` 처리도 함께 확인. 백엔드 변경 없이 기존 `addPlace` API 재사용 — 범위 이탈 없음.

## [4] H3-3 — 알림 벨 아이콘 onClick 연결 (3c9eb09)

**APPROVED** — `DashboardScreen.tsx`의 벨 아이콘에 `router.push("/dashboard/notification")` 한 줄 추가. 지시사항(연결, 아이콘 제거 아님)과 정확히 일치, 사이드바 알림 메뉴와 기능이 중복되는 점도 커밋 메시지에 명시적으로 인지·설명됨.

## [5] H3-9 — 가입일 하드코딩 제거 (7c1e50c)

**APPROVED** — `getProfile().createdAt`(ISO 날짜 문자열, 백엔드 `UserProfile.createdAt` 필드 실제 존재 확인)을 `slice(0,10).replaceAll("-", ".")`로 변환해 바인딩. 하드코딩 문자열 완전히 제거.

## [6] H3-12 — 랜딩 CTA 연결 (0d17451)

**APPROVED** — `<button>`을 `#features` 앵커로 이동하는 `<a>`로 교체, 대상 섹션에 `id="features"` 추가. 가장 단순한 해결책(라우팅/스크롤 로직 없이 네이티브 앵커)으로 과하게 구현하지 않음.

## [7] H3-4 — "더보기"류 링크 4개 라우팅 연결 (2b22bf4)

**APPROVED** — `ScheduleTimeline`/`AiRecommendSection`/`MemberStatus`/`ActivityPanel` 4개 하위 컴포넌트에 각각 `useRouter()`를 추가(같은 "use client" 파일 내부라 가능함을 직접 확인)해 TASKS.md가 지정한 이동 대상(calendar/travel/member/notification)과 정확히 일치하게 연결.

## [8] H3-13 — 지도 마커 팝업 "자세히보기" 연결 + 최소 장소 상세 모달 (24b96ec)

**APPROVED**

- **최소 구현 여부 — 통과**: 신규 `TravelPlaceDetailModal.tsx`(57줄)는 이름/주소/운영시간과 태그 배지, 닫기 버튼만 있는 순수 표시 모달 — API 호출, 편집, "비슷한 장소" 섹션 등 전혀 없음. 커밋 메시지가 명시한 "비슷한 장소 추천/정보 보완/지도 카드 등은 범위 밖"이 실제 코드로 정확히 지켜짐(AiScreen의 기존 `PlaceDetailModal`과 비교해도 훨씬 가벼움).
- 마커 데이터가 실제 장소 API가 아닌 하드코딩된 데모 2개(jazz/cafe)라는 **선행 문제를 발견했지만 고치지 않고 범위 밖으로 명시**(마커에 표시용 필드만 추가) — 백엔드 연동까지 손댔다면 범위가 크게 벌어졌을 지점인데 정확히 거기서 멈춤. 이번 사이클이 묶음 A("백엔드 변경 없음")라는 제약과도 일치하는 올바른 판단.
- `place` prop을 받기 전에는 `TravelMapMarkerPopup`이 클릭한 마커와 무관하게 항상 "성수 재즈 페스티벌" 고정 텍스트를 보여주는 기존 버그가 있었는데, 이번 변경으로 `place.name`/`tag`/`address`/`hours`를 실제로 바인딩하면서 자연히 해소됨 — "자세히보기"를 올바른 장소로 연결하려면 선행되어야 하는 필수 보정이라 범위 이탈이 아님.
- `MapMarkerPlace` 콜백 체인(`TravelMapMarkerPopup` → `TravelMapView` → `TravelMapScreen`)이 깨짐 없이 연결됨을 직접 추적, `grep`으로 `TravelMapView`/`TravelMapMarkerPopup`의 소비자가 `TravelMapScreen.tsx` 단 하나뿐임을 확인해 사이드이펙트(다른 화면에서 깨지는 사례) 없음.

## 묶음 A (2차 사이클) 종합

8건 전부 **APPROVED**. 공통 확인: 전 범위에 `apps/api-spring`/`apps/mobile` 파일 변경이 0건(묶음 A "프런트 단독" 제약 준수), `npx tsc --noEmit`(apps/web, 8개 커밋 전체 반영) 클린, 각 항목이 TASKS.md가 지정한 파일/방향을 벗어나지 않음. 특히 [2]는 질문의 전제와 달리 사용자 승인을 받아 범위를 확장한 더 완전한 구현이었고, [3]은 낙관적 업데이트 없이 성공 확정 후에만 상태를 바꾸는 방식으로 롤백 문제 자체를 설계로 회피했으며, [8]은 발견한 선행 이슈(하드코딩 마커 데이터)를 명시적으로 범위 밖에 두고 최소 모달만 신설해 과확장을 피함. CHANGES REQUESTED 없음.

---

# 묶음 B (2차 사이클) — 저장/삭제 연동 + 플랫폼 격차 [9]~[11] (2026-11-06)

검토 기준: `.team/RESEARCH.md` "## H." 섹션(H3-7/H3-5/H3-14)과 `.team/TASKS.md` "묶음 B" 설명. `apps/web`·`apps/mobile`에서 `npx tsc --noEmit` 직접 실행(클린, 모바일은 기존 사전 존재 오류 4건만 남고 신규 없음). `git diff --stat`로 묶음 B 전체 범위에 `apps/api-spring` 변경이 0건임을 확인(세 항목 모두 "백엔드 API 이미 있음" 전제와 일치).

## [9] H3-7 — SettingsScreen "여행 스페이스" 탭 실연동 (c3f1291)

**APPROVED**

- **(1) 실제 API 호출 여부 — 통과**: `handleSaveSpace`가 `updateTeamSpace(spaceId, {name, emoji, bgColor}, token)`을 실제로 호출(성공 시 `spaceName`/`spaceEmoji`/`spaces` 목록까지 갱신), `handleDeleteSpace`가 `deleteTeamSpace(spaceId, token)`을 실제로 호출. 둘 다 콘솔 로그나 로컬 state만 바꾸는 가짜 동작이 아님을 코드로 확인.
- **(1) 삭제 확인 절차 — 통과**: `handleDeleteSpace` 진입점에 `window.confirm(\`"${selectedSpace.name}" 스페이스를 삭제할까요? 이 작업은 되돌릴 수 없습니다.\`)` 가드가 있어, 확인을 누르지 않으면 API 호출 자체가 일어나지 않음.
- **(1) 삭제 권한(오너만) 서버/클라이언트 양쪽 — 통과**: 클라이언트는 `isSpaceOwner`(`selectedSpace.members.find(role==="owner").username === username`) 체크로 비오너에게는 입력창을 `disabled`로, 저장/삭제 버튼 자체를 렌더링하지 않고 "소유자만 할 수 있어요" 안내문만 보여줌(기존 `MemberScreen.tsx`의 owner 판별 패턴과 동일). 서버 측은 이전 사이클 리뷰에서 이미 확인한 대로 `TeamSpaceServiceImpl.update`/`delete` 양쪽 모두 `checkOwner(space, user.getId())`를 호출함(재확인 완료) — 클라이언트 가드를 우회해 API를 직접 호출해도 서버가 최종 방어. 양쪽 다 막혀 있음.
- 삭제 성공 후 남은 스페이스 중 첫 번째로 자동 전환(`handleSelectSpace(remaining[0].id)`), 전부 삭제된 경우 "여행 없음" 상태로 복귀 — 참고로 이 "전부 삭제" 분기에서는 `lib/space.ts`의 localStorage 값을 명시적으로 지우지 않는데, 이후 새 스페이스가 생성되면 `pickSpace`가 그 값을 찾지 못해 자연히 `spaces[0]`로 폴백하므로 실질적 영향은 없음(참고 기록, blocking 아님).

## [10] H3-5 — 스페이스 설정 기어 아이콘 연결 (fd686bd)

**APPROVED**

- **(2) [9]로의 정확한 연결 — 통과**: `TravelHeroCard`의 기어 아이콘이 `/dashboard/settings?tab=space`로 라우팅, `SettingsScreen`(정확히는 신설된 `SettingsInner`)이 `useSearchParams().get("tab")`을 `TABS.some((t) => t.key === tabParam)`으로 검증 후 초기 `activeTab`으로 사용 — 안전하지 않은 캐스팅 없이 유효하지 않은 값은 "profile"로 폴백. [9]에서 완성된 "여행 스페이스" 탭으로 정확히 열림.
- `useSearchParams` 사용을 위해 `SettingsScreen`을 `Suspense`로 감싸는 `SettingsInner`/`SettingsScreen` 분리 패턴이 같은 파일의 `DashboardScreen`의 기존 `DashboardInner`/`DashboardScreen` 분리(838~842줄)와 정확히 동일함을 직접 대조 확인 — 신규 패턴 도입 아님.
- 커밋 메시지에 `npm run build` 정적 생성까지 확인했다는 기록 — Next.js의 `useSearchParams` 없는 Suspense 누락은 보통 `tsc`가 아니라 프로덕션 빌드 시에만 드러나는 문제라, 일반적인 `tsc --noEmit` 체크보다 더 엄격한 검증을 거쳤음.

## [11] H3-14 — 모바일 알림 읽음/삭제 기능 연결 (c13746d)

**APPROVED**

- **(3) 웹과 동등하게 동작하는지 — 통과(일부는 웹을 상회)**: 웹 `NotificationScreen.tsx`를 직접 열어 대조 — 웹은 `markAsRead`만 쓰고(70번째 줄 근처 `handleRead`/`handleReadAll`) **`deleteNotification` import 자체가 없어 삭제 기능이 원래 존재하지 않음**을 확인, 커밋 메시지의 "웹에는 애초에 삭제 기능이 없었다"는 주장이 정확함. 모바일은 TASKS.md가 명시한 대로 `markAsRead`/`deleteNotification` **둘 다** 연결해 읽음 처리는 웹과 동등, 삭제는 웹에 없는 기능까지 추가로 제공.
- 읽음 처리 안전성은 웹보다 더 견고함 — 웹 `handleRead`는 API 실패 시에도 그냥 `console.error`만 하고 로컬 state는 무조건 읽음으로 바꿔버리는 반면(롤백 없음, 직접 코드 대조로 확인), 모바일 `useMarkNotificationRead`는 `qc.getQueryData`로 스냅샷 후 실패 시 `qc.setQueryData(KEY, previous)`로 완전히 복원 + `toast.error`.
- **(3) 기존 모바일 패턴과의 일관성 — 통과**: `useMarkNotificationRead`/`useDeleteNotification`을 `apps/mobile/src/hooks/useTodos.ts`의 `useToggleTodo`/`useDeleteTodo`와 직접 라인 단위로 대조 — 토글류는 "낙관적 업데이트 → 실패 시 복원 + toast.error", 삭제류는 "API 호출 성공 후에만 캐시에서 제거, 실패 시 toast.error만(롤백할 낙관적 상태 자체가 없음)" 패턴이 정확히 동일함. 삭제 확인 `Alert.alert("알림 삭제", ..., [{text:"취소"}, {text:"삭제", style:"destructive"}])`도 이전 사이클에서 확인한 `SpaceSettingsModal.handleDelete`와 동일한 컨펌 패턴.
- **스와이프 미구현 판단 검증**: `apps/mobile/package.json`과 전체 소스를 직접 grep — `react-native-gesture-handler`/`Swipeable` 참조가 0건으로, 레포에 스와이프 액션 구현 사례 자체가 없다는 커밋 메시지 주장이 정확함. "탭으로 읽음 + 버튼으로 삭제"는 신규 의존성 추가 없이 TASKS.md의 "탭/스와이프 핸들러"(둘 중 하나로 해석 가능) 요구를 충족하는 합리적 축소이며, 비교할 기존 스와이프 패턴이 없으니 "일관성 위반"도 아님.
- `npx tsc --noEmit`(apps/mobile) 결과 기존 사전 존재 오류 4건(FAB.tsx/SignupScreen.tsx/TravelScreen.tsx)만 남고 신규 오류 없음. 백엔드 변경 없음(기존 wrapper 재사용) — 범위 이탈 없음.

## 묶음 B (2차 사이클) 종합

3건 전부 **APPROVED**. [9]는 실제 저장/삭제 API 호출, 삭제 전 확인 절차, 오너 전용 권한을 클라이언트·서버 양쪽에서 직접 확인했고, [10]은 [9]로의 라우팅이 정확하며 기존 `Suspense` 분리 패턴을 그대로 재사용, [11]은 모바일이 웹과 동등(읽음)하거나 그 이상(삭제, 롤백 안전성)으로 동작하고 스와이프를 구현하지 않은 판단도 레포에 전례가 없다는 사실 확인으로 뒷받침됨. 세 항목 모두 백엔드 변경 없이 기존 API/패턴만 재사용 — 범위 이탈 없음. CHANGES REQUESTED 없음.

---

# 묶음 C (2차 사이클) — 채팅 알림 토글 [12] (DB+백엔드+웹+모바일, 단일 커밋) (2026-11-06)

검토 기준: `.team/RESEARCH.md` "## H." 섹션("설정-알림 chat" — 메커니즘은 있으나 토글 UI 부재)과 `.team/TASKS.md` "묶음 C" 설명(V10 마이그레이션 + `isSuppressedByUserSettings` chat 케이스 + 설정 응답 확장 + 웹/모바일 토글 UI). 단일 커밋(584ab7d, 10개 파일)을 전부 직접 읽고, `apps/api-spring`에서 `mvn -o compile`, `apps/web`·`apps/mobile`에서 `npx tsc --noEmit` 재실행해 교차검증 — 전부 클린(모바일 사전 존재 오류 4건은 무관함 재확인).

## (1) V10 마이그레이션 — V9 스타일 일치 + 안전한 ALTER

**통과**. `V10__add_chat_notification_setting.sql`:
```sql
-- 채팅 알림 설정 컬럼 추가
ALTER TABLE notification_settings
    ADD COLUMN IF NOT EXISTS chat BOOLEAN NOT NULL DEFAULT true;
```
한글 주석 한 줄 + `BOOLEAN NOT NULL DEFAULT true`(V9의 `new_place`/`schedule_change`/`member_join` 컬럼과 타입·대소문자 표기까지 동일) 스타일을 그대로 따름. `ADD COLUMN IF NOT EXISTS`는 V1~V9의 `CREATE TABLE IF NOT EXISTS`와 같은 "멱등성" 관례를 컬럼 단위로 확장한 것 — `grep -l "ALTER TABLE" db/migration/*.sql` 결과 V10이 이 레포 최초의 ALTER이지만(V1~V9는 전부 신규 테이블 생성만 필요했을 뿐), 기존 관례에서 벗어난 임의 스타일이 아니라 동일 원칙의 자연스러운 확장. PostgreSQL에서 `DEFAULT` 있는 `NOT NULL` 컬럼 추가는 테이블 재작성 없이 기존 행에도 기본값이 채워지는 안전한 연산이라 기존 데이터와 충돌 없음.

## (2) `isSuppressedByUserSettings` — chat 케이스 추가가 기존 로직을 깨지 않는지

**통과**. diff를 라인 단위로 대조 — 기존 `member`/`schedule`/`place` 세 `case`는 **문자 하나도 바뀌지 않음**. 변경은 정확히 두 곳뿐: ① 최초 가드문의 OR 조건에 `&& !"chat".equals(type)` 추가(기존 세 타입을 걸러내는 조건은 그대로 유지된 채 조건이 하나 더 늘어난 것 — 기존 타입의 통과 여부에 영향 없음), ② `switch` 끝에 `case "chat" -> !settings.isChat();` 신규 추가(독립된 분기라 다른 분기와 상호작용 없음). `default -> false`도 그대로 유지. 구조적으로 기존 3개 타입의 동작이 회귀할 여지가 없음을 확인.

## (3) 설정 없는 사용자(row 없음)의 chat 기본값 처리 — 기존 패턴과 일관성

**통과**. `isSuppressedByUserSettings`의 `NotificationSettings settings = ...orElse(null); if (settings == null) return false;` 가드는 **chat을 포함한 네 타입 전체가 공유하는 단일 코드 경로**(타입별로 분기되지 않음) — 지난 리뷰에서 확인한 "행이 없으면 차단 안 함" 패턴이 chat에도 자동으로 동일하게 적용됨. 추가로 `getSettings()`의 `orElseGet` 기본 응답 객체에도 `.chat(true)`가 추가되어, DB 컬럼 기본값(`DEFAULT true`)·서비스 기본 응답(`chat(true)`)·억제 로직의 "null이면 차단 안 함" 세 지점이 전부 "기본 ON"으로 일치함을 직접 대조 확인(member/schedule/place가 이미 이 3중 일치를 가지고 있었고, chat도 동일하게 확장됨).

## (4) 웹/모바일 토글 UI — 실제 저장 호출 + 새로고침 후 유지

**통과**. 웹 `SettingsScreen.tsx`의 `handleToggleNotifSetting(key: keyof NotificationSettingsResponse)`와 모바일 `NotificationSettingsModal.tsx`의 `handleToggle(key: keyof NotificationSettingsResponse)`는 **이번 커밋에서 전혀 수정되지 않음** — 둘 다 이미 타입 전체에 대해 제네릭하게 동작하도록 지난 사이클에 구현되어 있어서, `chat` 필드를 인터페이스(`NotificationSettingsResponse`)에 추가하고 화면의 토글 목록 배열에 항목 하나(`{key: "chat", ...}`)만 추가하는 것으로 자동으로 저장/조회 흐름에 편입됨을 코드로 확인 — 새로운 특수 처리 코드가 필요 없는 설계. 웹의 토글 목록은 커밋 이전에도 JSX 내부 인라인 배열 리터럴이었음을 직접 대조해, 이번 변경이 새 패턴을 도입한 게 아니라 기존 패턴에 항목만 추가했음을 확인. 마운트 시 `getNotificationSettings` 호출(변경 없음)이 백엔드의 실제 `chat` 값을 가져오므로, 새로고침(모바일은 모달 재오픈) 후에도 저장된 값이 유지됨 — 지난 사이클에 이미 검증된 GET/PUT 흐름 그대로 재사용.

## (5) 범위 이탈 여부

**통과**. 변경된 10개 파일이 전부 TASKS.md가 명시한 대상과 정확히 일치: 백엔드(`NotificationServiceImpl`/DTO 2개/모델/마이그레이션/매퍼 XML), 웹(`domains/notification/api.ts`, `SettingsScreen.tsx`), 모바일(`domains/notification/api.ts`, `NotificationSettingsModal.tsx`). `NotificationController`는 건드리지 않음(이미 범용 DTO를 그대로 주고받는 구조라 수정 불필요 — 실제로 diff에 없음을 확인). 토글 배치 위치("멤버 참여와 AI 추천 사이")는 UI 문구 순서일 뿐 기능에 영향 없는 선택.

## 묶음 C (2차 사이클) 종합

**5개 관점 전부 통과 — APPROVED**. 가장 중요하게 확인한 지점은 (2)(3): 기존 3개 알림 타입의 동작을 조금도 건드리지 않으면서 chat을 추가했고("행이 없으면 차단 안 함" 공유 가드 덕분에 자동으로 일관성 확보), DB 기본값·서비스 기본 응답·억제 로직 3곳이 전부 "기본 ON"으로 정합함을 직접 대조했습니다. 마이그레이션은 이 레포 최초의 `ALTER TABLE`이지만 기존 `IF NOT EXISTS` 관례의 자연스러운 확장이며 PostgreSQL 안전성 측면에서도 문제 없습니다. 웹/모바일 토글은 지난 사이클에 이미 구축된 제네릭 저장/조회 로직에 항목만 추가하는 최소 변경으로 구현되어, 새로고침 후에도 값이 유지됩니다. CHANGES REQUESTED 없음.

---

# 묶음 D (2차 사이클) — 프로필 사진 업로드 [13] (DB+백엔드+웹+모바일, 단일 커밋) (2026-11-06)

검토 기준: `.team/RESEARCH.md` H3-8과 `.team/TASKS.md` "묶음 D" 설명(사용자 승인: DB base64 저장 방식). 단일 커밋(d16e69f, 17개 파일) 전체를 직접 읽고 `apps/api-spring`에서 `mvn -o compile`, `apps/web`·`apps/mobile`에서 `npx tsc --noEmit` 재실행 — 전부 클린(모바일 사전 존재 오류 4건 무관함 재확인). 요청받은 5가지 관점 중 **(2)와 (3)에서 실질적인 문제를 확인**했습니다 — 아래에 근거와 함께 기록합니다.

## (1) 용량 제한 — 서버/클라이언트 양쪽

**통과**. 서버: `UserServiceImpl.updateAvatar`가 base64 **디코딩 후**(`Base64.getDecoder().decode(...)`) 실제 바이트 길이(`decoded.length`)를 `MAX_AVATAR_BYTES`(2MB)와 비교 — base64 문자열 길이로 어림(약 33% 과대추정)하지 않고 정확한 원본 바이트 수로 검사하는 올바른 방식. 클라이언트: 웹은 `file.size > MAX_AVATAR_BYTES`(선택한 `File` 객체의 실제 바이트 크기)로 업로드 전 차단, 모바일은 `estimatedBytes = Math.ceil((base64.length * 3) / 4)`로 base64 인코딩 전 크기를 추정해 사전 차단. 양쪽 모두 2MB로 서버와 일치. (참고로 Spring Boot 기본 설정에는 HTTP 요청 본문 자체의 크기 제한이 따로 걸려있지 않아, 악의적으로 2MB를 훨씬 초과하는 요청을 보내면 애플리케이션 레벨 체크 전에 요청 본문이 메모리에 전부 역직렬화되는 지점은 남아있음 — 다만 이는 이번 항목이 명시적으로 요구한 "논리적 2MB 상한"의 범위를 넘어서는 인프라 레벨 경량화 사항이라 blocking으로 보지 않고 참고로만 기록.)

## (2) base64가 모든 프로필 조회(getProfile)에 항상 포함되는지 — **문제 확인**

**지적하신 우려가 실제로 발생합니다.** 커밋 메시지는 "기존 findByUsername 등 핵심 조회에는 avatar를 포함하지 않아 로그인 등 매 요청마다 큰 blob을 불필요하게 끌고 다니지 않도록 분리"라고 설명하지만, 실제 코드를 읽으면 이 분리는 `User` 엔티티를 쓰는 **내부 경로**(인증 등)에만 적용되고, 사용자가 실제로 호출하는 `GET /api/user/profile`(`UserServiceImpl.getProfile`) 자체는 다음과 같이 **항상** avatar를 함께 가져와 응답에 포함시킵니다:
```java
public UserProfileResponse getProfile(String username) {
    User user = userMapper.findByUsername(username)...;
    String avatar = userMapper.findAvatarByUserId(user.getId()).orElse(null); // 별도 쿼리, 매번 실행
    return toResponse(user, avatar); // 응답에 항상 포함
}
```
그리고 `getProfile()`은 실제로 **아바타를 전혀 표시하지 않는 화면에서도 호출됩니다** — `grep`으로 호출부를 전수 확인한 결과:
- `apps/web/src/domains/calendar/components/CalendarScreen.tsx:88` — `planLabel`(Free/Pro 표시)만 쓰려고 `getProfile()`을 호출하는데, 이제 이 호출마다 최대 ~2.7MB(2MB 원본 + base64 ~33% 증가분) JSON 응답이 함께 내려옵니다. **캘린더 페이지를 열 때마다 아바타 없는 사용자는 영향 없지만, 아바타를 등록한 사용자는 캘린더를 열 때마다 불필요하게 수백KB~수MB를 받게 됩니다.**
- `apps/web/src/domains/dashboard/components/SettingsScreen.tsx:73`(프로필 탭에서 실제 표시 — 정당한 사용), `apps/mobile/src/hooks/useProfile.ts:9`(`ProfileScreen`에서만 쓰임 — 정당한 사용)는 실제로 아바타를 렌더링하므로 문제 없음.

즉 3개 호출부 중 1개(`CalendarScreen`)는 아바타가 전혀 필요 없는데도 매번 함께 받습니다 — 요청하신 "사진은 필요할 때만 별도로 가져오는 게 맞음" 원칙이 **적용되지 않은 호출부가 실제로 존재**합니다. 커밋 메시지의 최적화 설명은 사실이지만, 그 최적화가 보호하는 경로(내부 `User` 조회)와 실제 문제가 되는 경로(공개 REST 응답)가 다릅니다.

## (3) 이미지 형식 검증(실제 이미지 파일인지, 악성 파일 업로드 방지) — **미구현 확인**

**지적하신 우려가 실제로 발생합니다.** 서버(`UserServiceImpl.updateAvatar`)는 ① base64로 **디코딩 가능한지**, ② 디코딩된 바이트 수가 2MB 이하인지 — 이 두 가지만 검사합니다. **디코딩된 바이트가 실제로 이미지(JPEG/PNG/WebP 등) 데이터인지는 어디서도 검증하지 않습니다**(매직 바이트 확인, `ImageIO.read()` 등 이미지 디코딩 시도, MIME 화이트리스트 검증 전부 없음). base64로 인코딩 가능한 임의의 2MB 이하 바이너리는 전부 통과해 `users.avatar` 컬럼에 그대로 저장됩니다.
- 웹의 `accept="image/*"`(`<input type="file">`)는 운영체제 파일 선택 다이얼로그의 필터일 뿐인 클라이언트 전용 힌트로, 브라우저 devtools로 속성을 지우거나 **API를 직접 호출하면(JWT만 있으면 됨) 손쉽게 우회**됩니다.
- 모바일의 `ImagePicker.launchImageLibraryAsync({ mediaTypes: Images })`는 OS 수준에서 갤러리 선택 자체를 이미지로 제한해 웹보다는 더 신뢰할 수 있지만, 이 역시 **API를 직접 호출하면 동일하게 우회 가능** — 결국 서버가 유일한 신뢰 경계인데 거기엔 검증이 없음.
- 실제 악용 시나리오: 공격자가 유효한 JWT로 `PUT /api/user/avatar`에 임의의 2MB 이하 바이너리(이미지가 아닌 아무 파일)를 base64로 인코딩해 보내면 그대로 저장됨 — DB 저장공간 낭용/오염 벡터. 다만 현재 클라이언트가 이 값을 항상 `<img src={avatar}>`/`<Image source={{uri: profile.avatar}}>`로만 렌더링하므로(직접 대조 확인), 저장된 비(非)이미지 데이터가 스크립트 실행이나 XSS로 바로 이어지는 경로는 확인되지 않음 — **심각도는 "데이터 무결성/저장공간 오염" 수준으로 판단, RCE·XSS 수준의 긴급도는 아님**.

## (4) 웹/모바일 실제 반영 + 새로고침 후 유지

**통과**. 웹: 업로드 성공 시 `setAvatar(res.data.avatar ?? null)`로 즉시 반영, 마운트 시 `getProfile()`이 서버 값을 다시 가져오므로 새로고침 후에도 유지됨을 확인. 모바일: 업로드 성공 시 `qc.setQueryData(["profile"], res.data)`로 react-query 캐시를 직접 갱신(즉시 반영), 앱 재시작 시 `useProfile()`이 서버에서 다시 조회하므로 유지됨을 확인. 양쪽 모두 실제 DB 컬럼(`users.avatar`)에 저장되는 것이므로(로컬 state/캐시만의 변경이 아님) 다른 기기/세션에서도 반영됨.

## (5) 범위 이탈 여부

**통과**. 변경된 17개 파일이 TASKS.md가 예상한 범위(DB 마이그레이션, 백엔드 업로드 엔드포인트, `UserProfile` DTO 필드, 웹/모바일 업로드 UI)와 일치. `apps/mobile`에 `expo-image-picker` 신규 의존성이 추가되었으나(`package.json`/`package-lock.json`/`app.config.js`), TASKS.md 자체가 "기존 레포에 이미지 업로드 사례가 없어 신규 설계 필요"라고 명시했고 Expo 공식 모듈을 최소로 추가한 것이라 범위 이탈이 아님 — SDK54와 버전 호환성(`~17.0.11`)도 `package.json`에서 직접 확인.

## 묶음 D (2차 사이클) 종합

**(1)(4)(5)는 통과, (2)(3)은 CHANGES REQUESTED.** 커밋을 되돌릴 필요는 없습니다 — 핵심 구조(마이그레이션, 엔드포인트, 업로드 UI, 용량 제한, 양쪽 플랫폼 반영/영속성)는 정상 동작하며, 아래 두 가지는 **좁은 범위의 후속 수정**으로 해결 가능합니다.

- **권장 수정 (2)**: `getProfile()`의 응답에서 `avatar`를 빼거나(가장 단순), 혹은 `avatar`가 실제로 필요한 화면(프로필/설정 화면)만 호출하는 별도 엔드포인트(예: `GET /api/user/avatar`)를 신설하고 `UserProfileResponse.avatar`는 제거하는 것을 권장. 가장 적은 변경으로는 `CalendarScreen.tsx:88`의 `getProfile()` 호출이 `planLabel`만 쓴다는 점을 활용해, 백엔드에 플랜만 반환하는 경량 응답을 분리하거나, `avatar` 필드를 응답에서 빼고 프로필/설정 화면에서만 별도 조회하도록 바꾸는 선택지도 가능.
- **권장 수정 (3)**: `UserServiceImpl.updateAvatar`의 디코딩 직후에 매직 바이트 확인(JPEG `FF D8`, PNG `89 50 4E 47`, WebP `RIFF...WEBP` 등) 또는 `javax.imageio.ImageIO.read(new ByteArrayInputStream(decoded))`가 `null`을 반환하지 않는지 확인하는 간단한 검증을 추가하고, 실패 시 이미 존재하는 `INVALID_AVATAR_FORMAT` 에러코드로 응답(프런트는 이미 이 에러코드를 처리하는 분기가 있어 추가 프런트 변경 없이 바로 동작).

두 수정 모두 백엔드 한 메서드(`UserServiceImpl`) 안에서 끝나는 좁은 범위이고, 프런트 쪽은 변경이 필요 없거나(에러코드 처리 기존 로직 재사용) 최소한의 조정만 필요할 것으로 예상됩니다.

---

## 재검토 결과 (2026-11-06, 커밋 4e83b86)

워커가 CHANGES REQUESTED 2건을 커밋 **4e83b86**(12개 파일, 백엔드+웹+모바일)으로 수정. `apps/api-spring`에서 `mvn -o compile`, `apps/web`·`apps/mobile`에서 `npx tsc --noEmit` 재실행 — 전부 클린(모바일 사전 존재 오류 4건 무관함 재확인). `grep`으로 `profile?.avatar`/`profile.avatar`류 잔존 참조를 전체 코드베이스에서 재검색 — 남은 참조는 전부 신규 `AvatarResponse.avatar`(새 엔드포인트 응답)뿐, 구 `UserProfile.avatar` 참조는 0건.

### (2) avatar 분리 — 완전히 해소됨

코드로 직접 확인:
- `UserProfileResponse`에서 `avatar` 필드 **제거됨**(`private String avatar;` 라인이 삭제됨). `UserServiceImpl.getProfile()`은 더 이상 `findAvatarByUserId`를 호출하지 않고 `return toResponse(user);`만 수행 — avatar 조회 쿼리 자체가 이 경로에서 사라짐.
- 신규 `GET /api/user/avatar`(`UserService.getAvatar`) + 기존 `PUT /api/user/avatar`가 전용 `AvatarResponse{ avatar }`로 응답 — `avatar`가 필요한 화면만 명시적으로 이 엔드포인트를 호출.
- **`CalendarScreen.tsx:88`을 재확인** — 여전히 `getProfile(storedToken)`만 호출하고 `getAvatar`는 호출하지 않음(코드에 추가되지 않음, diff에도 해당 파일 없음) → 이제 백엔드 응답 자체에 avatar가 없으므로 이 호출은 더 이상 avatar 데이터를 전혀 받지 않음. **지적했던 "avatar가 불필요한 곳도 매번 큰 응답을 받는" 문제가 구조적으로 사라짐**(선택적으로 안 받는 것이 아니라, 애초에 해당 응답 스키마에 필드가 없음).
- 프로필/설정 화면(실제로 avatar를 렌더링하는 곳)만 `getAvatar()`를 추가로 호출하도록 전환: 웹 `SettingsScreen.tsx`(마운트 시 `getAvatar` 별도 호출), 모바일 `useAvatar()`(신규 React Query 훅, `queryKey: ["avatar"]`, `useProfile()`과 동일한 `staleTime`/`enabled` 패턴). `useProfileData.ts`가 두 쿼리를 합쳐 `avatar` 필드로 노출하고, `onRefresh`가 `Promise.all([profileQuery.refetch(), avatarQuery.refetch()])`로 둘 다 갱신 — 풀투리프레시 시 아바타도 함께 갱신됨을 확인.
- 업로드 성공 콜백(`qc.setQueryData(["profile"], ...)` → `qc.setQueryData(["avatar"], ...)`)이 새 쿼리 키로 정확히 갱신되도록 함께 바뀜 — 분리 리팩토링 중 흔히 놓치는 지점인데 정확히 맞춰져 있음을 확인.

### (3) 이미지 형식 검증 — 완전히 해소됨

`UserServiceImpl.isValidImage(byte[])`를 직접 읽어 매직 바이트 비교를 바이트 단위로 검증:
- JPEG: `FF D8 FF`(처음 3바이트) — 표준 JPEG 시그니처와 일치, 부호 있는 Java `byte`를 `& 0xFF`로 마스킹해 0x80 이상 값도 올바르게 비교(`0xFF`/`0xD8`가 전부 올바르게 마스킹됨).
- PNG: `89 50 4E 47 0D 0A 1A 0A`(8바이트 전체) — 표준 PNG 시그니처와 정확히 일치, `0x89`만 마스킹 필요하고 나머지는 128 미만이라 마스킹 없이도 안전(코드에서도 `0x89`만 마스킹 처리해 정확함).
- WebP: 0-3번째 바이트 `"RIFF"` + 8-11번째 바이트 `"WEBP"`(4-7번째 크기 필드는 건너뜀) — RIFF 컨테이너 포맷의 표준 구조와 일치.
- 호출 순서: `decoded.length > MAX_AVATAR_BYTES` 체크 → `isValidImage(decoded)` 체크 → `userMapper.updateAvatar(...)` — 검증이 저장 전에 선행됨. 실패 시 기존 `ErrorCode.INVALID_AVATAR_FORMAT`을 그대로 재사용(새 에러코드 추가 없음, 프런트 변경 없음 — 기존에 이미 이 에러코드를 처리하는 분기가 양쪽 클라이언트에 있었음을 이전 리뷰에서 이미 확인한 그대로 재사용됨).

### 기존 정상 업로드 흐름이 깨지지 않았는지

- 웹 `handleAvatarChange`(업로드 핸들러 자체)는 **이번 커밋에서 수정되지 않음** — `updateAvatar(dataUrl, token)` 호출 후 `res.data.avatar`로 상태를 갱신하는 코드가 그대로 남아있고, `updateAvatar()`의 반환 타입이 `UserProfile`→`AvatarResponse`로 바뀌었지만 둘 다 `avatar: string | null` 필드를 가지고 있어 `res.data.avatar` 접근이 타입 에러 없이 그대로 동작함을 `tsc` 결과로 확인.
- 모바일 업로드 핸들러(`handleEditAvatar`)는 캐시 키만 `["profile"]` → `["avatar"]`로 수정됨(분리 후 올바른 타겟) — 나머지 흐름(권한 요청 → `launchImageLibraryAsync` → 2MB 사전 체크 → `updateAvatar` 호출 → 에러코드 분기)은 그대로.
- 참고(비차단): 매직 바이트 검증이 JPEG/PNG/WebP 3종만 포괄하며 GIF/BMP/HEIC는 `INVALID_AVATAR_FORMAT`으로 거부됩니다. 이번 사이클에 새로 만들어진 기능이라 "기존에 되던 게 깨진" 사례는 아니고, 모바일은 `ImagePicker`의 `quality: 0.8` 옵션이 사실상 JPEG로 재인코딩하므로 영향이 없으며, 웹도 일반적인 사진(JPEG/PNG)이 압도적 다수라 실사용 영향은 낮음 — 다만 GIF 등을 올리는 소수 사용자가 있다면 추후 포맷 추가가 필요할 수 있다는 점만 참고로 기록.

### 종합 — 묶음 D: APPROVED로 재분류

- (1) 용량 제한: APPROVED(이전과 동일, 변경 없음)
- (2) avatar 분리: **APPROVED** — 재확인 결과 완전히 해소
- (3) 이미지 형식 검증: **APPROVED** — 재확인 결과 완전히 해소
- (4) 반영/영속성: APPROVED(이전과 동일, 이번 커밋으로 흐름이 바뀌었지만 재확인 결과 깨지지 않음)
- (5) 범위 이탈: APPROVED(12개 파일 전부 두 수정 사항에 정확히 대응, 추가 범위 이탈 없음)

이전에 기록한 CHANGES REQUESTED와 그 근거는 위에 그대로 남겨두고, 이 섹션을 재검토 결과로 추가함. **묶음 D 전체 APPROVED** — 이번 사이클(전면 UI 동작 검토+실구현) 묶음 A~D 전체 APPROVED, 완료보고 단계로 진행 가능.

---

# 긴급 버그수정 — Instagram 릴스 수집 Apify resultsType (커밋 1074429) (2026-11-09)

검토 기준: `.team/RESEARCH.md` "## J." 조사 결과와 `.team/LOG.md`에 기록된 워커의 수정 내역.

**(2) 범위 — APPROVED.** `git show 1074429`로 직접 diff 확인: `InstagramReelsCollector.java` 1개 파일, `"resultsType", "posts"` → `"resultsType", "reels"` 1줄 변경만 있음. 그 외 로직/파일 변경 없음.

**(1) 필드 파싱 영향 — 확인 필요(코드만으로 결론 낼 수 없음).** 이 컬렉터가 실제로 호출하는 액터는 Java 쪽 기본값 `apify~instagram-reel-scraper`(이름으로 미루어 reel 전용 액터)가 아니라 `application.yml:42`의 `actor-id: ${APIFY_ACTOR_ID:shu8hvrXbJbY3Eb9W}` — 즉 **opaque ID**로 고정되어 있고, 이 ID가 실제로 어떤 액터인지 레포 어디에도 문서화되어 있지 않음(주석 없음, 커밋 메시지도 "Apify Test"뿐). `git log`로 이 값의 변경 이력을 추적한 결과 `apify~instagram-reel-scraper` → `xMc5Ga1oCONPmWJIa` → `shu8hvrXbJbY3Eb9W` 두 차례 교체(2026-06-02, RESEARCH.md J-2에 이미 기록됨)되어 있어, 현재 액터가 이름 그대로의 "reel 전용" 액터인지, 범용 `instagram-scraper`(resultsType에 따라 출력 스키마가 달라질 수 있는 유형)인지조차 코드로 판별 불가능. `caption`/`displayUrl`/`locationName`은 Instagram 스크래퍼류 액터들 사이에서 흔히 공유되는 필드명이라 resultsType이 바뀌어도 유지될 가능성이 높다는 정도의 정성적 추론은 가능하지만, 이를 뒷받침할 코드상 근거(해당 액터의 입력/출력 스키마, 테스트 픽스처 등)가 레포에 전혀 없음. LOG.md에도 "실제 Apify 호출 테스트는 비용 발생 우려로 지시대로 생략"이라고 명시되어 있어 워커 스스로도 라이브 검증을 하지 않았음을 인정.

**종합**: 수정 방향 자체(릴스 URL에 resultsType=posts를 보내 빈 결과 → PRIVATE_CONTENT로 오인되던 증상)는 논리적으로 타당하고 범위도 깨끗하지만, "필드 구조가 동일하게 유지되는지"는 이 저장소의 코드만으로는 검증 불가능한 외부 액터의 런타임 동작에 의존합니다. **결과: 확인 필요** — 배포 후 실제 릴스 URL 1건으로 캡션/해시태그/위치/썸네일이 정상적으로 채워지는지 스모크 테스트를 권장(비용 발생 우려로 이번 리뷰에서도 직접 호출하지 않음). 코드 변경 자체를 되돌릴 필요는 없음 — 기존 `resultsType=posts`가 애초에 더 나은 근거를 갖고 있던 것도 아니라서(동일한 "Apify Test" 날 시행착오의 산물), 되돌리는 것이 더 안전하다고 볼 이유도 없음.

---

# 긴급 버그수정 — URL 파싱 "저장중→파싱오류" 3건 (6e6aabe/ea407c9/beb49ff) (2026-11-10)

검토 기준: `.team/RESEARCH.md` "## L." 조사(L-2/L-3)와 `.team/LOG.md` 워커 기록. `apps/api-spring`에서 `mvn -o compile`, `apps/mobile`에서 `npx tsc --noEmit` 재실행 — 전부 클린(사전 존재 오류 2건만, 신규 없음).

**(1) `normalizeCurrency()` 엣지케이스 — APPROVED.** `price` 키 없음/`Map`이 아님 → `instanceof Map` 가드로 안전 스킵. `currency` 키 없음(null) → `currency != null` 가드로 스킵(원래도 null과 동치라 문제 없음). 빈 문자열 → `ALLOWED_CURRENCIES`에 없어 null로 정규화(요청하신 "빈 문자열" 케이스 정확히 처리). 정상값("KRW" 등) → `contains()`가 true라 그대로 통과, 변형 없음(요청하신 "정상값일 때 그대로 통과" 확인). `currency.toString()`은 null 체크 이후라 NPE 불가, 비String 타입도 안전. **참고(비차단)**: 허용값의 대소문자 변형(예: "krw")은 `Set.contains`가 대소문자를 구분해 null로 정규화됨 — 크래시나 검증 실패로는 이어지지 않아 "안전"하지만, 유효한 값을 보존하지 못하고 버리는 효과는 있음(ISO 4217 코드는 관례상 대문자이고 프롬프트도 대문자로 지시하므로 실제 발생 가능성은 낮음).

**(2) 로깅 추가가 기존 흐름을 깨지 않는지 — APPROVED.** `log.warn(...)` 한 줄이 기존 `return ResponseEntity...` 앞에 삽입됐을 뿐 — 변수 변경·분기 변경 없음, SLF4J 로깅 호출은 예외를 던지지 않으므로 응답 바디/상태코드/흐름에 영향 없음.

**(3) `res.message`/`saveRes.message` 접근 안전성 — APPROVED.** 두 곳 모두 `if (res.success) {...} else { toast.error(res.message || "고정문구") }` 형태로, `else` 분기에 도달했다는 것 자체가 바로 위에서 이미 `res.success`에 접근했다는 뜻 — `res`가 null/undefined였다면 그 시점에 이미 에러가 났을 것이므로 `res.message` 접근 시점엔 `res`가 non-null임이 보장됨. `message`는 `ApiResponse` 타입상 항상 `string`이라 타입 에러 없음, 런타임에 빈 문자열/falsy여도 `||`가 정확히 고정 문구로 폴백. `tsc` 결과도 신규 에러 없음으로 확인.

**(4) 범위 이탈 — APPROVED.** `git show --stat` 확인: 6e6aabe는 `AiServiceImpl.java` 1개 파일(20줄 추가), ea407c9는 `GlobalExceptionHandler.java` 1줄, beb49ff는 `ShareHandler.tsx`/`UrlParserModal.tsx` 각 1줄 — 전부 설명된 수정 내용과 정확히 일치, 추가 리팩토링 없음.

**종합: 3건 전부 APPROVED.**

---

# 묶음 A + 묶음 B — 정책/백로그 미결 항목 확정 구현 (0b84448~0c44fce) (2026-11-10)

검토 기준: `.team/TASKS.md` "4. 개발" 묶음 A/B 설명과 `.team/LOG.md` 워커 기록. `apps/api-spring`에서 `mvn -o compile`, `apps/web`에서 `npx tsc --noEmit` 재실행 — 둘 다 클린.

## 묶음 A — [A1]/[A2] "준비중" 비활성화

**APPROVED.** `git show --stat`로 두 커밋 모두 UI 파일(웹 `SettingsScreen.tsx`, 모바일 `NotificationSettingsModal.tsx`)만 수정했음을 확인, 백엔드 변경 0건(지시사항과 일치). 네이티브 `disabled` 속성 + `onPress`/`onClick` 가드 이중 처리로 클릭이 막혀있고, 저장/조회 로직 자체는 그대로 둔 것도 확인(값 변경 불가, 조회는 그대로).

## 묶음 B — [B1]~[B4] 계정 탈퇴(소프트 삭제)

**(1) 본인 확인만으로 동작 — APPROVED.** `DELETE /api/user/account`는 `Principal principal` 하나만 받고 path/body에 사용자 ID가 없음 — `userService.deleteAccount(principal.getName())` → `findByUsername`으로 본인 행을 조회한 뒤 그 ID로만 `markAsDeleted` 호출. 다른 사용자 ID를 지정할 방법이 구조적으로 없음(기존 `updateProfile`/`updateAvatar`와 동일한 `Principal` 전용 패턴).

**(2) refresh token 무효화 — 확인 필요(한 가지 보강 권장).** `deleteAccount()`가 `refreshTokenMapper.deleteByUserId(user.getId())`로 해당 사용자의 `refresh_tokens` 행을 전부 삭제함을 XML로 확인(`DELETE FROM refresh_tokens WHERE user_id = #{userId}` — 전체 삭제, 한 개만 아님). 그런데 `AuthServiceImpl.refresh()`를 직접 읽어보면 **토큰 조회 성공 시 `user.isDeleted()`를 전혀 체크하지 않고 바로 새 토큰을 발급**합니다(`login()`에만 `isDeleted` 체크가 있고 `refresh()`에는 없음). 정상적인 순차 흐름에서는 탈퇴 시점에 기존 refresh token이 이미 삭제되므로 `refresh()`가 `REFRESH_TOKEN_NOT_FOUND`로 막히는 게 맞지만, 이는 "탈퇴가 먼저 커밋되어 토큰이 이미 없다"는 타이밍에만 의존하는 방어입니다 — `DELETE /api/user/account`와 `POST /api/auth/refresh`가 동시에 들어오는 경쟁 상황(TOCTOU)에서는 `refresh()` 쪽 트랜잭션이 먼저 토큰을 읽어버리면 탈퇴 직후에도 새 토큰이 발급될 이론적 여지가 있습니다. 실제 악용 난이도는 낮음(다른 사용자 계정을 노리는 수평 권한 상승이 아니라, 본인 계정을 탈퇴하는 그 순간의 좁은 타이밍 창에서만 발생 가능)이지만, **`login()`과 동일하게 `refresh()` 안에도 `if (user.isDeleted()) throw new AppException(ErrorCode.ACCOUNT_DELETED);`를 추가하는 것을 권장**합니다 — 토큰 삭제 타이밍에 의존하지 않는 독립적인 방어선이 되어 "재로그인 불가"가 구조적으로 보장됩니다.

**(3) 로그인 가드 — APPROVED.** `login()`은 비밀번호 검증(변경 없음) → `user.isDeleted()`면 `ACCOUNT_DELETED`(403)로 거부 → 통과하면 기존과 동일하게 `buildAuthResponse`. `isDeleted=false`인 정상 계정은 새로 추가된 분기를 그냥 통과하므로 **기존 로그인 동작에 영향 없음**(코드상 분기가 끝에 추가됐을 뿐 기존 로직 변경 없음). 비밀번호 검증을 먼저 하므로 비밀번호를 모르는 제3자가 "이 계정이 탈퇴됐는지" 알아낼 수 있는 오라클도 아님.

**(4) 연관 데이터(소유 팀스페이스/장소/일정) — 확인했고 당장 처리 불필요로 판단.** 소프트 삭제라 `users` 행 자체는 그대로 남아있어 `created_by`/`owner_id` 등 FK가 가리키는 대상이 사라지지 않음 — **고아 데이터(orphan)는 발생하지 않습니다.** 다만 두 가지 부수 효과를 확인했고, 둘 다 B1~B4 범위 밖(별도 후속 과제로 남기는 것을 권장)이라고 판단합니다: ① 탈퇴한 사용자가 오너인 팀스페이스는 오너가 영구히 로그인할 수 없어 오너 전용 작업(스페이스 설정/멤버 관리)이 막힌 채로 남음(소유권 이전 메커니즘 없음), ② `TeamSpaceServiceImpl.inviteMember()`가 `is_deleted`를 필터링하지 않아 탈퇴한 사용자를 새 스페이스에 초대하는 것 자체는 여전히 가능함(초대돼도 로그인 못 하니 실질적 피해는 없지만 멤버 목록에 유령처럼 남음). 두 항목 모두 TASKS.md B1~B4가 요구한 범위가 아니고, 팀이 이미 "보관 후 실제 삭제/익명화 배치"도 이번 사이클에선 설계만 남기기로 결정한 것과 같은 선상의 후속 작업이라 지금 막을 필요는 없다고 판단합니다.

**(5) 프런트 확인 모달 — APPROVED.** `handleDeleteAccount`가 `window.confirm("정말로 계정을 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.")`를 통과해야만 API를 호출 — 취소 시 즉시 `return`이라 아무 일도 일어나지 않음. 기존 "스페이스 삭제" 버튼과 동일한 확인 패턴 재사용 확인. 성공 시 `token`/`refresh_token`/`username`을 지우는 `localStorage` 키 이름이 `apps/web/src/lib/api-client.ts`에서 실제로 쓰는 키(`"refresh_token"` 등)와 정확히 일치함을 대조 확인 — 로그아웃이 제대로 됨.

**(6) 범위 이탈 — APPROVED.** `git diff --stat` 전체 확인: 백엔드 7개 파일(UserMapper/User/AuthServiceImpl/ErrorCode/UserController/UserService/UserServiceImpl) + 마이그레이션 1개 + XML 1개 + 웹 2개 파일만 변경, 전부 TASKS.md B1~B4가 지정한 대상과 일치. 모바일은 "계정 탈퇴" UI 자체가 없음을 grep으로 확인했다는 워커 설명과 실제로 모바일 파일이 diff에 전혀 없다는 점이 일치.

## 종합

묶음 A는 전체 APPROVED. 묶음 B는 (1)(3)(4)(5)(6) APPROVED, **(2)만 확인 필요** — `AuthServiceImpl.refresh()`에 `isDeleted` 가드 한 줄 추가를 권장(좁은 범위의 보강, 커밋을 되돌릴 필요는 없음).

**후속 확인**: 커밋 ff2f1f6("[B3 보강] refresh()에도 탈퇴 계정 가드 추가")에서 위 (2) 지적사항이 정확히 그대로 수정됨을 코드로 재확인 — `refresh()`의 `User user = userMapper.findById(...)` 직후 `if (user.isDeleted()) throw new AppException(ErrorCode.ACCOUNT_DELETED);`가 `login()`과 동일한 형태로 추가됨. **묶음 B (2) → APPROVED로 해소.**

---

# 묶음 C(장소 공개동의) + 묶음 D(비슷한 장소 추천) — 816ad59~a9d5fce (2026-11-10)

검토 기준: `.team/TASKS.md` "4. 개발" 묶음 C/D 설명과 `.team/LOG.md` 워커 기록. `apps/api-spring`에서 `mvn -o compile`, `apps/mobile`에서 `npx tsc --noEmit` 재실행 — 둘 다 클린(사전 존재 오류 2건만, 신규 없음). `git diff --stat`로 전체 범위(816ad59~a9d5fce) 확인 — 15개 파일 전부 `place`/`notification` 도메인과 TASKS.md가 명시한 대상(마이그레이션 2개, `PlaceController`/`Service`/`ServiceImpl`/`Mapper`+XML/모델/DTO, 모바일 `place/api.ts`·`PlaceDetailScreen.tsx`·`PlaceSimilarSection.tsx`)과 정확히 일치. 웹 파일은 전혀 없음(C3/D5는 원래 모바일 전용 기능이라 타당).

## 묶음 C — 장소 공개동의

**(1) 멤버십 체크 — APPROVED.** consent 필드는 전용 엔드포인트가 아니라 기존 `PlaceServiceImpl.update()`에 포함됨(C2의 판단) — `update()`의 `checkSpaceMember(place.getSpaceId(), user.getId())`가 consent 필드 대입보다 먼저 실행되는 코드 순서를 직접 확인. 다른 필드(tags/menu/confidence 등)와 동일한 null-skip 패턴(`if (request.getConsentGiven() != null) {...}`)이라 별도 취약 경로가 새로 생기지 않음.

**(2) 약관 문구 플레이스홀더 분리 — APPROVED.** `PlaceSimilarSection.tsx` 상단에 `export const CONSENT_PLACEHOLDER_TEXT = "..."`로 분리되어 있고, 주석("법무 검토 전 임시 문구 — 실제 약관이 확정되면 이 값만 교체하면 됨")과 실제 사용(`{CONSENT_PLACEHOLDER_TEXT}` 보간)을 직접 확인 — 문구 교체 시 이 상수 하나만 바꾸면 됨.

## 묶음 D — 비슷한 장소 추천

**(1) 임베딩 생성 best-effort — APPROVED.** `generateEmbeddingBestEffort()`가 `placeMapper.insert/update` **이후에** 호출되고, 내부가 `try { ... } catch (Exception e) { log.warn(...); }`로 감싸여 있어 `aiService.createEmbedding()`이 실패해도 예외가 밖으로 전파되지 않음을 코드로 확인 — 장소 저장은 이미 끝난 뒤라 영향 없음. `buildEmbeddingText()`가 빈 문자열이면 호출 자체를 건너뛰는 가드도 확인.

**(2) 기존 클라이언트 재사용 — APPROVED.** `AiService.createEmbedding(String)`은 이번 커밋에서 신설되지 않고 기존 인터페이스 메서드를 그대로 호출(`AiServiceImpl`에 이미 존재, 126번째 줄 근처에서 다른 기능이 이미 쓰고 있음을 grep으로 확인) — 신규 임베딩 클라이언트 없음.

**(3) pgvector 쿼리 — APPROVED.** `findSimilarPlaces` SQL을 직접 읽어 확인: `p.id != #{placeId}`(자기 자신 제외), `p.embedding IS NOT NULL AND target.embedding IS NOT NULL`(후보/대상 양쪽 NULL 제외 — 대상이 NULL이면 크로스 조인 결과가 통째로 비어 안전하게 빈 목록), `ORDER BY p.embedding <=> target.embedding`(코사인 거리 오름차순 = 유사도 내림차순) 전부 정확함.

**(4) 유사 장소 엔드포인트 멤버십/정보노출 — APPROVED(설계 의도와 일치함을 확인).** `findSimilar()`는 ① `checkSpaceMember(place.getSpaceId(), ...)`로 **조회 대상 장소가 속한 스페이스의 멤버만** 이 기능 자체를 쓸 수 있게 막고, ② 대상 장소가 `consentGiven=false`면 `PLACE_CONSENT_REQUIRED`(403)로 거부합니다. 다만 실제로 반환되는 "후보" 목록은 D3 설계대로 전체 장소 풀(다른 팀스페이스 포함)에서 가져옵니다 — 이것만 보면 "다른 스페이스 정보가 샌다"고 볼 수 있지만, 아래 이유로 **의도된 동작**이라고 판단했습니다: ① `consent_given=true`로 필터링되어 있어, 정보가 노출되는 장소는 해당 장소의 소유자가 명시적으로 "다른 사용자에게 익명으로 추천될 수 있음"에 동의한 경우로 한정됨(동의 문구 원문과 정확히 일치하는 동작). ② `SimilarPlaceResponse` DTO(`id/name/category/region/thumbnailUrl/tags/matchScore`)에는 `spaceId`/`createdBy`/정확한 `address`/좌표가 **전혀 없음** — 어떤 팀스페이스·어떤 사용자의 장소인지는 알 수 없고 "이름/카테고리/대략적 지역/태그"만 익명으로 노출됨, 동의 문구의 "익명으로"를 DTO 설계로 실제로 뒷받침함. ③ 조회 자체는 여전히 대상 장소의 스페이스 멤버만 가능(비멤버는 엔드포인트 자체를 호출할 수 없음). 종합하면 "동의한 장소 정보만, 소유자/스페이스 비식별 상태로, 익명 추천" — 공개동의 기능의 설계 목적과 정확히 일치하는 동작이라 **정보 유출이 아니라 의도된 기능**으로 판단합니다.

**(5) 모바일 로딩/빈 상태 — APPROVED.** `PlaceSimilarSection`의 렌더 분기 순서를 직접 확인: `!localConsent`(동의 전 locked 상태) → `loading`(스켈레톤 카드 3개) → `similar.length === 0`(빈 상태 문구) → 실제 목록 — `loading`이 빈 상태 체크보다 먼저 분기되어 로딩 중 "결과 없음"이 잘못 깜빡이는 문제가 없음. `PlaceDetailScreen`의 `useEffect`는 `consentGiven`이 false면 API를 호출하지 않고 즉시 `setSimilar([])`, 호출 실패 시에도 catch에서 `setSimilar([])`로 떨어져 항상 빈 배열로 안전하게 귀결.

**(6) 범위 이탈 — APPROVED.** 위 `git diff --stat` 확인대로 15개 파일 전부 설명된 대상과 일치.

## 종합

묶음 C 2건, 묶음 D 5건 전부 **APPROVED**. 특히 D(4)는 "전체 장소 풀에서 검색"이라는 설계 자체가 다른 팀스페이스 데이터를 결과에 포함하는 게 맞지만, 동의 필터링(`consent_given=true`)과 비식별 DTO(소유자/스페이스/정확한 위치 미노출) 두 가지로 "익명 추천"이라는 동의 문구의 약속을 실제로 지키고 있음을 코드로 직접 대조해 확인했습니다. CHANGES REQUESTED 없음.

---

# 긴급 보안수정 — `/api/recommend` 인증 필수화 (커밋 1850d43) (2026-11-11)

검토 기준: `.team/RESEARCH.md` M4-1(비용 공격 취약점). `apps/api-spring`에서 `mvn -o compile` 재실행 — 클린.

**(1) SecurityConfig 변경 정확성 — APPROVED.** `filterChain()` 전체를 직접 읽음: `.requestMatchers("/api/recommend", "/api/recommend/**").permitAll()` 줄이 삭제되고 동일 패턴이 `.authenticated()` 블록으로 옮겨짐(중복/잔존 없음). 그 외 `permitAll` 목록(루트/docs, auth 4종, `documents/health`)과 다른 `authenticated()` 항목(`/api/user/**` 등 7개 + `anyRequest().authenticated()`)은 diff에 전혀 등장하지 않아 손대지 않았음을 확인. Spring Security는 매처를 선언 순서대로 평가하는데, 이전 permitAll 줄이 다른 곳에 남아있지 않으므로 더 앞선 규칙이 recommend 경로를 가로채 permitAll로 새는 경우도 없음.

**(2) 기존 정상 사용자 영향 — APPROVED(워커 주장 재검증 완료).** 웹 `domains/recommend/api.ts`의 `recommend(query, token, ...)`과 `apiRequest`(`headers.set("Authorization", \`Bearer ${token}\`)`)를 직접 대조해 실제로 토큰이 헤더로 나가는 것을 확인. 모바일은 `getToken()`이 null이면 `token ?? undefined`로 헤더가 안 붙을 수 있다는 워커의 지적도 맞지만, 실제 라우트 구조(`app/(tabs)/recommend.tsx`)와 `app/_layout.tsx`의 `AuthGuard`(`if (!token && !inAuthGroup) router.replace("/auth/login")`)를 직접 읽어 이 화면 자체가 토큰 없이는 도달 불가능함을 확인 — 워커 주장과 일치. (설령 세션 중간에 토큰이 만료되는 극단적 타이밍이 있어도, 이번 수정 전엔 그 요청이 익명으로 성공했고 수정 후엔 401로 안전하게 막히는 것뿐이라 "정상 사용자가 끊긴다"고 볼 상황이 아님.)

**(3) `@SecurityRequirement` 문법 — APPROVED.** `RecommendController`에 추가된 `@SecurityRequirement(name = "bearerAuth")`를 `grep`으로 다른 9개 컨트롤러(Message/Document/Event/Notification/Place/TeamSpace/Todo/UrlParser/User)와 대조 — import 경로·어노테이션 형태·스킴 이름까지 전부 동일. 스킴 이름 `"bearerAuth"`는 `OpenApiConfig.java`의 `addSecuritySchemes("bearerAuth", ...)` 정의와 일치. `mvn -o compile` 클린.

**종합: APPROVED.**

---

# 묶음 A — 상용화 기반 보안/성능/운영 8건 (1f934d4~cc04c99) (2026-11-11)

검토 기준: `.team/RESEARCH.md` "## M." 섹션(M4-3/M3-3/M1-3/M3-1/M7-1/M4-2/M2-3/M2-2)과 `.team/TASKS.md` "묶음 A" 설명. `apps/api-spring`에서 `mvn -o compile` 재실행(8개 커밋 전체 반영 HEAD 기준) — 클린. `git diff --stat`로 전 범위에 `apps/web`/`apps/mobile` 변경 0건 확인(전부 백엔드 "코드만 추가" 항목이라는 전제와 일치).

## [A1] M4-3 — API 키 노출 제거

**APPROVED.** `InstagramReelsCollector`/`AiServiceImpl` 두 `catch` 블록 모두 클라이언트로 나가는 `AppException` 메시지에서만 `e.getMessage()` 접합을 제거(고정 문구로 치환)했고, `log.error(..., e)`는 그대로 유지해 서버 로그에는 원인 분석용 스택트레이스가 남음을 확인. `errorCode`(`APIFY_ERROR`/`AI_RESPONSE_PARSE_ERROR`)는 그대로 유지돼 `GlobalExceptionHandler`를 통해 클라이언트 응답에 계속 포함됨 — 프런트의 에러코드별 분기(J-3에서 확인된 기존 패턴)에 필요한 "에러 유형" 구분력은 그대로 유지한 채, 키가 섞여 나올 수 있는 원문 메시지만 제거됨.

## [A2] M3-3 — 인덱스 5곳 추가

**APPROVED.** `CREATE INDEX IF NOT EXISTS`(평범한 B-tree, 비유니크) 5개뿐 — 컬럼 타입/제약/기존 쿼리 결과에 영향 없는 순수 추가 연산. 인덱스명 중복 위험 없음(`IF NOT EXISTS`로 멱등), 테이블 데이터량이 적다는 RESEARCH.md M-3 기록과 맞물려 인덱스 빌드 중 짧은 쓰기 잠금도 문제 되지 않음.

## [A3] M1-3 — 로그인 brute-force 방어(계정 잠금)

**APPROVED.** `login()` 로직을 라인 단위로 추적: ① 정상 로그인(비밀번호 일치, `lockedUntil` null) — 잠금 체크(`lockedUntil != null && isAfter(now)`가 false)와 실패 카운트 증가 블록을 전부 건너뛰고 `resetFailedLoginCount` 호출 후 그대로 `buildAuthResponse` 반환 — **기존 정상 로그인 흐름 완전히 그대로 유지됨.** ② 잠금 해제: `locked_until`이 과거 시각이 되는 순간 `isAfter(now)` 조건이 자동으로 false가 되어 별도 배치/수동 해제 없이 다음 로그인 시도부터 정상 진행 — **시간 기반 자동 해제 확인.** ③ 실패 카운트 리셋: 비밀번호 일치 + 미삭제 계정 조건을 통과해야만 도달하는 `resetFailedLoginCount(user.getId())`가 성공 시마다 호출됨 — **성공 로그인 시 카운트/잠금 모두 초기화 확인.** 임계값 체크는 "조회 시점 카운트 + 1(이번 시도)"로 계산해 5번째 실패에서 정확히 잠기는 것도 확인(오프바이원 없음). 기본값(5회/15분)도 일반 사용자의 한두 번 오타를 잠그지 않는 합리적 수준.

## [A4] M3-1 — N+1 → 배치 조회

**APPROVED.** `MessageServiceImpl`: 신규 `usernameMap`은 "존재하는 유저만" 담기지만 조회는 `usernameMap.getOrDefault(..., "알 수 없음")`으로 기존과 동일한 폴백을 재현 — 메시지 순회도 원본 `messages` 리스트 순서 그대로, 각 메시지가 자기 `userId`로 맵을 "키 조회"하는 구조라 위치 기반 매핑 꼬임이 구조적으로 불가능. `TeamSpaceServiceImpl`: 신규 `findMembersBySpaceIds` SQL이 기존 단건 버전과 SELECT 컬럼·JOIN·ORDER BY까지 완전히 동일(IN 절만 다름)함을 직접 대조, `Collectors.groupingBy(spaceId)` 결과도 각 공간이 자기 `space.getId()`로 조회하는 구조라 동일하게 매핑 안전. 양쪽 다 빈 리스트일 때 빈 IN절 SQL이 생성되지 않도록 하는 가드(`isEmpty()`)도 확인.

## [A5] M7-1 — `/v3/api-docs` 비활성화

**APPROVED.** `grep`으로 레포 전체(웹/모바일/스크립트 포함)에 `/v3/api-docs` 참조가 `application.yml` 자신 외에는 0건임을 확인 — swagger-ui가 이미 꺼져있던 상태에서 원본 스펙 JSON만 따로 공개할 이유가 없었던 불일치를 해소한 것이고, 실제로 사용 중인 다른 기능을 막지 않음. `/doc`/`/docs`(별도 커스텀 문서 페이지)는 diff에 없어 그대로 유지됨.

## [A6] M4-2 — DTO 길이 제한

**APPROVED.** `Todo.title`의 `@Size(max=255)`는 DB `VARCHAR(255)`와 정확히 일치(기존에도 DB가 암묵적으로 걸던 상한을 명시화한 것뿐, 더 좁히지 않음). `Event.description`/`Message.content`의 `@Size(max=2000)`은 DB가 TEXT(무제한)라 DTO 레벨에서 새로 정한 상한인데, 2000자는 일반적인 설명/채팅 메시지 길이를 훨씬 넘는 여유값이라 정상 입력을 막을 가능성은 낮음. 4개 DTO 모두 해당 컨트롤러에서 `@Valid`로 실제 검증되는 것도 확인(죽은 애너테이션 아님).

## [A7] M2-3 — Actuator 헬스체크

**APPROVED(가장 중요한 지점 확인 완료).** `management.endpoints.web.exposure.include: health`로 **health 외의 모든 Actuator 엔드포인트(env/beans/configprops/heapdump/threaddump/metrics 등)는 웹에 노출되지 않음**(화이트리스트 방식) — `/actuator/env` 같은 민감정보 엔드포인트는 라우팅 자체가 생성되지 않아 인증 여부와 무관하게 접근 불가. 추가로 `management.endpoint.health.show-details: never`로 `/actuator/health` 응답 자체도 구성요소별 상세정보(DB 연결 상태 등) 없이 최상위 상태값만 반환하도록 제한 — Actuator의 "기본 설정이 공개적"이라는 위험을 두 겹으로 방어. `SecurityConfig`의 permitAll도 정확히 `/actuator/health`, `/actuator/health/**`로만 한정. 다른 profile별 `application-*.yml`에 이 설정을 재확장하는 override도 없음(grep 확인).

## [A8] M2-2 — MDC 요청ID 구조화 로깅

**APPROVED.** `RequestIdFilter`는 헤더 읽기/UUID 생성/`MDC.put`/응답헤더 설정만 수행하는 경량 `OncePerRequestFilter`로 I/O나 블로킹 호출이 없어 성능 영향 무시 가능, `filterChain.doFilter()`를 무조건 통과시키는 순수 패스스루라 기존 요청 처리 흐름(라우팅/바디/상태코드)에 영향 없음, `finally`의 `MDC.remove`로 스레드풀 재사용 시 다음 요청에 값이 새는 것도 방지. `addFilterBefore(..., JwtAuthenticationFilter.class)`로 인증 단계보다 먼저 배치돼 인증 실패 로그에도 requestId가 붙음. "모든 로그 라인에 실제로 붙는지"는 MDC가 스레드 로컬이라 같은 스레드에서 동기 처리되는 모든 로그에 해당되는데, 이 레포에 `@Async`/`@EnableAsync`가 0건(RESEARCH.md에서 기존에 이미 확인된 사실)이라 현재 모든 요청 처리가 단일 스레드 동기 흐름이므로 예외 없이 전부 적용됨. `logback-spring.xml`도 Spring Boot 공식 `defaults.xml`/`console-appender.xml`을 그대로 `include`하고 패턴 프로퍼티만 `[reqId=...]` 삽입 — 중복 appender나 로그레벨 변경 없음.

## 종합

8건 전부 **APPROVED**. 가장 신경 써서 확인한 지점은 (3) 계정 잠금의 정상 로그인 무영향/자동해제/카운트리셋 3가지와 (7) Actuator의 민감 엔드포인트 비노출 2중 방어(화이트리스트 + show-details:never)였고, 둘 다 코드로 직접 추적해 의도대로 동작함을 확인했습니다. CHANGES REQUESTED 없음.

---

# 묶음 C — 테스트 + CI (de88560, a974bc5, 4b3e2ef, 2e5f1e8) (2026-11-11)

검토 기준: `.team/TASKS.md` "묶음 C — 테스트 + CI (설치/파일럿 수준)" 설명(C1=11-a 백엔드 핵심경로, C2=11-b 웹 설치+파일럿, C3=11-c 모바일 설치+파일럿, C4=12 CI). 4개 항목 모두 **직접 테스트/빌드를 실행해 결과를 확인**했습니다(claim을 그대로 믿지 않음).

## (1) [C1] 백엔드 테스트 — APPROVED

`mvn -o test`를 직접 실행 — `Tests run: 21, Failures: 0, Errors: 0, Skipped: 0` / `BUILD SUCCESS`, 커밋이 주장한 21개(9+6+6)와 정확히 일치. 콘솔에 보인 스택트레이스(`NotificationServiceImpl` 로그)는 `best-effort` 테스트가 의도적으로 `RuntimeException`을 던져 그걸 삼키는지 확인하는 테스트 자체의 정상 동작이고, 테스트는 통과함(한글 로그가 깨져 보이는 건 콘솔 인코딩 문제일 뿐 실패가 아님).

파일 내용을 직접 읽어 대상 범위도 확인:
- `AuthServiceImplTest`(9) — 로그인 성공/미존재/비밀번호불일치(카운트 증가, 임계값 미도달)/임계값 도달(잠금)/잠긴 계정 즉시 거부/탈퇴 계정 거부, refresh 성공/만료/**탈퇴 계정 거부(묶음 B의 TOCTOU 보강 ff2f1f6에 대한 회귀 테스트까지 포함)** — 지시된 "로그인/리프레시" 핵심 경로를 전부 다룸.
- `PlaceServiceImplTest`(6) — add/findById/delete의 비멤버 거부(`PLACE_ACCESS_DENIED`), `findSimilar`의 공개동의 가드 거부/통과 — 지시된 "Place 멤버십 체크"를 정확히 다룸.
- `NotificationServiceImplTest`(6) — 타입별 억제/비억제, 설정 없음 기본값, **`mapper.insert`가 예외를 던져도 `create()`가 전파하지 않는지(best-effort)** 직접 검증 — 지시된 "Notification 생성/설정 억제 로직"을 정확히 다룸.

## (2) [C2]/[C3] 웹/모바일 테스트 — APPROVED

**웹**: `npx vitest run`을 직접 실행 — `Test Files 2 passed (2)` / `Tests 7 passed (7)`. 대상은 `Button.test.tsx`(6)·`LoadingScreen.test.tsx`(1), hooks/fetch/router 의존이 없는 순수 프레젠테이션 컴포넌트 2개로 한정됨을 파일로 확인 — "1~2개" 지시를 정확히 지킴(3개 이상으로 안 늘어남).

**모바일**: `npx jest`를 직접 실행 — `Test Suites: 2 passed, 2 total` / `Tests: 4 passed, 4 total`. 대상은 `EmptyState.test.tsx`(2)·`FormInput.test.tsx`(2), 동일한 "외부 의존성 없는 순수 컴포넌트" 기준으로 2개만 선정됨을 확인. `package.json`의 `moduleNameMapper: {"^react$": "<rootDir>/node_modules/react"}` 설정(모노레포 다중 React 인스턴스 문제 해결책)이 실제로 테스트를 통과시키는 데 유효함을 실행 결과로 직접 확인(이론이 아니라 실측).

## (3) [C4] CI 워크플로 — APPROVED

`.github/workflows/ci.yml`을 `js-yaml`로 실제 파싱해 문법 오류 없음을 확인(`YAML parsed OK`, `jobs: ["web","mobile","api-spring"]`). 각 잡이 C1~C3의 테스트를 실제로 실행하는 게이트인지 단계별로 대조:
- `web` 잡의 `npm run test`(`working-directory: apps/web`) → `apps/web/package.json`의 `"test": "vitest run"` → C2 파일럿 실행.
- `mobile` 잡의 `npm run test`(`working-directory: apps/mobile`) → `apps/mobile/package.json`의 `"test": "jest"` → C3 파일럿 실행.
- `api-spring` 잡의 `mvn -B test` → C1의 21개 테스트 전체 실행.

세 경로 모두 "빌드/린트만 하고 테스트는 건너뛰는" 가짜 게이트가 아니라 실제 테스트 실행 명령으로 연결됨을 확인. 모바일 lint 제외는 `eslint.config.js` 부재(ESLint v9 미마이그레이션)라는 **사전에 이미 깨져있던 상태**를 발견해 주석으로 이유를 남기고 범위 밖으로 제외한 것 — 이번 작업이 깨뜨린 게 아니라 기존 결함을 정직하게 기록하고 피해간 것으로 판단, 문제 없음.

## (4) 범위 이탈 — APPROVED

`git diff --stat`로 4개 커밋 전체 범위 확인: 테스트 파일 6개(백엔드 3/웹 2/모바일 2 — 코드가 아니라 전부 `*.test.*`), 설정 파일(`vitest.config.mts`/`vitest.setup.ts`/각 `package.json`/`turbo.json`/루트 `package.json`), `package-lock.json`(의존성 설치), `.github/workflows/ci.yml` — **프로덕션 소스 코드(비-테스트 `.ts`/`.tsx`/`.java`)는 단 한 줄도 수정되지 않음.** 테스트 개수도 백엔드 21개(3개 핵심 서비스), 웹 7개(2개 컴포넌트), 모바일 4개(2개 컴포넌트)로 TASKS.md가 명시한 "핵심 경로 위주"/"1~2개 파일럿" 범위를 정확히 지킴 — 전체 커버리지 확보로 확대된 흔적 없음.

## 종합

4건 전부 **APPROVED**. 커밋 메시지의 숫자 주장(21/7/4개 테스트, 전부 통과)을 실제로 `mvn test`/`npx vitest run`/`npx jest`를 직접 실행해 재현·확인했고, CI YAML도 실제 파서로 검증했습니다. 테스트 대상 선정(핵심 보안/로직 경로 vs 순수 컴포넌트 파일럿)과 범위(설치+파일럿 수준 유지)도 지시사항과 정확히 일치합니다. CHANGES REQUESTED 없음.

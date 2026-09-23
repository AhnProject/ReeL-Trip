# ReeL-Trip — Claude 작업 규칙

이 파일은 프롬프트 초기화 이후에도 Claude가 동일하게 동작하도록 하는 항시 적용 규칙입니다.

---

## 프로젝트 개요

AI 기반 여행지 추천 · 팀 여행 플래닝 서비스 (Turborepo 모노레포)

| 앱 | 경로 | 기술 |
|----|------|------|
| Web FE | `apps/web` | Next.js 15 (App Router) |
| Mobile FE | `apps/mobile` | React Native (Expo ~54, Expo Router v6) |
| API | `apps/api-spring` | Spring Boot 3 |

---

## 작업 흐름 (반드시 준수)

사용자가 작업을 요청하면 아래 순서를 따른다.

### 0단계 - 요구사항지시서 초안 작성

요청을 맏으면 바로 작업지시를 내리지 않는다
`docs/templates/requirements.md` 양식을 기반으로 요구사항지시서를 옵시디언 서브모듈의
`obsidian/Jeakyoung_Blog/01_Projects/05_ReelTrip/04_VibeCode/00_Requirements/` 하위에 마크다운 문서로 생성한다.

### 1단계 — 작업지시서 초안 작성

요청을 받으면 즉시 작업을 시작하지 않는다.
`docs/templates/work-order.md` 양식을 기반으로 작업지시서를 옵시디언 서브모듈의
`obsidian/Jeakyoung_Blog/01_Projects/05_ReelTrip/04_VibeCode/02_WorkOrders/` 하위에 마크다운 문서로 생성한다.

포함 항목:
- 요구사항 분석 요약 (모호한 부분은 `[?]` 표시 후 질문)
- 변경 대상 파일 목록
- 작업 단계별 계획
- 사이드 이펙트 검토

### 2단계 — 컨펌 대기

작업지시서 작성 후 반드시 사용자 승인을 기다린다.
사용자가 "ㅇㅇ", "진행해", "ok" 등 승인 신호를 보내면 작업을 시작한다.
수정 요청이 오면 작업지시서를 수정 후 재컨펌을 받는다.

**예외:** 사용자가 "바로 해줘", "컨펌 없이 해줘" 등을 명시하면 1단계를 생략하고 바로 작업한다.

### 3단계 — 작업 실행

승인된 작업지시서 범위 내에서만 작업한다.
범위를 벗어나는 추가 개선, 리팩토링, 코드 정리는 하지 않는다.

### 4단계 — 완료보고서 작성

작업 완료 후 `docs/templates/completion-report.md` 양식으로 완료보고서(결과보고서)를 옵시디언 서브모듈의
`obsidian/Jeakyoung_Blog/01_Projects/05_ReelTrip/04_VibeCode/03_WorkResults/` 하위에 마크다운으로 작성한다.
YAML 프론트매터(title/date/type/project/status/assignee/tags)를 붙이고, `title`은 한글로 작성한다. 필요 시 관련 노트를 `[[위키링크]]`로 연결한다.

### 문서 저장 위치 관련 주의사항

- 요구사항서/작업지시서/완료보고서는 모두 이 저장소가 아니라 `obsidian/` 서브모듈(별도 GitHub 저장소) 안에 생성된다.
- 모든 문서의 YAML 프론트매터 `title` 필드는 한글로 작성한다 (파일명은 기존처럼 날짜-영문 슬러그 유지).
- `docs/templates/`의 양식(표 구조)은 그대로 유지하고 저장 위치만 옵시디언으로 옮긴 것 — 문서 내용 형식은 바꾸지 않는다.
- 옵시디언 서브모듈은 별도 원격 저장소(`jeakyoung/obsidian-database`)를 가진 독립 git 저장소이므로, 그 안에서의 커밋/푸시는 이 저장소의 커밋과 별개로 사용자에게 확인받는다.

---

## 명령 입력 방식

사용자는 아래 방식 중 편한 것으로 요청한다.

**방식 1 — 자유로운 설명**
```
홈 화면 상단 헤더에 알림 뱃지 추가해줘. 현재는 아이콘만 있고 개수가 안 보임.
```

**방식 2 — 범위 명시**
```
[mobile/home] 알림 뱃지 추가
[web/dashboard-ai] URL 파서 입력창 UX 개선
```

**방식 3 — 요구사항 양식 (`docs/templates/requirements.md` 복사 후 작성)**

---

## 코드 작성 원칙

- 요청된 범위만 변경한다. 불필요한 리팩토링, 코드 정리, 주석 추가 금지.
- 타입은 `packages/types`의 공유 타입을 우선 사용한다.
- Web: FSD 구조로 리팩토링 예정이므로 현재 구조에 깊은 투자 지양.
- Mobile: `src/lib/colors.ts` 디자인 토큰, `src/lib/styles.ts` 공유 스타일 토큰 준수.
- 서버 상태는 TanStack Query, 클라이언트 전역 상태는 Zustand 사용.

---

## 주의 사항

- 작업지시서 컨펌 전에는 절대 코드를 수정하지 않는다.
- 파일을 새로 생성하기 전에 기존 파일 재사용 가능 여부를 먼저 검토한다.
- 보안 취약점(XSS, SQL Injection 등)이 생기는 코드는 작성하지 않는다.

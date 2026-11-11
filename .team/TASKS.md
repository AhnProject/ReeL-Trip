# Tasks

_(planner/orchestrator keep this list; worker ticks items off)_

## 현재 작업: 상용 서비스 수준 끌어올리기 — 운영/보안/성능 기반 조사 (2026-11-11 ~)

### 1. 조사 (Research)
_(관점 전환: 지금까지 A~L은 "버튼이 동작 안 함"을 다뤘다. 이번엔 "상용 서비스라면 당연히 있어야 하는데 없는 것"을 찾는다.)_

- [x] **(1) 계정 복구/보안** → RESEARCH.md M-1 (M1-1 비밀번호 재설정 없음/M1-2 이메일 인증 없음/M1-3 brute-force 방어 없음, 전부 [코드만 추가])
  - [x] 비밀번호 재설정(이메일 발송) 플로우 존재 여부 — 없음(AuthController 4개 엔드포인트뿐, SMTP 의존성/설정 0건)
  - [x] 이메일 인증(가입 시 이메일 확인) 존재 여부 — 없음(signup 즉시 토큰 발급, emailVerified 컬럼도 없음)
  - [x] 로그인 시도 제한(brute-force 방어) — 없음(AuthServiceImpl.login 실패 카운트/잠금 로직 전무)
- [x] **(2) 운영/관찰성** → RESEARCH.md M-2 (M2-1 Sentry [신규 인프라 필요], M2-2 구조화 로깅 없음, M2-3 헬스체크 비표준 — 둘 다 [코드만 추가])
  - [x] 에러 모니터링(Sentry 등) 연동 여부 — 없음, pom.xml에 관련 의존성 0건
  - [x] 구조화된 로깅 — 평문 log.warn/error 12곳뿐, MDC/요청ID 체계 없음
  - [x] 헬스체크 엔드포인트 — 표준 Actuator 없음, document/recommend에 임시 health 엔드포인트가 분산되어 있고 railway.toml도 참조 안 함
- [x] **(3) 성능** → RESEARCH.md M-3 (전부 [코드만 추가])
  - [x] N+1 쿼리 — 2건 확인(TeamSpaceServiceImpl.findAll, MessageServiceImpl.findBySpaceId)
  - [x] 페이지네이션 누락 — 목록 엔드포인트 7개 전수 확인, 전부 Pageable 없음
  - [x] 인덱스 누락 — 5곳 확인(team_space_members.user_id/notifications.user_id/places·events·todos.space_id)
- [x] **(4) 안정성** → RESEARCH.md M-4 (M4-1/M4-3 보안 심각도 높음, 전부 [코드만 추가])
  - [x] API 레이트리밋 — 없음. **추가 발견(M4-1): `/api/recommend`가 인증(@SecurityRequirement/SecurityConfig)조차 없이 permitAll — 비용 발생 AI 엔드포인트가 무인증+무제한으로 열려있음(비용 공격 가능). → 조사 완료 즉시 오케스트레이터가 트리아지를 기다리지 않고 긴급 수정+배포 완료(커밋 1850d43, REVIEW.md APPROVED). 이번 사이클 "4. 개발" 대상에서 제외(이미 완료됨).**
  - [x] 입력값 검증/sanitization 공백 — MyBatis `${}` 사용 0건(SQLi 경로 없음, 안전). DTO 검증 공백 3곳(Todo.title/Event.description/Message.content 길이제한 없음). **추가 발견: Apify/Gemini API 키가 URL 쿼리스트링으로 전송되고, 특정 예외 경로에서 그 키가 포함된 메시지가 로그+클라이언트 응답에 그대로 노출될 수 있는 경로 존재**
  - [x] 아바타 외 입력 경로 크기/타입 제한 — todo/event/chat 3곳 공백 확인(위와 동일)
- [x] **(5) 데이터 보호** → RESEARCH.md M-5 (M5-1, [코드만 추가])
  - [x] 민감정보(비밀번호/토큰) 로깅 여부 — 직접적인 비밀번호/토큰 로깅은 없음(GlobalExceptionHandler/LoginRequest·SignupRequest/JwtAuthenticationFilter 확인). 단 (4)에서 발견한 API 키 노출 경로는 이 항목과 같은 근본 수정으로 해소됨
  - [x] (제외) 백업 전략 — 지시대로 조사 대상에서 제외
- [x] **(6) 테스트** → RESEARCH.md M-6 (M6-1, [코드만 추가])
  - [x] 현재 테스트 커버리지 상태 재확인 — "테스트 프로젝트 없음" 여전히 사실. 백엔드는 test scope 의존성(JUnit5/MockMvc)은 이미 있으나 src/test 0파일, web/mobile은 테스트 프레임워크 의존성 자체도 0건
- [x] **(7) 문서/운영** → RESEARCH.md M-7 (M7-1 [코드만 추가], M7-2 해당없음에 가까움)
  - [x] API 문서(Swagger/OpenAPI) 존재 여부 — springdoc 의존성 있음. **추가 발견: swagger-ui는 명시적으로 꺼져있지만(enabled:false) 원본 스펙 JSON(/v3/api-docs)은 SecurityConfig에서 permitAll로 공개돼 있어 의도와 실제 설정이 어긋남**
  - [x] CI/CD 파이프라인 존재 여부 — `.github/workflows/` 없음(obsidian 서브모듈 제외). railway.toml/vercel.json은 빌드·배포 설정일 뿐 테스트/린트 게이트 없음, healthcheckPath도 없음

- [x] 외부 서비스(SMTP, Sentry, Redis 등) 연동이 필요한 항목은 "코드만 추가하면 되는지" vs "신규 인프라/계약이 필요한지" 구분해 표시 — M요약 표에 전부 표시(Sentry만 [신규 인프라/계약 필요], 나머지는 [코드만]. 레이트리밋/brute-force의 IP기반 확장만 Redis 의존 성격으로 별도 메모)
- [x] 조사 결과를 RESEARCH.md에 새 섹션("## M. 상용화 기반 조사")으로 추가 — A~L 보존

### 2. 목록 / 우선순위 확정 (Triage)
- [x] 발견 항목 전체를 목록화 (카테고리별) — M4-1은 이미 별도 긴급수정 완료되어 아래 분류에서 제외, 나머지 13건 분류
- [x] 영향도(장애/보안사고 가능성) × 구현비용 × 의존관계(외부 서비스 필요 여부) 평가
- [x] "이번 사이클 후보" vs "외부 서비스 필요(백로그)" vs "운영 정책 필요" 로 구분
- [x] 우선순위 표 작성, 큰 항목(M6-1, M3-1, M3-3)은 세부 작업으로 분해

#### 이미 처리 완료 (트리아지 제외)
- **M4-1** — `/api/recommend` 무인증+레이트리밋 없음(비용 공격 가능). 조사 완료 직후 오케스트레이터가 별도로 즉시 긴급 수정+배포(커밋 1850d43, REVIEW.md APPROVED). 아래 목록·"4. 개발"에는 포함하지 않음.

#### 외부 서비스 필요 (백로그 — 계정 가입/키 발급 선행)

| ID | 항목 | 비고 |
|----|------|------|
| M2-1 | 에러 모니터링(Sentry 등) | Sentry 등 SaaS 가입 + DSN 키 발급이 선행되어야 함. 코드(SDK 연동)는 간단하나 "계약" 단계가 있어 이번 사이클 범위 밖, 키 발급 후 별도 진행 |

#### 운영 정책 필요
- 해당 없음 — M 섹션 13건(M4-1 제외) 전부 [코드만 추가]로 분류되어 운영 정책 선결이 필요한 항목 없음. (참고: M1-3의 IP 기반 레이트리밋 확장은 Redis 의존 성격이라 "외부 서비스"에 가까우나, 계정 잠금만으로도 핵심 방어가 되므로 범위를 좁혀 아래 "이번 사이클 후보"에 포함)

#### 이번 사이클 후보 (전부 [코드만 추가], 영향도 순)

| 순위 | ID | 항목 | 영향도 | 구현비용 |
|----|----|------|--------|----------|
| 1 | M4-3 | API 키(Apify/Gemini) 쿼리스트링 노출 — 특정 실패 경로에서 로그/응답에 키 노출 | 중간~높음 (보안, 키 유출) | 낮음 |
| 2 | M3-3 | 인덱스 누락 5곳 | 중간 (성장 시 급격히 체감) | 낮음 (마이그레이션 1개) |
| 3 | M1-3 | 로그인 brute-force 방어 없음 (계정 잠금) | 중간 | 낮음~중간 |
| 4 | M3-1 | N+1 쿼리 2건 | 중간 (홈화면/채팅 흔한 경로) | 낮음~중간 |
| 5 | M7-1 | `/v3/api-docs` 공개 설정 불일치 (의도와 실제 설정 어긋남) | 중간 (정보노출) | 매우 낮음 |
| 6 | M4-2 | DTO 길이 제한 공백 3곳 (Todo.title/Event.description/Message.content) | 낮음~중간 | 낮음 |
| 7 | M1-1/M1-2 | 비밀번호 재설정 + 이메일 인증 없음 | 중간 (상용 필수 기능) | 중간 (SMTP 계정 발급 필요, 계약 아님) |
| 8 | M3-2 | 페이지네이션 누락 (목록 엔드포인트 7개) | 낮음 (현재 데이터량 적음) | 중간 |
| 9 | M2-3 | 헬스체크 표준화 안 됨 (Actuator 없음, 임시 엔드포인트 2개 분산) | 낮음~중간 | 낮음 |
| 10 | M2-2 | 구조화 로깅 없음 (MDC/요청ID 없음) | 낮음 | 낮음~중간 |
| 11 | M6-1 | 테스트 0건 | 낮음 (즉시 장애 아니나 회귀 위험 누적) | 중간~높음 (세분화 참조) |
| 12 | M7-2 | CI/CD 없음 | 낮음~중간 | 낮음 (단, M6 진행 상황에 의존) |
| 13 | M5-1 | 민감정보 로깅 — 직접 로깅은 없음, M4-3과 동일 근본 수정으로 해소 | - | M4-3에 포함 (중복 작업 아님) |

각 항목 대상 파일/구현 방향 (큰 항목은 세부 작업으로 분해):

- **[1] M4-3** — 대상: `InstagramReelsCollector.java:100-101`, `AiServiceImpl.java`(Gemini 호출 catch 블록). 방향: `catch (Exception e)`에서 `e.getMessage()`를 그대로 쓰지 않고 고정 안전 문구로 치환, `log.error`는 유지하되 로그에도 원본 메시지 대신 요약만 남기거나 별도 마스킹. (M5-1은 이 수정으로 함께 해소 — 별도 작업 불필요)
- **[2] M3-3** — 대상: 신규 마이그레이션(`V17__add_missing_indexes.sql`, 착수 시점 디렉터리 재확인 필요). 방향: `team_space_members.user_id`, `notifications.user_id`, `places.space_id`, `events.space_id`, `todos.space_id`에 `CREATE INDEX` 추가.
- **[3] M1-3** — 대상: `AuthServiceImpl.login()`. 방향: 실패 횟수 컬럼(`users.failed_login_count`, `locked_until` 등) 추가하는 신규 마이그레이션 + 로그인 실패 시 카운트 증가, 임계값 초과 시 일정 시간 잠금. IP 기반 확장은 범위 제외(Redis 의존 성격, 별도 검토).
- **[4] M3-1** — 대상: `TeamSpaceServiceImpl.findAll()`, `MessageServiceImpl.findBySpaceId()`. 방향: `TeamSpaceMapper`/`UserMapper`에 `IN` 절 기반 배치 조회 메서드 추가해 N+1을 1+1로 축소.
- **[5] M7-1** — 대상: `apps/api-spring/src/main/resources/application.yml`, `SecurityConfig.java`. 방향: `/v3/api-docs`, `/v3/api-docs/**`를 `permitAll()`에서 제외(또는 swagger-ui와 함께 완전히 비활성화 — 워커가 운영 의도에 맞게 판단).
- **[6] M4-2** — 대상: `CreateTodoRequest`/`UpdateTodoRequest`(`@Size(max=255)` 추가), `CreateEventRequest.description`(길이 제한 추가), `SendMessageRequest.content`(길이 제한 추가). 방향: DB 컬럼 타입과 일치하는 `@Size` 애너테이션 추가.
- **[7] M1-1/M1-2** — 범위가 커서 세부 분해:
  - **7-a**: `pom.xml`에 `spring-boot-starter-mail` 추가, `application.yml`에 SMTP 설정 키 추가(값은 환경변수 플레이스홀더).
  - **7-b**: 비밀번호 재설정 — 신규 마이그레이션(재설정 토큰 테이블 또는 `users`에 컬럼 추가) + `AuthController`에 "재설정 요청"/"재설정 확인" 엔드포인트 2개 + 이메일 발송 서비스.
  - **7-c**: 이메일 인증 — `users.email_verified` 컬럼 추가(7-a와 같은 마이그레이션에 포함 가능) + 가입 시 인증 메일 발송 + 인증 확인 엔드포인트. 미인증 계정의 기능 제한 여부(로그인 자체를 막을지, 일부 기능만 제한할지)는 워커가 제품 상식선에서 기본값(로그인은 허용, 추후 필요시 제한) 정하고 플래너에게 보고.
- **[8] M3-2** — 대상: `DocumentController`, `MessageController`, `EventController`, `NotificationController`, `PlaceController`, `TeamSpaceController`, `TodoController`의 목록 조회 엔드포인트 7개. 방향: `Pageable` 파라미터 추가 + 각 Mapper에 `LIMIT/OFFSET` 반영(프런트 호출부도 기본 페이지 크기로는 영향 없게 유지, 무한스크롤 등 UI 변경은 범위 밖).
- **[9] M2-3** — 대상: `pom.xml`(`spring-boot-starter-actuator` 추가), `railway.toml`(`healthcheckPath` 지정). 방향: 표준 `/actuator/health`로 통일, 기존 `DocumentController`/`RecommendController`의 임시 health 엔드포인트는 유지하거나 제거는 워커 판단(최소 변경 원칙상 유지 추천).
- **[10] M2-2** — 대상: 신규 `OncePerRequestFilter`(요청ID를 MDC에 주입), `logback-spring.xml`(로그 패턴에 MDC 요청ID 포함). 방향: 기존 12곳의 `log.*` 호출 자체는 손대지 않고(범위 밖), 공통 필터만 추가해 모든 로그 라인에 요청ID가 자동으로 붙게.
- **[11] M6-1** — 범위가 커서 세부 분해:
  - **11-a (백엔드, 의존성 이미 있음)**: 핵심 경로(인증 로그인/리프레시, Place 멤버십 체크, Notification 생성/설정 억제 로직) 위주로 `src/test`에 단위/통합 테스트 작성 시작. 전체 커버리지를 목표로 하지 않고 지난 사이클들에서 버그가 실제로 발생했던 지점(리프레시 토큰, 멤버십 체크, 알림 억제) 우선.
  - **11-b (웹)**: 테스트 프레임워크(Vitest + React Testing Library 등) 설치·설정부터 시작, 핵심 컴포넌트 1~2개로 파일럿.
  - **11-c (모바일)**: 동일하게 프레임워크 설치부터 시작, 파일럿 1~2개.
  - (11-a~11-c 모두 "설치/설정 + 파일럿" 수준까지만 이번 사이클 범위로 제안 — 전체 커버리지 확보는 범위가 매우 커서 다음 사이클로 이어가는 것을 권장)
- **[12] M7-2** — 대상: `.github/workflows/ci.yml` 신규. 방향: 이번 사이클에서 11-a~c로 테스트가 일부 생기면 그걸 실행하는 게이트 + 빌드/린트 체크만이라도 추가(M6 진행과 병행, 완전한 게이트는 다음 사이클).

**플래너 종합 추천**: [1]~[6](보안/성능 "코드만" 소규모 항목)을 1차 묶음으로 가장 먼저 처리 추천. [7](비밀번호 재설정/이메일 인증)은 SMTP 계정 발급이 필요해 착수 전 사용자가 발신 이메일 계정을 준비할 시간이 필요— 범위 포함 여부와 별개로 "언제 착수할지"를 사용자와 맞출 것. [11]/[12](테스트/CI)는 설치+파일럿 수준으로 범위를 좁혀서 제안했으나, 그래도 다른 항목보다 비용이 커서 포함 여부를 한 번 더 확인 추천. [8](페이지네이션)은 지금 당장 체감 장애가 없는 항목이라 이번 사이클 제외하고 다음으로 미루는 것도 합리적 — 사용자 선택에 맡기는 것을 추천. M2-1(Sentry)은 외부 서비스 백로그로 분류되어 이번 범위에서 자동 제외.

### 3. 사용자 컨펌 (오케스트레이터)
- [x] 우선순위 목록을 사용자에게 제시, 이번 사이클 개발 범위 확정
- [x] 사용자 답변:
  - **묶음 A**(M4-3/M3-3/M1-3/M3-1/M7-1/M4-2, 6건) — **진행**
  - **묶음 C**(M6-1/M7-2, 테스트+CI 설치/파일럿 수준) — **진행**
  - **묶음 B**(M1-1/M1-2, 비밀번호 재설정/이메일 인증) — **제외, 백로그 — SMTP 이메일 계정 준비 후 재개**
  - **묶음 D**(M3-2, 페이지네이션) — **제외, 백로그 — 데이터량 증가 시 재검토**
  - **(추가 확인)** M2-3(헬스체크 표준화)/M2-2(구조화 로깅)는 당초 네 묶음 어디에도 명시되지 않아 플래너가 재확인 — **묶음 A에 포함해서 이번 사이클에 함께 진행**하기로 확정
- [x] 외부 서비스 계약/키 발급이 필요한 항목(M2-1 Sentry)은 이번 컨펌 대상에서도 별도 백로그로 유지(변경 없음)
- [x] 컨펌 완료 — "4. 개발" 섹션 채움

### 4. 개발 (Development)
_(사용자 컨펌: 묶음 A + 묶음 C만 진행. 묶음 B/D는 백로그.)_

#### 묶음 A — 보안/성능/운영 "코드만" 소규모 항목 (8건)
- [x] [A1] M4-3 — API 키(Apify/Gemini) 쿼리스트링 노출 수정. 대상: `InstagramReelsCollector.java:100-101`, `AiServiceImpl.java`(Gemini 호출 catch 블록). 방향: `catch (Exception e)`에서 `e.getMessage()`를 그대로 쓰지 않고 고정 안전 문구로 치환(M5-1도 이 수정으로 함께 해소, 별도 작업 불필요).
- [x] [A2] M3-3 — 인덱스 누락 5곳. 대상: 신규 마이그레이션(착수 시점 `db/migration/` 디렉터리 재확인 후 다음 번호 배정). 방향: `team_space_members.user_id`, `notifications.user_id`, `places.space_id`, `events.space_id`, `todos.space_id`에 `CREATE INDEX` 추가.
- [ ] [A3] M1-3 — 로그인 brute-force 방어(계정 잠금). 대상: `AuthServiceImpl.login()` + 신규 마이그레이션(`users.failed_login_count`, `locked_until` 등). 방향: 실패 횟수 증가, 임계값 초과 시 일정 시간 잠금. IP 기반 확장은 범위 제외.
- [ ] [A4] M3-1 — N+1 쿼리 2건. 대상: `TeamSpaceServiceImpl.findAll()`, `MessageServiceImpl.findBySpaceId()`. 방향: `TeamSpaceMapper`/`UserMapper`에 `IN` 절 기반 배치 조회 메서드 추가.
- [ ] [A5] M7-1 — `/v3/api-docs` 공개 설정 불일치. 대상: `application.yml`, `SecurityConfig.java`. 방향: `/v3/api-docs`, `/v3/api-docs/**`를 `permitAll()`에서 제외(또는 swagger-ui와 함께 완전 비활성화 — 워커 판단).
- [ ] [A6] M4-2 — DTO 길이 제한 공백 3곳. 대상: `CreateTodoRequest`/`UpdateTodoRequest`(`@Size(max=255)`), `CreateEventRequest.description`, `SendMessageRequest.content`. 방향: DB 컬럼 타입과 일치하는 `@Size` 애너테이션 추가.
- [ ] [A7] M2-3 — 헬스체크 표준화. 대상: `pom.xml`(`spring-boot-starter-actuator` 추가), `railway.toml`(`healthcheckPath` 지정). 방향: 표준 `/actuator/health`로 통일, 기존 `DocumentController`/`RecommendController`의 임시 health 엔드포인트는 유지(최소 변경 원칙).
- [ ] [A8] M2-2 — 구조화 로깅. 대상: 신규 `OncePerRequestFilter`(요청ID를 MDC에 주입), `logback-spring.xml`(로그 패턴에 MDC 요청ID 포함). 방향: 기존 12곳의 `log.*` 호출 자체는 손대지 않고 공통 필터만 추가.

#### 묶음 C — 테스트 + CI (설치/파일럿 수준)
- [ ] [C1=11-a] M6-1 백엔드 — 핵심 경로(인증 로그인/리프레시, Place 멤버십 체크, Notification 생성/설정 억제 로직) 위주 단위/통합 테스트 작성. 대상: `apps/api-spring/src/test`(의존성은 이미 있음).
- [ ] [C2=11-b] M6-1 웹 — 테스트 프레임워크(Vitest + React Testing Library 등) 설치·설정, 핵심 컴포넌트 1~2개 파일럿.
- [ ] [C3=11-c] M6-1 모바일 — 동일 프레임워크 설치·설정, 파일럿 1~2개.
- [ ] [C4=12] M7-2 — CI 파이프라인. 대상: `.github/workflows/ci.yml` 신규. 방향: C1~C3에서 생긴 테스트를 실행하는 게이트 + 빌드/린트 체크 추가.

#### 백로그 (이번 사이클 제외)
- **묶음 B — M1-1/M1-2** (비밀번호 재설정/이메일 인증): **백로그 — SMTP 이메일 계정 준비 후 재개.** 세부 분해(7-a SMTP 설정/7-b 비밀번호 재설정/7-c 이메일 인증)는 RESEARCH.md "M 요약" 및 지난 트리아지 기록 참조.
- **묶음 D — M3-2** (페이지네이션 누락): **백로그 — 데이터량 증가 시 재검토.** 현재 데이터량이 적어 체감 장애 없음이 조사에서 확인됨(RESEARCH.md M-3 참조).

### 5. 검토 (Review)
- [ ] 각 묶음에 대해 REVIEWER가 REVIEW.md에 APPROVED / CHANGES REQUESTED 기록
- [ ] CHANGES REQUESTED 항목은 WORKER가 재작업 후 재검토

### 6. 완료보고
- [ ] 전체 개발 완료 후, 옵시디언 완료보고서 작성 여부를 사용자에게 확인

---

## 과거 기록 — 정책/백로그 미결 항목 확정 구현 (2026-11-10, 완료)

### 1~2. 조사 / 목록·우선순위
- [x] 해당 없음 — 이번 사이클은 지난 세 사이클(RESEARCH.md D/E/G/H)에서 이미 조사·분류를 마친 "정책 미결 5건 + 백로그 3건"을 오케스트레이터가 사용자 컨펌받아 확정한 결론을 그대로 구현하는 사이클. 조사·재분류 불필요.

### 3. 사용자 컨펌 (오케스트레이터)
- [x] 오케스트레이터가 사용자에게 직접 확인·승인받은 것으로 간주. 확정 결론(PLAN.md 표 참조):
  - 모바일 실제 지도 — **제외**(Google Maps API 키 없음)
  - G3-3 관리자 권한 — **제외**(구체 admin 기능 없어 인프라만 만드는 건 무의미)
  - H3-10 Pro 업그레이드 — **축소**("준비중" 비활성화)
  - H3-11 계정 탈퇴 — **구현**(소프트 삭제, 보관기간/법적 문구 플레이스홀더)
  - E2 장소 공개동의 — **구현**(체크박스+DB만, 약관 문구 플레이스홀더)
  - 설정-알림 aiRecommend — **축소**("준비중" 비활성화)
  - E1+G3-2 비슷한 장소 추천 — **옵션 B 채택**(places 전용 embedding 컬럼, documents/recommend 독립)
- [x] 컨펌 완료 — "4. 개발" 섹션 채움

### 4. 개발 (Development)
_(확정된 6개 항목을 묶음 A~D로 분해. 마이그레이션 파일 번호는 워커가 착수 시점 기준 다음 번호로 순서 배정)_

#### 묶음 A — 비활성화/축소 처리 (백엔드 변경 없음, 가장 단순)
- [x] [A1] H3-10 "Pro로 업그레이드" 버튼 "준비중" 처리 — 대상: `apps/web/src/domains/dashboard/components/SettingsScreen.tsx:270-272`. 방향: 버튼 `disabled` + 라벨/툴팁에 "준비중" 표시로 변경(결제 로직 없음). 모바일에 동일 UI가 있는지 확인 후 있으면 동일 처리.
- [x] [A2] 설정-알림 aiRecommend 토글 "준비중" 처리 — 대상: 웹 `SettingsScreen.tsx`(알림설정 탭 aiRecommend 토글), 모바일 `NotificationSettingsModal.tsx`. 방향: 토글을 `disabled` + "준비중" 설명 추가(저장/조회 로직은 그대로 두고 UI만 비활성화 — 기존 값 변경 불가하게).

#### 묶음 B — 계정 탈퇴 (소프트 삭제)
- [x] [B1] DB 마이그레이션 — `users` 테이블에 `is_deleted`(boolean, default false), `deleted_at`(timestamp, nullable) 컬럼 추가. 대상: `apps/api-spring/src/main/resources/db/migration/V14__add_user_soft_delete.sql` (⚠️ 현재 최신은 V13`__enable_rls_remaining_tables.sql`(커밋 a13c07f) — 워커는 착수 시점에 `db/migration/` 디렉터리를 다시 확인해 실제 다음 번호로 파일명 조정)
- [x] [B2] 백엔드 탈퇴 엔드포인트 — `DELETE /api/user/account`(또는 동급) 신설. 대상: `UserController`/`UserService`/`UserServiceImpl`. 방향: 본인 확인(JWT) 후 `is_deleted=true`,`deleted_at=now()` 세팅 + 해당 사용자의 refresh token 전체 무효화(기존 `RefreshTokenMapper` 삭제/만료 처리 재사용). "보관 후 실제 삭제" 배치 작업은 이번 사이클에서 실제 스케줄러까지 구현할지, 설계만 남길지 착수 전 비용 확인 후 플래너에게 보고.
- [x] [B3] 로그인 가드 — 탈퇴 계정 로그인 차단. 대상: `AuthServiceImpl`(로그인 처리 로직). 방향: `is_deleted=true`인 계정은 로그인 시도 시 거부(적절한 ErrorCode 신규).
- [x] [B4] 프런트 연동 — 대상: 웹 `SettingsScreen.tsx:281-283`("계정 탈퇴" 버튼). 방향: 확인 모달(경고 문구는 플레이스홀더 텍스트) → 탈퇴 API 호출 → 로그아웃 처리(`clearAuth`/`clearSession`) + 로그인 페이지 리다이렉트. 모바일에 동일 UI 필요 여부 확인 후 있으면 동일 패턴 추가.

#### 묶음 C — 장소 공개동의 저장
- [x] [C1] DB 마이그레이션 — `places` 테이블에 `consent_given`(boolean, default false), `consent_at`(timestamp, nullable) 컬럼 추가. 대상: `apps/api-spring/src/main/resources/db/migration/V15__add_place_consent.sql`(B1 이후 번호, 실제 번호는 착수 시점 디렉터리 기준 재확인)
- [x] [C2] 백엔드 연동 — 대상: `PlaceController`/`PlaceService`/`PlaceServiceImpl`(B1 사이클에서 신설된 `update` 엔드포인트). 방향: 기존 `PATCH /api/places/{id}`에 consent 필드 포함하거나 전용 서브 리소스로 분리(워커 판단), 기존 멤버십 체크 패턴 재사용.
- [x] [C3] 모바일 연동 — 대상: `apps/mobile/src/features/travel/PlaceDetailScreen.tsx:230`(onConsent). 방향: TODO 콜백을 실제 API 호출로 연결, 동의 체크박스 UI 추가(약관 문구는 플레이스홀더 상수로 분리해 추후 교체 쉽게 — 예: `CONSENT_PLACEHOLDER_TEXT`).

#### 묶음 D — "비슷한 장소" 추천 (옵션 B: places 전용 embedding, 범위가 커서 세분화)
- [x] [D1] DB 마이그레이션 — `places` 테이블에 `embedding vector(1536)` 컬럼 추가(pgvector, documents 테이블과 무관). 대상: `apps/api-spring/src/main/resources/db/migration/V16__add_place_embedding.sql`(C1 이후 번호, 실제 번호는 착수 시점 디렉터리 기준 재확인) — **신규 테이블이므로 V13 RLS 커밋 패턴대로 `places`는 이미 RLS가 걸려있음(V12), 이 컬럼 추가는 RLS 정책과 무관하게 동작함을 워커가 확인**
- [x] [D2] 임베딩 생성 로직 — 장소 추가(`add`)/수정(`update`) 시 이름+설명 등 텍스트로 임베딩 API(OpenAI/Gemini, 기존 `recommend`/`ai` 도메인에 이미 있는 임베딩 호출 클라이언트 재사용 가능한지 먼저 확인) 호출 후 `embedding` 컬럼에 저장. 대상: `PlaceServiceImpl.add/update`. 방향: 알림 생성([6-a]) 패턴처럼 best-effort로 처리(임베딩 실패해도 장소 저장 자체는 성공) — 동기/비동기 여부는 워커가 기존 OpenAI 클라이언트 응답 지연시간 확인 후 결정.
- [x] [D3] 유사도 검색 쿼리 — pgvector cosine distance(`<=>`) 기반 `findSimilarPlaces(placeId, limit)` 신설. 대상: `PlaceMapper`(인터페이스)+`PlaceMapper.xml`. 방향: 자기 자신 제외, 임베딩이 없는 장소(NULL)는 결과/대상에서 제외, 검색 범위(같은 팀스페이스 한정 vs 전체 장소)는 워커가 제품 상식선에서 기본값(전체 장소 중 유사도 top N) 정하고 플래너에게 보고.
- [x] [D4] 백엔드 엔드포인트 — `GET /api/places/{id}/similar` 신설. 대상: `PlaceController`/`PlaceService`/신규 응답 DTO(`SimilarPlaceResponse`). 방향: 기존 Place 조회와 동일한 멤버십 체크 패턴 적용.
- [x] [D5] 모바일 연결 — 대상: `apps/mobile/src/features/travel/components/PlaceSimilarSection.tsx:10`(`similar={[]}` 하드코딩 제거). 방향: `GET /api/places/{id}/similar` 실연동, 로딩/빈 상태(유사 장소 없음) 처리.

### 5. 검토 (Review)
- [x] 각 묶음에 대해 REVIEWER가 REVIEW.md에 APPROVED / CHANGES REQUESTED 기록 — 묶음 A/B/C/D 전체 완료, 전부 APPROVED(묶음 B의 refresh() TOCTOU 1건만 CHANGES REQUESTED → 재작업 후 APPROVED)
- [x] CHANGES REQUESTED 항목은 WORKER가 재작업 후 재검토 — 묶음 B: AuthServiceImpl.refresh()에 isDeleted 가드 추가(커밋 ff2f1f6) 후 재검토 APPROVED

### 6. 완료보고
- [x] 전체 개발 완료 후, 옵시디언 완료보고서 작성 여부를 사용자에게 확인 — 작성 승인받아 `03_WorkResults/2026-11-10-policy-backlog-resolution.md` 생성 완료

---

## 과거 기록 — 전면 UI 동작 검토 + 실구현 (2026-11-06, 완료)

### 1. 조사 (Research)
- [x] **(1) 백로그 재검토** — 지난 사이클 RESEARCH.md "G 요약" 백로그 5건 재확인·구현 난이도 재평가:
  - [x] G3-2: documents(pgvector) 자동 적재 파이프라인 — place/url-parser 저장 시 임베딩 연동 설계 재검토 → 변화 없음 확인, 옵션 A(documents 재사용)/B(places 전용 embedding 컬럼) 2가지 설계안 제시(정책 아닌 엔지니어링 결정)
  - [x] G2-1: documents 관리 UI — G3-2 결론에 따라 범위 재확정 → G3-2 결론에 종속, 선행 결정 필요
  - [x] G3-3: `users.role` 활용(관리자 기능) — 정책 성격 여부 재확인 → **정책 결정 선행 필요**로 표시
  - [x] E1: PlaceSimilarSection "비슷한 장소" — 백엔드 유사도 추천 API 설계 난이도 재확인 → 변화 없음 확인, G3-2와 동일 옵션에 종속
  - [x] E2: PlaceDetailScreen onConsent — 저장이 왜 안 되는지, 정책(동의 문구/철회/보관기간) 미결 여부 재확인 → 변화 없음 확인, **정책 결정 선행 필요**로 표시(초안 작성 안 함)
- [x] **(2) 설정-알림 매핑 공백 재검토** — `aiRecommend` 설정 토글(대응 알림 없음, **정책/제품 결정 필요**로 표시) / `chat` 알림 on/off UI 부재(엔지니어링 갭, 정책 아님 — 구현 경로 명확)
- [x] **(3) 전체 코드베이스 신규 스윕** (지난 두 사이클에서 다룬 항목 제외, 신규만) — web/mobile 전 도메인:
  - [x] onClick/onPress 없는/빈 버튼 → 모바일 TouchableOpacity 54곳 전수조사 0건, 웹에서 신규 11건 발견(H3-1~H3-13, 일부 정책 필요)
  - [x] `console.log`만 찍고 끝나는 핸들러 → AiScreen "AI 추천 추가" 버튼(H3-1) 1건
  - [x] "준비중" 토스트로 때우는 버튼 → 기존 Toast "준비중" fallback은 전부 도달 불가능한 죽은 분기로 확인(신규 없음)
  - [x] 로컬 state만 바꾸고 서버 미반영 액션 → 검색창 4곳(H3-6), 스페이스 설정 탭(H3-7) 등
- [x] 정책 성격 섞인 항목(E2, G3-3 등)은 조사 결과에 **"정책 결정 선행 필요"**로 별도 표시 (임의로 정책 결정 금지) → 총 5건(aiRecommend, H3-10 Pro업그레이드, H3-11 계정탈퇴, E2, G3-3) 표시 완료
- [x] 조사 결과를 RESEARCH.md에 새 섹션("## H. 전면 UI 동작 재조사")으로 추가 — A~G 보존

### 2. 목록 / 우선순위 확정 (Triage)
- [x] 발견 항목 전체를 목록화 (도메인별, 지난 사이클 항목과 중복 제거) — RESEARCH.md "H 요약" 표 기준
- [x] 영향도 × 구현비용 × 의존관계 + "정책 선행 필요 여부" 평가
- [x] "이번 사이클 후보" vs "백로그(설계 선택 필요)" vs "정책 미결(보류)" 3분류로 구분
- [x] 우선순위 표 작성

#### 정책 미결 (보류 — 이번 사이클 개발 대상에서 제외, 임의 구현 금지)

| ID | 항목 | 비고 |
|----|------|------|
| 설정-알림 aiRecommend | AI 추천 알림 설정 토글이 대응 알림 없는 죽은 설정 | **제품 결정 필요.** 선택지만 제시: (1) 토글 제거 (2) "준비중" 배지로 비활성 표시 (3) AI 추천 알림 트리거를 새로 정의해 구현 — 어느 쪽인지 결정 전까지 보류 |
| H3-10 | "Pro로 업그레이드" 버튼 (`SettingsScreen.tsx:270-272`) | **상품/결제 정책 필요.** 유료 플랜 운영 여부·가격·차등 기능 자체가 미정 |
| H3-11 | "계정 탈퇴" 버튼 (`SettingsScreen.tsx:281-283`) | **법적/개인정보 정책 필요.** 처리 절차·보관기간·소프트삭제 여부 등 법적 요건 선행 필요 |
| E2 | PlaceDetailScreen onConsent (mobile) | **법적/약관 정책 필요.** 동의 문구/범위/철회/보관기간 — 정책 초안도 작성하지 않음(법무/사용자 확인 선행) |
| G3-3 | `users.role` → 관리자 기능 | **운영 정책 필요.** 누가 관리자인지, 어떤 권한을 갖는지 결정 전까지 보류 |

#### 백로그 (설계 선택 필요 — 개발은 가능하나 사용자가 옵션을 먼저 골라야 함)

| ID | 항목 | 옵션 A | 옵션 B |
|----|------|--------|--------|
| G3-2 | documents(pgvector) 자동 적재 파이프라인 | **장소 저장 시 `DocumentService.create()` 호출** — 기존 `/api/recommend` 벡터검색 인프라 재사용. 단, `documents`에 `place_id` 연결 컬럼이 없어 신규 마이그레이션 필요(장소 수정/삭제 시 동기화 로직도 필요) | **`places` 테이블에 전용 `embedding` 컬럼 신설** — documents/recommend와 완전히 독립적인 유사도 검색. 장소 CRUD 생명주기와 자동 일치(삭제=끝)하지만 검색 경로가 하나 더 생김 |
| E1 | PlaceSimilarSection "비슷한 장소" (mobile) | G3-2가 옵션 A면 documents 벡터검색을 "현재 장소와 유사한 것"으로 필터링해 재사용 | G3-2가 옵션 B면 places 임베딩 컬럼 기반 유사도 쿼리로 구현 |
| G2-1 | documents 관리 UI | G3-2가 옵션 A면: 장소 추가 시 자동 생성이 주 경로가 되어, 관리 UI는 운영자가 예외적으로 콘텐츠를 보강할 때만 쓰는 부가 기능으로 범위 축소 | G3-2가 옵션 B면: documents를 채울 다른 소스가 없는 한 관리 UI 필요성 자체가 낮음 — 사실상 보류 |

(추가로 G3-2 양쪽 옵션 모두 "저장 시 임베딩 API를 동기/비동기로 호출할지"는 별도 설계 결정이 필요 — 옵션 선택 시 같이 확인)

#### 이번 사이클 후보 (영향도 × 구현비용 기준 우선순위, 정책/설계 미결 항목 제외)

| 순위 | ID | 항목 | 영향도 | 구현비용 |
|----|----|------|--------|----------|
| 1 | H3-6 | 헤더/사이드바 검색창 4곳 장식용 → 실연동 | 높음 | 낮음 |
| 2 | H3-2 | "여행 드롭다운" 스페이스 전환 죽음 | 높음 | 낮음~중간 |
| 3 | H3-1 | AI 추천 "추가" 버튼이 콘솔만 찍고 끝남(기만적 UI) | 중간~높음 | 낮음 |
| 4 | H3-3 | 헤더 알림 벨 아이콘 onClick 없음(중복 UI) | 중간 | 매우 낮음 |
| 5 | H3-9 | 가입일 하드코딩(`2025.01.01`) | 낮음 | 매우 낮음 |
| 6 | H3-12 | 랜딩 "서비스 둘러보기" CTA onClick 없음 | 낮음 | 매우 낮음 |
| 7 | 설정-알림 chat | 채팅 알림 on/off 토글 UI 부재(메커니즘은 이미 있음) | 낮음~중간 | 낮음 |
| 8 | H3-7 | SettingsScreen "여행 스페이스" 탭 저장/삭제 미연동 | 중간 | 낮음 |
| 9 | H3-5 | 스페이스 제목 옆 설정 기어 아이콘 onClick 없음 | 낮음 | 낮음 (H3-7 종속) |
| 10 | H3-14 | 모바일 알림 모달 읽음/삭제 기능 없음(웹엔 있음) | 중간 | 낮음 |
| 11 | H3-4 | "더보기"류 링크 4개 onClick 없음 | 낮음~중간 | 낮음~중간 |
| 12 | H3-13 | 지도 마커 팝업 "자세히보기" onClick 없음 | 낮음 | 낮음~중간 (웹에 장소 상세 화면 자체가 없음 — 의존관계 있음) |
| 13 | H3-8 | 프로필 "사진 변경" 버튼 미구현 | 낮음 | 중간 (신규 업로드 인프라 설계 필요 — 후보 중 비용 최대) |

각 항목 대상 파일/구현 방향:

- **[1] H3-6** — 대상: `DashboardLayout.tsx:140-144`, `DashboardScreen.tsx:672-676`, `CalendarScreen.tsx:222-226`, `TravelMapScreen.tsx:146-150`. 방향: `AiScreen.tsx:414-418`(이미 동작하는 `value`/`onChange` 패턴)을 참고해 각 화면에 맞는 검색 상태·필터링 추가(화면마다 검색 대상이 달라 개별 구현 필요).
- **[2] H3-2** — 대상: `DashboardLayout.tsx:65`, `DashboardScreen.tsx:551`. 방향: 기존 `SpaceSwitcher.tsx` 컴포넌트 재사용 가능 여부 먼저 확인 후 onClick 연결, 전역 `store/space.ts`(D1에서 신설된 store) 갱신으로 전환.
- **[3] H3-1** — 대상: `AiScreen.tsx:310-314`, `:532-535`. 방향: `console.log` 자리에 기존 `addPlace` API 연결, 성공 시 버튼 상태 유지·실패 시 "담김" 상태 롤백 + 에러 피드백.
- **[4] H3-3** — 대상: `DashboardScreen.tsx:678-685`. 방향: onClick에 `/dashboard/notification` 라우팅 연결(사이드바와 중복이라 아이콘 제거도 대안이나, 연결이 더 간단하고 일관적이라 추천).
- **[5] H3-9** — 대상: `SettingsScreen.tsx:266`. 방향: 하드코딩 문자열을 `getProfile()` 응답의 `createdAt` 필드 바인딩으로 교체.
- **[6] H3-12** — 대상: `LandingHero.tsx:78-80`. 방향: onClick 추가(기능 미리보기 섹션으로 스크롤 이동 등 — 구체 목적지는 구현 중 간단히 정해도 비용 작음, 정책 아님).
- **[7] 설정-알림 chat** — 대상(백엔드): `NotificationServiceImpl.isSuppressedByUserSettings` switch에 `chat` 케이스 추가, 신규 마이그레이션(`V10__add_chat_notification_setting.sql`)으로 컬럼 추가, 설정 조회/저장 응답 확장(`NotificationController`/`UserController` 중 기존 [7-b] 구현부). 대상(웹) `SettingsScreen.tsx` 알림설정 탭, 대상(모바일) `NotificationSettingsModal.tsx`에 토글 UI 추가.
- **[8] H3-7** — 대상: `SettingsScreen.tsx:187-218`. 방향: uncontrolled input(`defaultValue`)을 React state로 전환, "저장" 버튼에 `updateTeamSpace`, "스페이스 삭제" 버튼에 `deleteTeamSpace` 연결(모바일 `SpaceSettingsModal.tsx` 패턴 참고).
- **[9] H3-5** — 대상: `DashboardScreen.tsx:81`. 방향: [8]에서 완성되는 설정 화면/모달로 onClick 연결(또는 `/dashboard/settings` 이동).
- **[10] H3-14** — 대상: `apps/mobile` `NotificationModal.tsx`, `HomeScreen.tsx`. 방향: 기존 `markAsRead`/`deleteNotification` wrapper를 항목 탭/스와이프 핸들러에 연결(웹 `NotificationScreen.tsx`의 `handleRead`/`handleReadAll` 패턴 참고).
- **[11] H3-4** — 대상: `DashboardScreen.tsx:147,189,226,417`. 방향: 각 "더보기"의 이동 대상(일정 전체→`/dashboard/calendar`, 멤버 전체→`/dashboard/member` 등 기존 라우트와 매칭)을 항목별로 확인 후 onClick에 라우팅 연결.
- **[12] H3-13** — 대상: `TravelMapMarkerPopup.tsx:84-89`. 방향: 웹에 모바일 `PlaceDetailScreen`과 동등한 "장소 상세" 화면/모달이 있는지 먼저 확인 — 없으면 신설 범위가 더 커지므로 착수 전 재확인 필요(의존관계 플래그).
- **[13] H3-8** — 대상: `SettingsScreen.tsx:147-149` + 백엔드(파일 업로드 엔드포인트 신설, `UserProfile`에 avatar 필드 추가, 마이그레이션). 방향: 기존 레포에 이미지 업로드 사례가 없어 저장소(S3/Cloudinary 등) 연동부터 신규 설계 필요 — 후보 중 비용이 가장 커서, 사용자 컨펌 시 포함 여부를 한 번 더 확인하는 것을 권장.

**플래너 종합 추천**: [1]~[12]는 "빠른 승리" 묶음(대부분 낮은 비용, H3-2/H3-13만 선행 확인 필요)으로 한 번에 묶어 진행 가능. [13](H3-8, 업로드 인프라)은 비용이 확연히 커서 별도 묶음으로 분리하거나 이번 사이클에서 제외하는 선택지를 사용자에게 함께 제시하는 것을 추천. 백로그(G3-2/E1/G2-1)는 옵션 A/B 중 선택이 먼저 필요하므로 이번 사이클 "개발" 범위에는 포함하지 않는 것을 추천(선택 후 다음 사이클로).

### 3. 사용자 컨펌 (오케스트레이터)
- [x] 우선순위 목록을 사용자에게 제시 (쉬운 설명으로 재정리해서 전달)
- [x] 사용자 답변: **1~13번 전부 포함** (프로필 사진 변경 H3-8 포함). 백로그(G3-2 등, 설계 선택 필요)는 이번 사이클 제외, 다음에 따로 진행.
- [x] H3-8(프로필 사진) 저장 방식 추가 확인: 클라우드 스토리지 미설정 상태라 **DB에 바이너리(base64) 저장** 방식으로 확정(사용자 승인). 추후 트래픽 커지면 S3 등으로 마이그레이션 여지 있음 — 이번 범위는 base64만.
- [x] 정책 미결 5건은 범위 제외 유지(변경 없음)
- [x] 컨펌 완료 — "4. 개발" 섹션 채움

### 4. 개발 (Development)
_(사용자 컨펌: 1~13 전부 포함. 순서대로 진행, 각 묶음 완료 시 리뷰 후 다음 묶음)_

#### 묶음 A — 프런트 단독 빠른 승리 (백엔드 변경 없음)
- [x] [1] H3-6 — 검색창 4곳 실연동: `DashboardLayout.tsx:140-144`, `DashboardScreen.tsx:672-676`, `CalendarScreen.tsx:222-226`, `TravelMapScreen.tsx:146-150` (`AiScreen.tsx:414-418` 패턴 참고)
- [x] [2] H3-2 — "여행 드롭다운" 스페이스 전환 연결: `DashboardLayout.tsx:65`, `DashboardScreen.tsx:551` (기존 `SpaceSwitcher.tsx`/`store/space.ts` 재사용 확인 후 연결)
- [x] [3] H3-1 — AI 추천 "추가" 버튼 실동작: `AiScreen.tsx:310-314`, `:532-535` (`addPlace` API 연결)
- [x] [4] H3-3 — 알림 벨 아이콘 onClick: `DashboardScreen.tsx:678-685` → `/dashboard/notification` 라우팅
- [x] [5] H3-9 — 가입일 하드코딩 제거: `SettingsScreen.tsx:266` → `getProfile().createdAt` 바인딩
- [x] [6] H3-12 — 랜딩 CTA onClick 추가: `LandingHero.tsx:78-80`
- [x] [7] H3-4 — "더보기"류 링크 4개 라우팅 연결: `DashboardScreen.tsx:147,189,226,417`
- [x] [8] H3-13 — 지도 마커 팝업 "자세히보기" 연결: `TravelMapMarkerPopup.tsx:84-89` (웹에 장소 상세 화면 없으면 먼저 확인 — 없으면 간단한 상세 모달 신설)

#### 묶음 B — 저장/삭제 연동 + 플랫폼 격차
- [x] [9] H3-7 — SettingsScreen "여행 스페이스" 탭 실연동: `SettingsScreen.tsx:187-218` (uncontrolled input → state, `updateTeamSpace`/`deleteTeamSpace` 연결, 모바일 `SpaceSettingsModal.tsx` 패턴 참고)
- [x] [10] H3-5 — 스페이스 설정 기어 아이콘 연결: `DashboardScreen.tsx:81` ([9] 완성 후 해당 화면/모달로 연결)
- [x] [11] H3-14 — 모바일 알림 읽음/삭제 기능: `NotificationModal.tsx`, `HomeScreen.tsx` (기존 `markAsRead`/`deleteNotification` wrapper 연결, 웹 `NotificationScreen.tsx` 패턴 참고)

#### 묶음 C — 채팅 알림 토글 (DB+백엔드+웹+모바일)
- [x] [12] 설정-알림 chat — `V10__add_chat_notification_setting.sql` 신규 마이그레이션 + `NotificationServiceImpl.isSuppressedByUserSettings` switch에 `chat` 케이스 추가 + 설정 조회/저장 응답 확장([7-b] 구현부) + 웹 `SettingsScreen.tsx`/모바일 `NotificationSettingsModal.tsx` 토글 UI 추가

#### 묶음 D — 프로필 사진 업로드 (신규 인프라, 별도 묶음)
- [x] [13] H3-8 — 프로필 사진 변경: DB 마이그레이션(`users` 또는 별도 테이블에 이미지 바이너리/base64 컬럼 추가) + 백엔드 업로드/조회 엔드포인트 + `UserProfile` DTO에 필드 추가 + 웹 `SettingsScreen.tsx`/모바일 프로필 화면에 실제 업로드 UI 연결(base64 인코딩 후 전송, 용량 제한 필요 — 예: 1~2MB 이하만 허용)

### 5. 검토 (Review)
- [x] 각 개발 항목에 대해 REVIEWER가 REVIEW.md에 APPROVED / CHANGES REQUESTED 기록 — 묶음 A~D 전체 완료, 전부 APPROVED
  - [x] 묶음 A(2차 사이클) [1]~[8] 검토 완료 — 전체 **APPROVED** (REVIEW.md "묶음 A (2차 사이클)" 섹션). [2]는 질문으로 전달된 전제("DashboardScreen.tsx로만 좁힘")가 실제 커밋/LOG.md 기록과 달랐음을 정정 — 실제로는 사용자 승인을 받아 DashboardLayout.tsx+5개 화면까지 포함한 더 넓은 범위로 구현됨
  - [x] 묶음 B [9]~[11] 검토 완료 — 전체 **APPROVED** (REVIEW.md "묶음 B (2차 사이클)" 섹션). [9] 저장/삭제 API 실호출 + 삭제 확인 절차 + 오너 전용 권한(클라이언트/서버 양쪽) 확인, [10] [9]로의 라우팅 정확히 연결 확인, [11] 모바일 읽음/삭제가 웹과 동등하거나 상회(웹엔 삭제 기능 자체가 없었음), 스와이프 미구현은 레포에 전례 없음을 직접 확인해 타당
  - [x] 묶음 C [12] 검토 완료 — 전체 **APPROVED** (REVIEW.md "묶음 C (2차 사이클)" 섹션). V10 마이그레이션이 V9 스타일/안전한 ALTER 확인, `isSuppressedByUserSettings`에 chat 추가가 기존 member/schedule/place 로직을 전혀 건드리지 않음을 라인 단위로 확인, 설정 없는 사용자 기본값("차단 안 함")이 기존 3개 타입과 동일한 공유 가드로 처리됨 확인, 웹/모바일 토글이 기존 제네릭 저장/조회 로직에 항목만 추가해 새로고침 후에도 유지됨 확인
  - [x] 묶음 D [13] 검토 완료 — 1차 (1)(4)(5) APPROVED, (2)(3) **CHANGES REQUESTED** → 재작업(4e83b86) 후 재검토 결과 전체 **APPROVED** (REVIEW.md "묶음 D (2차 사이클)" 섹션 + "재검토 결과" 추가분)
- [x] CHANGES REQUESTED 항목은 WORKER가 재작업 후 재검토 (묶음 A/B/C: 해당 없음)
  - [x] 묶음 D [13]: `UserProfileResponse`에서 avatar 제거 + 전용 `GET/PUT /api/user/avatar`(`AvatarResponse`)로 분리, `updateAvatar()`에 JPEG/PNG/WebP 매직 바이트 검증 추가 완료(커밋 4e83b86) — `CalendarScreen.tsx` 등 avatar 불필요 호출부가 더 이상 avatar를 받지 않음을 재확인, 기존 업로드 흐름(웹 핸들러/모바일 캐시 키)도 깨지지 않음을 코드로 재확인하고 **reviewer 재검토 완료 — APPROVED**.

### 6. 완료보고
- [x] 전체 개발 완료 후, 옵시디언 완료보고서 작성 여부를 사용자에게 확인 — 작성 승인받아 `03_WorkResults/2026-11-06-ui-dead-button-sweep.md` 생성 완료

---

## 과거 기록 — 기능 격차(Feature Gap) 조사 및 추가개발 (2026-11-05~06, 완료)

### 1. 조사 (Research)
- [x] (1) 프런트 UI만 있는 경우 / (2) 백엔드 API만 있는 경우 / (3) DB 미완성 도메인 / (4) 플랫폼 격차 / (5) TODO·FIXME 스윕 — RESEARCH.md "G" 섹션 기록 완료

### 2. 기능 목록 / 우선순위 확정 (Triage)
- [x] 이번 사이클 후보 7건([1]~[7]) vs 백로그 5건 구분, 우선순위 표 작성

### 3. 사용자 컨펌
- [x] 사용자 답변: 전부 다 개발([1]~[7] 전체)

### 4. 개발 (Development) — 전체 완료
- [x] 묶음 A [1]~[5] (커밋 e6f72f7, 43e09fb, 026fdeb, 2c24cc2, 80a866a)
- [x] 묶음 B [6-a]~[6-e] (커밋 f94d30e, 47c32e7 등, 재작업 3f0ff68)
- [x] 묶음 C [7-a]~[7-e] (재작업 1c8d1b9)

### 5. 검토 (Review)
- [x] 묶음 A/B/C 전체 APPROVED (일부 1차 CHANGES REQUESTED → 재작업 후 APPROVED)

### 6. 완료보고
- [x] 옵시디언 완료보고서 작성 완료 (`03_WorkResults/2026-11-06-feature-gap-development.md`)

_(백로그로 남은 G3-2/G2-1/G3-3/E1/E2는 위 "현재 작업"의 재검토 리드로 이어짐)_

---

## 과거 기록 — 모노레포 전반 버그 조사·수정 (2026-11-05, 완료)

### 1. 조사 (Research) — 우선 수행
- [x] auth: 리프레시 토큰/401 리다이렉트 흐름 재검증 (f1d6d08 회귀 여부)
- [x] mobile: Chat 백엔드 연동(5초 폴링) 동작 확인
- [x] mobile: Todo CRUD 연동 확인
- [x] teamspace: 멤버 관리 기능(권한/초대/제거) 확인
- [x] web ↔ mobile API 계약 불일치 확인
- [x] 나머지 도메인 스윕: place, event, notification, recommend, urlparser, ai, calendar, dashboard
- [x] TODO/FIXME 잔재 중 실제 버그와 단순 미구현 구분

### 2. 우선순위 확정 (Triage)
- [x] RESEARCH.md 심각도×영향범위 매트릭스 작성
- [x] "3. 수정" 섹션에 확정 순서 반영

### 3. 수정 (Fix) — 전체 완료
- [x] [1] A1 — 모바일 리프레시토큰 없음 리다이렉트 버그 (커밋 da7f827)
- [x] [2] B1 — Place 수정이 서버에 저장되지 않음 (커밋 3aa39d1)
- [x] [3] C2 — 웹 `/dashboard/member` 초대·내보내기 버튼 미동작 (커밋 1cdf00a)
- [x] [4] D1 — 모바일 탭 간 "현재 스페이스" 불일치 (커밋 c90b86b)
- [x] [5] C1 — 팀스페이스 오너 자기제거 서버 방어 누락 (커밋 16c6299)
- [x] [6] C3 — Todo `dueDate` 부분수정 시 유실 가능 (커밋 fa49378)

### 4. 검토 (Review)
- [x] REVIEWER 6건 전체 APPROVED (REVIEW.md)

### 5. 완료보고
- [x] 옵시디언 완료보고서 작성 완료 (`03_WorkResults/2026-11-05-monorepo-bugfix-sweep.md`)

# ReeL-Trip

AI 기반 여행지 추천 · 팀 여행 플래닝 서비스 — Turborepo 모노레포


## 기술 스택

| 영역 | 기술 |
|------|------|
| 웹 FE | Next.js 15 (App Router) |
| 앱 FE | React Native (Expo ~54) · Expo Router v6 |
| 상태 관리 | Zustand v5 (클라이언트) · TanStack Query v5 (서버) |
| BE | Spring Boot 3 |
| DB | PostgreSQL + pgvector (Neon) |
| AI | OpenAI (GPT-4o, text-embedding-3-small) · Claude (Anthropic) |
| 인증 | JWT (JJWT) · expo-secure-store |
| 모노레포 | Turborepo |
| 배포 | Railway (api) · Vercel (web) · EAS (mobile) |

---

## 프로젝트 구조

```
reel-trip/
├── apps/
│   ├── api-spring/                     # Spring Boot 백엔드
│   │   └── src/main/java/com/reeltrip/api/
│   │       ├── auth/                   # 인증 (Controller · Service · Repository · DTO)
│   │       ├── teamspace/              # 팀스페이스 · 멤버 관리
│   │       ├── event/                  # 일정 관리
│   │       ├── place/                  # 여행지 관리
│   │       ├── notification/           # 알림
│   │       ├── urlparser/              # YouTube Shorts · Instagram Reels URL 파싱
│   │       ├── recommend/              # AI 여행 추천
│   │       ├── ai/                     # OpenAI · Anthropic 서비스
│   │       └── common/
│   │           ├── exception/
│   │           ├── response/           # ApiResponse 래퍼
│   │           └── security/           # JWT 필터
│   │
│   ├── web/                            # Next.js 웹 FE
│   │   └── src/
│   │       ├── app/
│   │       │   ├── auth/               # 로그인 · 회원가입
│   │       │   └── dashboard/
│   │       └── domains/
│   │           └── auth/
│   │
│   └── mobile/                         # React Native (Expo ~54)
│       ├── app/                        # expo-router 파일 라우팅
│       │   ├── _layout.tsx             # QueryClientProvider · AuthGuard · Toast · ShareHandler
│       │   ├── (tabs)/
│       │   │   ├── _layout.tsx         # 탭 네비게이션 설정
│       │   │   ├── index.tsx           # → HomeScreen
│       │   │   ├── calendar.tsx        # → CalendarScreen
│       │   │   ├── travel.tsx          # → TravelScreen
│       │   │   ├── recommend.tsx       # → RecommendScreen
│       │   │   └── profile.tsx         # → ProfileScreen
│       │   └── auth/
│       │       ├── login.tsx           # → LoginScreen
│       │       └── signup.tsx          # → SignupScreen
│       │
│       └── src/
│           ├── features/               # 기능별 모듈 (Feature-Sliced Design)
│           │   ├── home/
│           │   │   ├── hooks/useHomeData.ts
│           │   │   ├── components/     # Header · SpaceCard · EventCard · CreateSpaceModal · NotificationModal
│           │   │   └── HomeScreen.tsx
│           │   ├── calendar/
│           │   │   ├── hooks/useCalendarData.ts
│           │   │   ├── components/     # CalendarGrid · CalendarEventCard · CreateEventModal
│           │   │   └── CalendarScreen.tsx
│           │   ├── travel/
│           │   │   ├── hooks/useTravelData.ts
│           │   │   ├── components/     # PlaceCard · SpaceInfo · UrlParserModal · InviteModal
│           │   │   └── TravelScreen.tsx
│           │   ├── profile/
│           │   │   ├── hooks/useProfileData.ts
│           │   │   ├── components/     # ProfileHeader · InfoCard
│           │   │   └── ProfileScreen.tsx
│           │   ├── auth/
│           │   │   ├── LoginScreen.tsx
│           │   │   └── SignupScreen.tsx
│           │   ├── recommend/
│           │   │   └── RecommendScreen.tsx
│           │   └── share/
│           │       └── ShareHandler.tsx    # 공유 인텐트 자동 처리
│           │
│           ├── hooks/                  # 서버 상태 훅 (TanStack Query)
│           │   ├── useSpaces.ts        # 팀스페이스 조회 · 무효화
│           │   ├── useEvents.ts        # 이벤트 조회 · 토글(낙관적 업데이트) · 무효화
│           │   ├── usePlaces.ts        # 여행지 조회 · 무효화
│           │   ├── useNotifications.ts # 알림 조회
│           │   └── useProfile.ts       # 프로필 조회
│           │
│           ├── store/                  # 클라이언트 전역 상태 (Zustand)
│           │   ├── auth.ts             # token · username · isReady · setAuth · clearAuth · initFromStorage
│           │   └── toast.ts            # toast 큐 · toast.success/error/info 유틸
│           │
│           ├── domains/                # API 도메인별 클라이언트
│           │   ├── auth/api.ts
│           │   ├── teamspace/api.ts
│           │   ├── event/api.ts
│           │   ├── place/api.ts
│           │   ├── notification/api.ts
│           │   ├── url-parser/api.ts
│           │   └── user/api.ts
│           │
│           ├── components/
│           │   └── ui/                 # 공유 UI 컴포넌트
│           │       ├── AppHeader.tsx
│           │       ├── Button.tsx
│           │       ├── EmptyState.tsx
│           │       ├── FAB.tsx
│           │       ├── FormInput.tsx
│           │       ├── LoadingScreen.tsx
│           │       ├── StatusBadge.tsx
│           │       └── Toast.tsx
│           │
│           └── lib/                    # 유틸 · 토큰
│               ├── api-client.ts       # fetch 유틸 (Metro 호스트 자동 추론)
│               ├── auth-store.ts       # expo-secure-store 래퍼
│               ├── colors.ts           # 디자인 토큰 (C.primary 등)
│               └── styles.ts           # 공유 스타일 토큰 (sp · radius · shadow · card 등)
│
└── packages/
    └── types/                          # 공유 TypeScript 타입 (ApiResponse 등)
```

---

## 시작하기

### 필수 환경

- Node.js 20+
- npm 10+
- Java 21+
- Maven

### 설치

```bash
npm install
```

### 환경변수 설정

**apps/api-spring** (`application.yml` 오버라이드 또는 환경변수)

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
JWT_SECRET=replace-with-a-long-random-secret-min-32-chars
JWT_EXPIRATION=86400000
OPENAI_API_KEY=sk-proj-xxxx
ANTHROPIC_API_KEY=sk-ant-xxxx
APIFY_API_TOKEN=apify_xxxx
ALLOWED_ORIGINS=http://localhost:3000
API_BASE_URL=http://localhost:4000
```

**apps/web/.env.local**

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**apps/mobile/.env**

```env
# 개발환경: 비워두면 Metro 호스트 기반 자동 추론 (실기기 · 에뮬레이터 모두 동작)
EXPO_PUBLIC_API_URL=

# 프로덕션
# EXPO_PUBLIC_API_URL=https://your-api.railway.app
```

> **Android 에뮬레이터에서 자동 추론이 안 되는 경우**
> `EXPO_PUBLIC_API_URL=http://10.0.2.2:4000` 으로 직접 설정

### 개발 서버 실행

```bash
# 웹 + 패키지 동시 실행
npm run dev

# 개별 실행
cd apps/api-spring && ./mvnw spring-boot:run   # http://localhost:4000
cd apps/web && npm run dev                      # http://localhost:3000
cd apps/mobile && npm run dev                   # Expo Go
```

---

## API 엔드포인트

| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| POST | /api/auth/signup | - | 회원가입 |
| POST | /api/auth/login | - | 로그인 |
| GET | /api/user/profile | JWT | 내 프로필 조회 |
| GET | /api/teamspaces | JWT | 팀스페이스 목록 |
| POST | /api/teamspaces | JWT | 팀스페이스 생성 |
| POST | /api/teamspaces/:id/invite | JWT | 멤버 초대 |
| GET | /api/teamspaces/:id/events | JWT | 일정 목록 (월 필터) |
| POST | /api/teamspaces/:id/events | JWT | 일정 생성 |
| PUT | /api/events/:id | JWT | 일정 수정 · 상태 변경 |
| GET | /api/teamspaces/:id/places | JWT | 여행지 목록 |
| POST | /api/places | JWT | 여행지 추가 |
| GET | /api/notifications | JWT | 알림 목록 |
| POST | /api/url-parser/parse | JWT | URL 파싱 (YouTube Shorts · Instagram Reels) |
| POST | /api/recommend | JWT | AI 여행 추천 |

API 문서 (Swagger): `http://localhost:4000/swagger-ui.html`

---

## 배포

### API (Railway)

- Root Directory: `apps/api-spring`
- Build: Maven
- 환경변수: `DATABASE_URL` · `JWT_SECRET` · `JWT_EXPIRATION` · `OPENAI_API_KEY` · `ANTHROPIC_API_KEY` · `APIFY_API_TOKEN` · `ALLOWED_ORIGINS` · `API_BASE_URL`

### Web (Vercel)

- Root Directory: `apps/web`
- 환경변수: `NEXT_PUBLIC_API_URL`

### Mobile (EAS)

```bash
cd apps/mobile
eas build --platform android
eas build --platform ios
```

# ReeL-Trip

AI 기반 여행지 추천 서비스 — Turborepo 모노레포

## 기술 스택

| 영역 | 기술 |
|------|------|
| 웹 FE | Next.js 15 (App Router) |
| 앱 FE | React Native (Expo ~54) |
| BE | Spring Boot 3 |
| DB | PostgreSQL + pgvector (Neon) |
| AI | OpenAI (GPT-4o, text-embedding-3-small) · Claude (Anthropic) |
| 인증 | JWT (JJWT) |
| 유효성 검사 | Jakarta Validation |
| 모노레포 | Turborepo |
| 배포 | Railway (api) · Vercel (web) · EAS (mobile) |

## 프로젝트 구조

```
reel-trip/
├── apps/
│   ├── api-spring/                 # Spring Boot 백엔드
│   │   └── src/main/java/com/reeltrip/api/
│   │       ├── auth/               # 인증 (Controller · Service · Repository · DTO)
│   │       ├── document/           # 문서 (Controller · Service · Repository · DTO)
│   │       ├── recommend/          # 추천 (Controller · Service · DTO)
│   │       ├── urlparser/          # URL 파싱 (Instagram Reel 등)
│   │       ├── ai/                 # OpenAI · Anthropic 서비스
│   │       ├── common/
│   │       │   ├── exception/      # 예외 처리
│   │       │   ├── response/       # ApiResponse 래퍼
│   │       │   └── security/       # JWT 필터
│   │       └── config/             # CORS · Security · Swagger 설정
│   ├── web/                        # Next.js 웹 FE
│   │   └── src/
│   │       ├── app/
│   │       │   ├── auth/           # 로그인 · 회원가입 페이지
│   │       │   └── dashboard/
│   │       └── domains/
│   │           └── auth/           # 인증 API · 세션
│   └── mobile/                     # React Native (Expo)
│       ├── app/
│       │   ├── (tabs)/             # 홈 · 추천 · 프로필
│       │   └── auth/               # 로그인 · 회원가입
│       └── src/lib/
│           ├── api-client.ts       # fetch 유틸 (Metro 호스트 자동 추론)
│           └── auth-store.ts       # SecureStore 토큰 관리
├── packages/
│   └── types/                      # 공유 TypeScript 타입 (ApiResponse, AuthResponse 등)
├── turbo.json
└── package.json
```

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

**apps/api-spring** (`src/main/resources/application.yml` 오버라이드 또는 환경변수)
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
# 개발환경: 비워두면 Metro 호스트 기반 자동 추론 (기기/에뮬레이터 모두 동작)
EXPO_PUBLIC_API_URL=

# 프로덕션 배포 시
# EXPO_PUBLIC_API_URL=https://your-api.railway.app
```

> **Android 에뮬레이터에서 자동 추론이 안 되는 경우**
> `EXPO_PUBLIC_API_URL=http://10.0.2.2:4000` 으로 직접 설정

### 개발 서버 실행

```bash
# 웹 + 기타 패키지 동시 실행 (mobile 제외)
npm run dev

# 개별 실행
cd apps/api-spring && ./mvnw spring-boot:run   # http://localhost:4000
cd apps/web && npm run dev                      # http://localhost:3000
cd apps/mobile && npm run dev                   # Expo Go
```

## API 엔드포인트

| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| POST | /api/auth/signup | - | 회원가입 |
| POST | /api/auth/login | - | 로그인 |
| GET | /api/documents | JWT | 문서 목록 |
| POST | /api/documents | JWT | 문서 생성 |
| GET | /api/documents/:id | JWT | 문서 조회 |
| PUT | /api/documents/:id | JWT | 문서 수정 |
| DELETE | /api/documents/:id | JWT | 문서 삭제 |
| POST | /api/documents/search | JWT | 벡터 유사도 검색 |
| POST | /api/recommend | JWT | AI 여행 추천 |
| POST | /api/url-parser | JWT | URL 파싱 (Instagram Reel 등) |

API 문서 (Swagger): `http://localhost:4000/swagger-ui.html`

## 배포

### API (Railway)
- Root Directory: `apps/api-spring`
- Build: Maven
- 환경변수: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRATION`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `APIFY_API_TOKEN`, `ALLOWED_ORIGINS`, `API_BASE_URL`

### Web (Vercel)
- Root Directory: `apps/web`
- 환경변수: `NEXT_PUBLIC_API_URL`

### Mobile (EAS)
```bash
cd apps/mobile
eas build --platform android
eas build --platform ios
```

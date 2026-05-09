# ReeL-Trip

AI 기반 여행지 추천 서비스 — Turborepo 모노레포.

## 기술 스택

| 영역 | 기술 |
|------|------|
| 웹 FE | Next.js 15 (App Router) |
| 앱 FE | React Native (Expo) |
| BE | NestJS + Prisma |
| DB | PostgreSQL + pgvector (Neon) |
| AI | OpenAI (GPT-4o, text-embedding-3-small) |
| 인증 | JWT (jose) |
| 유효성 검사 | Zod |
| 모노레포 | Turborepo |
| 배포 | Railway (api) · Vercel (web) · EAS (mobile) |

## 프로젝트 구조

```
reel-trip/
├── apps/
│   ├── api/                        # NestJS 백엔드
│   │   └── src/
│   │       ├── auth/               # 인증 (Controller · Service · Repository · DTO)
│   │       ├── document/           # 문서 (Controller · Service · Repository · DTO)
│   │       ├── recommend/          # 추천 (Controller · Service · DTO)
│   │       ├── ai/                 # OpenAI 서비스
│   │       ├── prisma/             # PrismaService · PrismaModule
│   │       ├── common/
│   │       │   ├── errors/         # AppError 클래스
│   │       │   ├── filters/        # AppExceptionFilter (전역 에러 처리)
│   │       │   ├── interceptors/   # ResponseInterceptor (응답 래핑)
│   │       │   ├── guards/         # JwtAuthGuard
│   │       │   └── pipes/          # ZodValidationPipe
│   │       ├── docs/               # API 문서 (Scalar)
│   │       ├── app.module.ts
│   │       └── main.ts
│   ├── web/                        # Next.js 웹 FE
│   │   └── src/
│   │       ├── app/
│   │       │   ├── auth/           # 로그인 · 회원가입 페이지
│   │       │   └── dashboard/
│   │       └── lib/
│   │           └── api-client.ts   # API 호출 유틸
│   └── mobile/                     # React Native (Expo)
│       ├── app/
│       │   ├── (tabs)/
│       │   └── auth/
│       └── src/lib/
│           ├── api-client.ts
│           └── auth-store.ts
├── packages/                       # 공유 패키지 (추후 추가 예정)
├── turbo.json
└── package.json
```

## 시작하기

### 필수 환경
- Node.js 20+
- npm 10+

### 설치

```bash
npm install
```

### 환경변수 설정

**apps/api/.env**
```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
JWT_SECRET=replace-with-a-long-random-secret-min-32-chars
JWT_EXPIRES_IN=86400s
OPENAI_API_KEY=sk-proj-xxxx
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081
API_BASE_URL=http://localhost:4000
```

**apps/web/.env.local**
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**apps/mobile/.env**
```env
EXPO_PUBLIC_API_URL=http://localhost:4000
```

### 개발 서버 실행

```bash
# 전체 동시 실행
npm run dev

# 개별 실행
cd apps/api && npm run dev     # http://localhost:4000
cd apps/web && npm run dev     # http://localhost:3000
cd apps/mobile && npm run dev  # Expo Go
```

### DB 마이그레이션

```bash
cd apps/api
npx prisma db push
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

API 문서: `http://localhost:4000/docs`

## 배포

### API (Railway)
- Root Directory: `apps/api`
- 환경변수: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `OPENAI_API_KEY`, `ALLOWED_ORIGINS`, `API_BASE_URL`

### Web (Vercel)
- Root Directory: `apps/web`
- 환경변수: `NEXT_PUBLIC_API_URL`

### Mobile (EAS)
```bash
cd apps/mobile
eas build --platform all
```

# ReeL-Trip 문서 허브

이 디렉토리는 프로젝트의 모든 작업 문서를 관리합니다.

---

## 작업 흐름

```
요구사항 작성  →  작업지시서 검토  →  컨펌  →  작업 완료보고서
(사용자)           (Claude 초안)      (사용자)    (Claude 작성)
```

1. **요구사항** — 사용자가 `templates/requirements.md` 양식을 참고해 작업 내용을 설명
2. **작업지시서** — Claude가 요구사항을 분석해 `templates/work-order.md` 양식으로 초안 작성
3. **컨펌** — 사용자가 작업지시서 검토 후 승인 또는 수정 요청
4. **완료보고서** — 작업 완료 후 Claude가 `templates/completion-report.md` 양식으로 정리

---

## 디렉토리 구조

```
docs/
├── README.md                      # 이 파일 (전체 안내)
├── templates/
│   ├── requirements.md            # 요구사항 양식
│   ├── work-order.md              # 작업지시서 양식
│   └── completion-report.md       # 완료보고서 양식
└── pages/
    ├── web/                       # Web 앱 페이지별 문서
    │   ├── auth-login.md
    │   ├── auth-signup.md
    │   ├── dashboard-home.md
    │   ├── dashboard-ai.md
    │   ├── dashboard-calendar.md
    │   ├── dashboard-chat.md
    │   ├── dashboard-member.md
    │   ├── dashboard-notification.md
    │   ├── dashboard-settings.md
    │   └── dashboard-travel.md
    └── mobile/                    # Mobile 앱 화면별 문서
        ├── auth-login.md
        ├── auth-signup.md
        ├── home.md
        ├── calendar.md
        ├── travel.md
        ├── place-detail.md
        ├── profile.md
        └── recommend.md
```

---

## 페이지 문서 목록

### Web (`apps/web`)

| 문서 | 경로 | 상태 |
|------|------|------|
| [로그인](results/web/auth-login.md) | `/auth/login` | 미작성 |
| [회원가입](results/web/auth-signup.md) | `/auth/signup` | 미작성 |
| [대시보드 홈](results/web/dashboard-home.md) | `/dashboard/home` | 미작성 |
| [AI 파서](results/web/dashboard-ai.md) | `/dashboard/ai` | 미작성 |
| [캘린더](results/web/dashboard-calendar.md) | `/dashboard/calendar` | 미작성 |
| [채팅](results/web/dashboard-chat.md) | `/dashboard/chat` | 미작성 |
| [멤버](results/web/dashboard-member.md) | `/dashboard/member` | 미작성 |
| [알림](results/web/dashboard-notification.md) | `/dashboard/notification` | 미작성 |
| [설정](results/web/dashboard-settings.md) | `/dashboard/settings` | 미작성 |
| [여행](results/web/dashboard-travel.md) | `/dashboard/travel` | 미작성 |

### Mobile (`apps/mobile`)

| 문서 | 화면 | 상태 |
|------|------|------|
| [로그인](results/mobile/auth-login.md) | `LoginScreen` | 미작성 |
| [회원가입](results/mobile/auth-signup.md) | `SignupScreen` | 미작성 |
| [홈](results/mobile/home.md) | `HomeScreen` | 미작성 |
| [캘린더](results/mobile/calendar.md) | `CalendarScreen` | 미작성 |
| [여행](results/mobile/travel.md) | `TravelScreen` | 미작성 |
| [장소 상세](results/mobile/place-detail.md) | `PlaceDetailScreen` | 미작성 |
| [프로필](results/mobile/profile.md) | `ProfileScreen` | 미작성 |
| [추천](results/mobile/recommend.md) | `RecommendScreen` | 미작성 |

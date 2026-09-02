---
완료일: 2026-06-30
작업지시서 참조: docs/workOrders/2026-06-30-chat-service.md
대상 앱: Web / API
대상 페이지/화면: /dashboard/chat
작업 유형: 기능추가
---

# 완료보고서 — 채팅 서비스 연결

## 작업 결과 요약

팀스페이스 단위 채팅 REST API(백엔드)를 신규 구현하고, 프론트엔드에서 더미 데이터를 제거한 뒤 실제 API + 5초 폴링으로 교체하여 채팅 기능을 완성하였다.

---

## 변경된 파일

| 파일 경로 | 변경 유형 | 주요 변경 내용 |
|-----------|-----------|----------------|
| `apps/api-spring/.../resources/db/migration/V7__add_chat_messages.sql` | 생성 | chat_messages 테이블 DDL |
| `apps/api-spring/.../chat/model/Message.java` | 생성 | 메시지 모델 |
| `apps/api-spring/.../chat/dto/MessageResponse.java` | 생성 | 응답 DTO |
| `apps/api-spring/.../chat/dto/SendMessageRequest.java` | 생성 | 전송 요청 DTO |
| `apps/api-spring/.../chat/mapper/MessageMapper.java` | 생성 | MyBatis 매퍼 인터페이스 |
| `apps/api-spring/.../resources/mapper/MessageMapper.xml` | 생성 | MyBatis XML (SELECT, INSERT) |
| `apps/api-spring/.../chat/service/MessageService.java` | 생성 | 서비스 인터페이스 |
| `apps/api-spring/.../chat/service/MessageServiceImpl.java` | 생성 | 서비스 구현체 |
| `apps/api-spring/.../chat/controller/MessageController.java` | 생성 | REST 컨트롤러 |
| `apps/api-spring/.../common/exception/ErrorCode.java` | 수정 | MESSAGE_NOT_FOUND 추가 |
| `apps/api-spring/.../config/SecurityConfig.java` | 수정 | `/api/messages/**` 인증 경로 추가 |
| `apps/web/src/domains/chat/api.ts` | 생성 | listMessages / sendMessage API 함수 |
| `apps/web/src/domains/dashboard/components/ChatScreen.tsx` | 수정 | 더미 제거, 실API + 5초 폴링 연결 |

---

## 변경 사항 상세

### API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/messages?spaceId={id}` | 팀스페이스 채팅 목록 (sentAt ASC) |
| POST | `/api/messages` | 메시지 전송 |

### ChatScreen.tsx

**변경 전:** `DUMMY_MESSAGES` 하드코딩, 전송 시 로컬 상태에만 추가

**변경 후:**
- 진입 시 `listMessages()` 호출로 실 데이터 로드
- `setInterval(fetchMessages, 5000)` 폴링 — 컴포넌트 언마운트 시 `clearInterval` 정리
- `sendMessage()` API 호출 후 응답 메시지를 상태에 추가
- 전송 중 버튼/입력창 `disabled` 처리로 중복 전송 방지
- 아바타 색상: 하드코딩 맵 → username 해시 기반 동적 할당

### MessageServiceImpl 멤버십 검증

메시지 조회/전송 시 `teamSpaceMapper.existsMember()` 로 해당 스페이스 멤버 여부 확인.
비멤버 요청 시 403 `TEAM_SPACE_ACCESS_DENIED` 반환.

---

## 테스트 체크리스트

- [ ] 채팅 목록 조회 (GET /api/messages?spaceId=1)
- [ ] 메시지 전송 (POST /api/messages)
- [ ] 5초마다 새 메시지 자동 갱신
- [ ] 비멤버 접근 시 403 반환
- [ ] 로그아웃 상태(토큰 없음) → 로그인 페이지 리다이렉트
- [ ] 컴포넌트 언마운트 시 폴링 정리 (메모리 누수 없음)

---

## 잔여 이슈 / 후속 작업

- WebSocket(STOMP) 전환: 폴링 방식은 임시 구현이며 트래픽 증가 시 WebSocket으로 전환 권장
- 메시지 페이지네이션: 현재 전체 조회 — 메시지 수 증가 시 커서 기반 페이지네이션 필요
- 읽음 처리: 읽지 않은 메시지 카운트 및 읽음 표시 기능 미구현

---

## 특이 사항

- `UserMapper.findById()`가 이미 존재하여 userId → username 매핑 추가 구현 없이 재사용
- 아바타 색상은 더미 데이터의 하드코딩 맵 대신 username 해시 방식으로 교체하여 신규 멤버에도 자동 대응

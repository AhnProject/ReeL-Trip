-- Supabase DB 린터가 RLS(Row Level Security) 미설정을 지적한 3개 테이블 보안 강화
-- Supabase는 public 스키마를 PostgREST로 자동 노출하므로, RLS가 꺼진 테이블은
-- anon 키(공개값)만 있으면 백엔드를 거치지 않고 누구나 직접 읽기/쓰기가 가능했음.
-- 정책(POLICY)은 추가하지 않음 — 모든 실제 접근은 postgres 역할(RLS 우회)로
-- 접속하는 Spring Boot 백엔드가 수행하므로, RLS만 켜면 postgres 역할은 그대로
-- 동작하고 anon/authenticated 등 비우회 역할의 PostgREST 직접 접근만 차단됨.
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

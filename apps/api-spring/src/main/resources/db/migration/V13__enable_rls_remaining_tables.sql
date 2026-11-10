-- V12에서 미처리된 나머지 8개 테이블의 RLS(Row Level Security) 활성화
-- Supabase는 public 스키마를 PostgREST로 자동 노출하므로, RLS가 꺼진 테이블은
-- anon 키(공개값)만 있으면 백엔드를 거치지 않고 누구나 직접 읽기/쓰기가 가능했음.
-- 특히 users(계정정보), refresh_tokens(로그인 세션 토큰)는 가장 심각한 노출.
-- 정책(POLICY)은 추가하지 않음 — 모든 실제 접근은 postgres 역할(RLS 우회)로
-- 접속하는 Spring Boot 백엔드가 수행하므로, RLS만 켜면 postgres 역할은 그대로
-- 동작하고 anon/authenticated 등 비우회 역할의 PostgREST 직접 접근만 차단됨.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_space_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;

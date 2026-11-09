-- 채팅 알림 설정 컬럼 추가
ALTER TABLE notification_settings
    ADD COLUMN IF NOT EXISTS chat BOOLEAN NOT NULL DEFAULT true;

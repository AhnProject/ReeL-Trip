-- 알림 설정 테이블
CREATE TABLE IF NOT EXISTS notification_settings (
    user_id         BIGINT    PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    new_place       BOOLEAN   NOT NULL DEFAULT true,
    schedule_change BOOLEAN   NOT NULL DEFAULT true,
    member_join     BOOLEAN   NOT NULL DEFAULT true,
    ai_recommend    BOOLEAN   NOT NULL DEFAULT false,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

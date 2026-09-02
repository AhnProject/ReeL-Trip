-- 채팅 메시지 테이블
CREATE TABLE IF NOT EXISTS chat_messages (
    id         BIGSERIAL    PRIMARY KEY,
    space_id   BIGINT       NOT NULL REFERENCES team_spaces(id) ON DELETE CASCADE,
    user_id    BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content    TEXT         NOT NULL,
    sent_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_space_id ON chat_messages(space_id);

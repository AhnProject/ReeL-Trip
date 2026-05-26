-- 알림 테이블
CREATE TABLE IF NOT EXISTS notifications (
    id               BIGSERIAL    PRIMARY KEY,
    user_id          BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message          TEXT         NOT NULL,
    type             VARCHAR(50),
    related_space_id BIGINT       REFERENCES team_spaces(id) ON DELETE SET NULL,
    is_read          BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    read_at          TIMESTAMP
);

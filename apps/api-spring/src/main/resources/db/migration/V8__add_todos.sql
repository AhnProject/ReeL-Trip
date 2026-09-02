-- 할 일(체크리스트) 테이블
CREATE TABLE IF NOT EXISTS todos (
    id          BIGSERIAL    PRIMARY KEY,
    space_id    BIGINT       NOT NULL REFERENCES team_spaces(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    priority    VARCHAR(10)  NOT NULL DEFAULT 'medium',
    due_date    DATE,
    is_done     BOOLEAN      NOT NULL DEFAULT false,
    created_by  BIGINT       NOT NULL REFERENCES users(id),
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- 이벤트/일정 테이블
CREATE TABLE IF NOT EXISTS events (
    id          BIGSERIAL    PRIMARY KEY,
    space_id    BIGINT       NOT NULL REFERENCES team_spaces(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    start_date  DATE         NOT NULL,
    end_date    DATE         NOT NULL,
    location    VARCHAR(255),
    price       VARCHAR(100),
    color       VARCHAR(7)   NOT NULL DEFAULT '#4A6CF7',
    status      VARCHAR(20)  NOT NULL DEFAULT 'pending',
    created_by  BIGINT       NOT NULL REFERENCES users(id),
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

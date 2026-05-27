-- 팀스페이스 테이블
CREATE TABLE IF NOT EXISTS team_spaces (
    id         BIGSERIAL    PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    emoji      VARCHAR(10),
    bg_color   VARCHAR(7),
    owner_id   BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- 팀스페이스 멤버 테이블
CREATE TABLE IF NOT EXISTS team_space_members (
    id         BIGSERIAL   PRIMARY KEY,
    space_id   BIGINT      NOT NULL REFERENCES team_spaces(id) ON DELETE CASCADE,
    user_id    BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role       VARCHAR(20) NOT NULL DEFAULT 'member',
    joined_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
    UNIQUE (space_id, user_id)
);

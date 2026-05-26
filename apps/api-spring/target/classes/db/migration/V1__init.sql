-- pgvector 확장
CREATE EXTENSION IF NOT EXISTS vector;

-- users 테이블
CREATE TABLE IF NOT EXISTS users (
    id         BIGSERIAL    PRIMARY KEY,
    username   VARCHAR(50)  NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    email      VARCHAR(100) NOT NULL UNIQUE,
    role       VARCHAR(20)  NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- documents 테이블 (pgvector embedding 포함)
CREATE TABLE IF NOT EXISTS documents (
    id         BIGSERIAL    PRIMARY KEY,
    title      VARCHAR(255) NOT NULL,
    content    TEXT         NOT NULL,
    embedding  vector(1536),
    created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

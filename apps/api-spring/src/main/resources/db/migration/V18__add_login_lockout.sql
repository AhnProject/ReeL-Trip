-- 로그인 brute-force 방어(계정 잠금) 컬럼 추가
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS failed_login_count INT       NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS locked_until        TIMESTAMP;

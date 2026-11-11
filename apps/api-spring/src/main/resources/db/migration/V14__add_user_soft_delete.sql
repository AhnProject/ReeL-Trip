-- 계정 탈퇴(소프트 삭제) 컬럼 추가
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN   NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

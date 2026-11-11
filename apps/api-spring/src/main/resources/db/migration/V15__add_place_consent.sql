-- 장소 공개동의 컬럼 추가
ALTER TABLE places
    ADD COLUMN IF NOT EXISTS consent_given BOOLEAN   NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS consent_at    TIMESTAMP;

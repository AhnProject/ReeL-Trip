-- 프로필 사진(아바타) 컬럼 추가 (base64 데이터 URL 문자열 저장)
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS avatar TEXT;

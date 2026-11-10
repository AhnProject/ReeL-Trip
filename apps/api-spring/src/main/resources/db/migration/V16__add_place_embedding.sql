-- "비슷한 장소" 추천을 위한 장소 전용 임베딩 컬럼 추가 (documents 테이블과 무관, pgvector)
ALTER TABLE places
    ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- 운영시간 구조화 컬럼 추가 (기존 자유 텍스트 hours는 하위호환을 위해 그대로 유지)
-- 저장 형식: JSON 배열, 영업하는 요일만 원소로 포함 — 예:
--   [{"day":"MON","open":"09:00","close":"18:00"}, {"day":"TUE", ...}]
-- 값이 없는(null) 장소는 "운영시간 비활성화 로직"에서 no-op(전체 시간 허용)으로 처리됨
ALTER TABLE places
    ADD COLUMN IF NOT EXISTS hours_structured JSONB;

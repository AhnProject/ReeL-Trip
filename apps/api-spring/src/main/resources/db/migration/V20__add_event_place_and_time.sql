-- 일정에 장소 연관관계 + 시간(time-of-day) 추가
-- place_id는 nullable(장소 없는 일정도 허용), 장소가 삭제되면 일정 자체는 남고 연관만 끊어짐(SET NULL)
-- start_time/end_time도 nullable(하루 전체 일정처럼 특정 시간이 없는 경우 허용)
ALTER TABLE events
    ADD COLUMN IF NOT EXISTS place_id   BIGINT REFERENCES places(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS start_time TIME,
    ADD COLUMN IF NOT EXISTS end_time   TIME;

CREATE INDEX IF NOT EXISTS idx_events_place_id ON events(place_id);

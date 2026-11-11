-- 자주 조회되는 외래키 컬럼에 인덱스 추가 (M3-3)
CREATE INDEX IF NOT EXISTS idx_team_space_members_user_id ON team_space_members(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_places_space_id ON places(space_id);
CREATE INDEX IF NOT EXISTS idx_events_space_id ON events(space_id);
CREATE INDEX IF NOT EXISTS idx_todos_space_id ON todos(space_id);

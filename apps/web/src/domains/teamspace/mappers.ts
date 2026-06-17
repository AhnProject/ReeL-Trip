import type { TeamSpaceResponse } from "./api";
import type { TeamSpace } from "./types";

/** API 응답(TeamSpaceResponse)을 UI 모델(TeamSpace)로 변환 */
export function toTeamSpace(res: TeamSpaceResponse): TeamSpace {
  return {
    id: String(res.id),
    name: res.name,
    emoji: res.emoji ?? "✈️",
    bgColor: res.bgColor ?? "#4A6CF7",
    members: res.members.map((m) => ({
      id: String(m.userId),
      username: m.username,
      avatarColor: "#4A6CF7",
      role: m.role,
    })),
    events: [],
  };
}

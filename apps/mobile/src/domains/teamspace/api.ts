import { apiRequest } from "@/lib/api-client";

export interface MemberResponse {
  userId: number;
  username: string;
  role: "owner" | "member";
  joinedAt: string;
}

export interface TeamSpaceResponse {
  id: number;
  name: string;
  emoji: string | null;
  bgColor: string | null;
  ownerId: number;
  members: MemberResponse[];
  createdAt: string;
  updatedAt: string;
}

export function listTeamSpaces(token: string) {
  return apiRequest<TeamSpaceResponse[]>("/api/teamspaces", {}, token);
}

export function createTeamSpace(
  payload: { name: string; emoji?: string; bgColor?: string },
  token: string,
) {
  return apiRequest<TeamSpaceResponse>("/api/teamspaces", {
    method: "POST",
    body: JSON.stringify(payload),
  }, token);
}

export function inviteMember(spaceId: number, username: string, token: string) {
  return apiRequest<MemberResponse>(`/api/teamspaces/${spaceId}/members`, {
    method: "POST",
    body: JSON.stringify({ username }),
  }, token);
}

export function removeMember(spaceId: number, userId: number, token: string) {
  return apiRequest<void>(`/api/teamspaces/${spaceId}/members/${userId}`, {
    method: "DELETE",
  }, token);
}

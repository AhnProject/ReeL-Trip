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

export interface CreateTeamSpacePayload {
  name: string;
  emoji?: string;
  bgColor?: string;
}

export function listTeamSpaces(token: string) {
  return apiRequest<TeamSpaceResponse[]>("/api/teamspaces", {}, token);
}

export function getTeamSpace(id: number, token: string) {
  return apiRequest<TeamSpaceResponse>(`/api/teamspaces/${id}`, {}, token);
}

export function createTeamSpace(payload: CreateTeamSpacePayload, token: string) {
  return apiRequest<TeamSpaceResponse>("/api/teamspaces", {
    method: "POST",
    body: JSON.stringify(payload),
  }, token);
}

export function updateTeamSpace(id: number, payload: CreateTeamSpacePayload, token: string) {
  return apiRequest<TeamSpaceResponse>(`/api/teamspaces/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }, token);
}

export function deleteTeamSpace(id: number, token: string) {
  return apiRequest<void>(`/api/teamspaces/${id}`, { method: "DELETE" }, token);
}

export function listMembers(spaceId: number, token: string) {
  return apiRequest<MemberResponse[]>(`/api/teamspaces/${spaceId}/members`, {}, token);
}

export function inviteMember(spaceId: number, username: string, token: string) {
  return apiRequest<MemberResponse>(`/api/teamspaces/${spaceId}/members`, {
    method: "POST",
    body: JSON.stringify({ username }),
  }, token);
}

export function removeMember(spaceId: number, userId: number, token: string) {
  return apiRequest<void>(`/api/teamspaces/${spaceId}/members/${userId}`, { method: "DELETE" }, token);
}

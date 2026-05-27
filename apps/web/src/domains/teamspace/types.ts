export interface TeamSpaceMember {
  id: string;
  username: string;
  avatarColor: string;
  role: "owner" | "member";
}

export interface TripEvent {
  id: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  location: string;
  color: string;
}

export interface TeamSpace {
  id: string;
  name: string;
  emoji: string;
  bgColor: string;
  members: TeamSpaceMember[];
  events: TripEvent[];
}

export type NavItem = "calendar" | "places" | "search" | "url-parser" | "members";

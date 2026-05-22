import type { TeamSpace } from "./types";

export const MOCK_TEAM_SPACES: TeamSpace[] = [
  {
    id: "space-1",
    name: "도쿄 여름 여행",
    emoji: "🗼",
    bgColor: "#FF6B6B",
    members: [
      { id: "1", username: "나", avatarColor: "#4A6CF7", role: "owner" },
      { id: "2", username: "민준", avatarColor: "#10B981", role: "member" },
      { id: "3", username: "지현", avatarColor: "#F59E0B", role: "member" },
    ],
    events: [
      { id: "e1", title: "도쿄 도착", startDate: "2026-07-10", endDate: "2026-07-10", location: "나리타 공항", color: "#4A6CF7" },
      { id: "e2", title: "아사쿠사 관광", startDate: "2026-07-11", endDate: "2026-07-12", location: "아사쿠사", color: "#10B981" },
      { id: "e3", title: "후지산 당일치기", startDate: "2026-07-14", endDate: "2026-07-14", location: "후지산", color: "#F59E0B" },
      { id: "e4", title: "시부야 쇼핑", startDate: "2026-07-15", endDate: "2026-07-15", location: "시부야", color: "#EC4899" },
      { id: "e5", title: "도쿄 출발", startDate: "2026-07-17", endDate: "2026-07-17", location: "하네다 공항", color: "#EF4444" },
    ],
  },
  {
    id: "space-2",
    name: "제주 힐링 여행",
    emoji: "🏝️",
    bgColor: "#34D399",
    members: [
      { id: "1", username: "나", avatarColor: "#4A6CF7", role: "owner" },
      { id: "4", username: "수연", avatarColor: "#EC4899", role: "member" },
    ],
    events: [
      { id: "e6", title: "제주 도착", startDate: "2026-08-01", endDate: "2026-08-01", location: "제주공항", color: "#4A6CF7" },
      { id: "e7", title: "성산일출봉", startDate: "2026-08-02", endDate: "2026-08-02", location: "성산읍", color: "#10B981" },
      { id: "e8", title: "한라산 트래킹", startDate: "2026-08-03", endDate: "2026-08-03", location: "한라산", color: "#F59E0B" },
      { id: "e9", title: "우도 자전거 투어", startDate: "2026-08-04", endDate: "2026-08-04", location: "우도", color: "#EC4899" },
      { id: "e10", title: "제주 출발", startDate: "2026-08-05", endDate: "2026-08-05", location: "제주공항", color: "#EF4444" },
    ],
  },
  {
    id: "space-3",
    name: "유럽 배낭여행",
    emoji: "🏰",
    bgColor: "#818CF8",
    members: [
      { id: "1", username: "나", avatarColor: "#4A6CF7", role: "member" },
      { id: "5", username: "태양", avatarColor: "#F97316", role: "owner" },
      { id: "6", username: "예진", avatarColor: "#06B6D4", role: "member" },
      { id: "7", username: "현우", avatarColor: "#84CC16", role: "member" },
    ],
    events: [
      { id: "e11", title: "파리 도착", startDate: "2026-09-05", endDate: "2026-09-05", location: "CDG 공항", color: "#4A6CF7" },
      { id: "e12", title: "에펠탑 & 루브르", startDate: "2026-09-06", endDate: "2026-09-07", location: "파리", color: "#EC4899" },
      { id: "e13", title: "암스테르담 이동", startDate: "2026-09-08", endDate: "2026-09-09", location: "암스테르담", color: "#10B981" },
      { id: "e14", title: "베를린 이동", startDate: "2026-09-10", endDate: "2026-09-11", location: "베를린", color: "#F59E0B" },
      { id: "e15", title: "귀국", startDate: "2026-09-12", endDate: "2026-09-12", location: "인천공항", color: "#EF4444" },
    ],
  },
];

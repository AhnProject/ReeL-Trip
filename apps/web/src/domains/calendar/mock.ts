/**
 * [Test] 캘린더 이벤트 목데이터
 * API 엔드포인트 미구현 — 실제 연동 시 /api/calendar/events?month=YYYY-MM 으로 대체 예정
 */
import type { CalendarEvent } from "./types";

export const TEST_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: "evt-1",
    title: "성수 재즈 페스티벌",
    date: "2026-05-15",
    time: "19:00",
    price: "₩35,000",
    color: "#4A6CF7",
    status: "confirmed",
    location: "성수동 문화공간",
  },
  {
    id: "evt-2",
    title: "북촌 한옥 체험",
    date: "2026-05-15",
    time: "14:00",
    price: "₩20,000",
    color: "#10B981",
    status: "confirmed",
    location: "북촌로5길",
  },
  {
    id: "evt-3",
    title: "광장시장 야시장 투어",
    date: "2026-05-18",
    time: "18:30",
    price: "₩0",
    color: "#F59E0B",
    status: "pending",
    location: "광장시장",
  },
  {
    id: "evt-4",
    title: "한강 피크닉 패키지",
    date: "2026-05-22",
    time: "11:00",
    price: "₩12,000",
    color: "#EC4899",
    status: "confirmed",
    location: "여의도 한강공원",
  },
  {
    id: "evt-5",
    title: "경복궁 야간 개장",
    date: "2026-05-25",
    time: "20:00",
    price: "₩3,000",
    color: "#7C3AED",
    status: "pending",
    location: "경복궁",
  },
  {
    id: "evt-6",
    title: "인사동 문화 탐방",
    date: "2026-05-28",
    time: "13:00",
    price: "₩0",
    color: "#06B6D4",
    status: "confirmed",
    location: "인사동",
  },
  {
    id: "evt-7",
    title: "남산 야경 투어",
    date: "2026-05-28",
    time: "20:30",
    price: "₩5,000",
    color: "#EF4444",
    status: "pending",
    location: "남산타워",
  },
];

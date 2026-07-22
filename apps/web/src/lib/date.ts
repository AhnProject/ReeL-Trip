/** 날짜/시간 관련 공용 유틸 */

/** "YYYY-MM-DD" → "MM.DD" */
export function formatMonthDay(dateStr: string): string {
  const [, month, day] = dateStr.split("-");
  return `${month}.${day}`;
}

/** "YYYY-MM-DD" → "월" | "화" | "수" | "목" | "금" | "토" | "일" */
export function getKoreanDay(dateStr: string): string {
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return days[new Date(dateStr).getDay()];
}

/** 상대 시간 표시: "N분 전" / "N시간 전" / "N일 전" */
export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

/** 오늘 기준 D-day 계산 (양수: 미래까지 남은 일수, 0: 오늘, 음수: 지남) */
export function calcDday(dateStr: string): number {
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

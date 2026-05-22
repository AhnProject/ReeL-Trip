export interface CalendarEvent {
  id: string;
  title: string;
  date: string;        // YYYY-MM-DD
  time?: string;       // HH:MM (optional)
  price?: string;      // 표시용 가격 문자열 ex) "₩35,000"
  color: string;       // hex
  status?: "confirmed" | "pending";
  location?: string;
}

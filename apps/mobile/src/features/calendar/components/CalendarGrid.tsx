import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import type { EventResponse } from "@/domains/event/api";
import { padZ, toDateStr } from "../hooks/useCalendarData";
import { C } from "@/lib/colors";
import { card, shadow, row, sp } from "@/lib/styles";

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];
const DAY_COLORS = [C.red, C.t3, C.t3, C.t3, C.t3, C.t3, C.primary];

function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function firstDow(y: number, m: number)    { return new Date(y, m, 1).getDay(); }

interface CalendarGridProps {
  viewYear:     number;
  viewMonth:    number;
  selectedDate: string;
  today:        Date;
  eventsOn:     (d: string) => EventResponse[];
  onSelectDate: (date: string) => void;
  onPrevMonth:  () => void;
  onNextMonth:  () => void;
}

export function CalendarGrid({
  viewYear, viewMonth, selectedDate, today,
  eventsOn, onSelectDate, onPrevMonth, onNextMonth,
}: CalendarGridProps) {
  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());
  const numDays  = daysInMonth(viewYear, viewMonth);
  const startDow = firstDow(viewYear, viewMonth);
  const cells: (number | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: numDays }, (_, i) => i + 1),
  ];

  return (
    <View>
      {/* 월 네비게이션 */}
      <View style={s.monthNav}>
        <TouchableOpacity onPress={onPrevMonth} style={s.navBtn}>
          <Text style={s.navArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={s.monthLabel}>{viewYear}년 {viewMonth + 1}월</Text>
        <TouchableOpacity onPress={onNextMonth} style={s.navBtn}>
          <Text style={s.navArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* 캘린더 그리드 */}
      <View style={s.gridCard}>
        <View style={s.dayHeader}>
          {DAY_LABELS.map((d, i) => (
            <View key={d} style={s.dayCell}>
              <Text style={[s.dayLabel, { color: DAY_COLORS[i] }]}>{d}</Text>
            </View>
          ))}
        </View>

        <View style={s.dateGrid}>
          {cells.map((day, idx) => {
            if (day === null) return <View key={`b-${idx}`} style={s.dateCell} />;
            const dateStr = toDateStr(viewYear, viewMonth, day);
            const dow     = (startDow + day - 1) % 7;
            const isToday = dateStr === todayStr;
            const isSel   = dateStr === selectedDate;
            const evts    = eventsOn(dateStr);

            return (
              <TouchableOpacity key={day} style={s.dateCell} onPress={() => onSelectDate(dateStr)}>
                <View style={[s.bubble, isToday && s.bubbleToday, isSel && !isToday && s.bubbleSel]}>
                  <Text style={[
                    s.dateNum,
                    { color: isToday ? C.white : dow === 0 ? C.red : dow === 6 ? C.primary : C.t2 },
                    isSel && !isToday && { color: C.primary },
                  ]}>
                    {day}
                  </Text>
                </View>
                <View style={s.dots}>
                  {evts.slice(0, 3).map((e) => (
                    <View key={e.id} style={[s.dot, { backgroundColor: e.color }]} />
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  monthNav:   { ...row, justifyContent: "space-between", paddingHorizontal: sp.xl, paddingVertical: sp.lg },
  navBtn:     { width: 36, height: 36, borderRadius: 10, backgroundColor: C.white, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.border },
  navArrow:   { fontSize: 20, color: C.t2, lineHeight: 24 },
  monthLabel: { fontSize: 18, fontWeight: "700", color: C.t1 },
  gridCard:   { ...card, ...shadow.md, marginHorizontal: sp.lg, overflow: "hidden" },
  dayHeader:  { flexDirection: "row", backgroundColor: "#FAFBFF", borderBottomWidth: 1, borderBottomColor: C.border },
  dayCell:    { flex: 1, alignItems: "center", paddingVertical: sp.sm + 2 },
  dayLabel:   { fontSize: 12, fontWeight: "700" },
  dateGrid:   { flexDirection: "row", flexWrap: "wrap" },
  dateCell:   { width: "14.28%", alignItems: "center", paddingVertical: sp.sm, minHeight: 52 },
  bubble:     { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  bubbleToday:{ backgroundColor: C.primary },
  bubbleSel:  { backgroundColor: C.primaryLight },
  dateNum:    { fontSize: 13, fontWeight: "600" },
  dots:       { flexDirection: "row", gap: 2, marginTop: 2 },
  dot:        { width: 4, height: 4, borderRadius: 2 },
});

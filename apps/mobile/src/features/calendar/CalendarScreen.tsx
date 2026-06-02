import { useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCalendarData, toDateStr } from "./hooks/useCalendarData";
import { CalendarGrid } from "./components/CalendarGrid";
import { CalendarEventCard } from "./components/CalendarEventCard";
import { CreateEventModal } from "./components/CreateEventModal";
import { AppHeader } from "@/components/ui/AppHeader";
import { FAB } from "@/components/ui/FAB";
import { EmptyState } from "@/components/ui/EmptyState";
import { C } from "@/lib/colors";

export function CalendarScreen() {
  const {
    username, spaceId,
    viewYear, viewMonth, selectedDate, today,
    setSelectedDate, prevMonth, nextMonth,
    handleToggle, eventsOn,
  } = useCalendarData();

  const [showCreate, setShowCreate] = useState(false);
  const selectedEvts = eventsOn(selectedDate);

  return (
    <SafeAreaView style={s.safe}>
      <AppHeader title="캘린더" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <CalendarGrid
          viewYear={viewYear}
          viewMonth={viewMonth}
          selectedDate={selectedDate}
          today={today}
          eventsOn={eventsOn}
          onSelectDate={setSelectedDate}
          onPrevMonth={prevMonth}
          onNextMonth={nextMonth}
        />

        {/* 선택 날짜 이벤트 */}
        <View style={s.evtSection}>
          <Text style={s.evtDateLabel}>
            {new Date(selectedDate).toLocaleDateString("ko-KR", {
              month: "long", day: "numeric", weekday: "short",
            })} · {username}님의 일정
          </Text>

          {selectedEvts.length === 0 ? (
            <EmptyState emoji="📅" title="일정이 없습니다" />
          ) : (
            selectedEvts.map((evt) => (
              <CalendarEventCard key={evt.id} event={evt} onToggle={() => handleToggle(evt)} />
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <FAB
        label="일정 추가"
        iconName="add"
        onPress={() => setShowCreate(true)}
        disabled={!spaceId}
      />

      {showCreate && spaceId && (
        <CreateEventModal
          visible={showCreate}
          spaceId={spaceId}
          defaultDate={selectedDate}
          onClose={() => setShowCreate(false)}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  evtSection: { padding: 20 },
  evtDateLabel: { fontSize: 14, fontWeight: "700", color: C.t2, marginBottom: 12 },
});

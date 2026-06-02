import { View, Text, StyleSheet } from "react-native";
import type { EventResponse } from "@/domains/event/api";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { C } from "@/lib/colors";
import { card, row, sp } from "@/lib/styles";

interface CalendarEventCardProps {
  event:    EventResponse;
  onToggle: () => void;
}

export function CalendarEventCard({ event, onToggle }: CalendarEventCardProps) {
  return (
    <View style={[s.card, { borderLeftColor: event.color }]}>
      <View style={s.info}>
        <Text style={s.title} numberOfLines={1}>{event.title}</Text>
        {event.price    ? <Text style={s.meta}>{event.price}</Text> : null}
        {event.location ? <Text style={s.location} numberOfLines={1}>📍 {event.location}</Text> : null}
      </View>
      <StatusBadge status={event.status} onToggle={onToggle} />
    </View>
  );
}

const s = StyleSheet.create({
  card:     { ...card, ...row, padding: 14, marginBottom: sp.sm, borderLeftWidth: 4 },
  info:     { flex: 1, marginRight: sp.md },
  title:    { fontSize: 14, fontWeight: "700", color: C.t1, marginBottom: 2 },
  meta:     { fontSize: 12, color: C.t3, marginBottom: 2 },
  location: { fontSize: 11, color: C.t4 },
});

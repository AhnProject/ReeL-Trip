import { View, Text, StyleSheet } from "react-native";
import type { EventResponse } from "@/domains/event/api";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { C } from "@/lib/colors";
import { card, row, sp } from "@/lib/styles";

interface EventCardProps {
  event: EventResponse;
  onToggle: () => void;
}

export function EventCard({ event, onToggle }: EventCardProps) {
  const timeStr = event.startDate.includes("T")
    ? event.startDate.split("T")[1]?.slice(0, 5) ?? ""
    : "";

  return (
    <View style={[s.card, { borderLeftColor: event.color, borderLeftWidth: 3 }]}>
      <View style={s.info}>
        <Text style={s.title} numberOfLines={1}>{event.title}</Text>
        <Text style={s.meta}>
          {timeStr ? `🕐 ${timeStr}` : ""}
          {timeStr && event.price ? " · " : ""}
          {event.price ?? ""}
        </Text>
        {event.location ? (
          <Text style={s.location} numberOfLines={1}>📍 {event.location}</Text>
        ) : null}
      </View>
      <StatusBadge status={event.status} onToggle={onToggle} />
    </View>
  );
}

const s = StyleSheet.create({
  card:     { ...card, ...row, paddingVertical: sp.md, paddingHorizontal: 14, marginBottom: sp.sm },
  info:     { flex: 1, marginRight: sp.md },
  title:    { fontSize: 14, fontWeight: "700", color: C.t1, marginBottom: 2 },
  meta:     { fontSize: 12, color: C.t3, marginBottom: 2 },
  location: { fontSize: 11, color: C.t4 },
});

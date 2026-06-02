import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { PlaceResponse } from "@/domains/place/api";
import { C } from "@/lib/colors";
import { card, shadow, row, radius, sp } from "@/lib/styles";

interface PlaceCardProps {
  place:           PlaceResponse;
  isConfirmed:     boolean;
  onToggleConfirm: () => void;
}

export function PlaceCard({ place, isConfirmed, onToggleConfirm }: PlaceCardProps) {
  return (
    <View style={s.card}>
      {place.thumbnailUrl ? (
        <Image source={{ uri: place.thumbnailUrl }} style={s.thumb} resizeMode="cover" />
      ) : (
        <View style={s.thumbEmpty}>
          <Ionicons name="location" size={24} color={C.t4} />
        </View>
      )}
      <View style={s.info}>
        <Text style={s.name} numberOfLines={1}>{place.name}</Text>
        {place.category && (
          <View style={s.catBadge}><Text style={s.catText}>{place.category}</Text></View>
        )}
        {(place.region || place.country) && (
          <Text style={s.meta} numberOfLines={1}>📍 {[place.country, place.region].filter(Boolean).join(" · ")}</Text>
        )}
        {place.priceDesc && <Text style={s.meta} numberOfLines={1}>💰 {place.priceDesc}</Text>}
        {place.tags.length > 0 && (
          <View style={s.tagRow}>
            {place.tags.slice(0, 3).map((t) => (
              <View key={t} style={s.tag}><Text style={s.tagText}>#{t}</Text></View>
            ))}
          </View>
        )}
      </View>
      <TouchableOpacity onPress={onToggleConfirm} style={[s.confirmBtn, isConfirmed && s.confirmActive]}>
        <Ionicons name={isConfirmed ? "checkmark-circle" : "checkmark-circle-outline"} size={16} color={isConfirmed ? C.white : C.t4} />
        <Text style={[s.confirmText, isConfirmed && { color: C.white }]}>
          {isConfirmed ? "확정됨" : "확정"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  card:         { ...card, ...shadow.sm, flexDirection: "row", alignItems: "center", marginBottom: sp.sm + 2, overflow: "hidden" },
  thumb:        { width: 80, height: 90 },
  thumbEmpty:   { width: 80, height: 90, backgroundColor: C.bg, alignItems: "center", justifyContent: "center" },
  info:         { flex: 1, padding: sp.md },
  name:         { fontSize: 14, fontWeight: "700", color: C.t1, marginBottom: 4 },
  catBadge:     { backgroundColor: C.primaryLight, borderRadius: sp.sm + 2, paddingHorizontal: sp.sm, paddingVertical: 2, alignSelf: "flex-start", marginBottom: 4 },
  catText:      { fontSize: 10, color: C.primary, fontWeight: "600" },
  meta:         { fontSize: 11, color: C.t4, marginBottom: 2 },
  tagRow:       { ...row, flexWrap: "wrap", gap: 4, marginTop: 4 },
  tag:          { backgroundColor: C.bg, borderRadius: radius.sm, paddingHorizontal: sp.sm - 2, paddingVertical: 2 },
  tagText:      { fontSize: 10, color: C.t3 },
  confirmBtn:   { ...row, gap: 4, margin: sp.md, borderRadius: radius.full, paddingHorizontal: sp.sm + 2, paddingVertical: 7, borderWidth: 1, borderColor: C.borderLight, backgroundColor: C.bg },
  confirmActive:{ backgroundColor: C.green, borderColor: C.green },
  confirmText:  { fontSize: 11, fontWeight: "600", color: C.t4 },
});

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import type { TeamSpaceResponse } from "@/domains/teamspace/api";
import { C } from "@/lib/colors";
import { card, shadow, radius, sp } from "@/lib/styles";

interface SpaceCardProps {
  space: TeamSpaceResponse;
  onPress: () => void;
}

export function SpaceCard({ space, onPress }: SpaceCardProps) {
  return (
    <TouchableOpacity onPress={onPress} style={s.card}>
      <View style={[s.emoji, { backgroundColor: space.bgColor ?? C.primary }]}>
        <Text style={{ fontSize: 20 }}>{space.emoji ?? "✈️"}</Text>
      </View>
      <Text style={s.name} numberOfLines={1}>{space.name}</Text>
      <Text style={s.member}>{space.members.length}명</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card:   { ...card, ...shadow.md, width: 120, padding: 14, alignItems: "center" },
  emoji:  { width: 48, height: 48, borderRadius: radius.md + 2, alignItems: "center", justifyContent: "center", marginBottom: sp.sm },
  name:   { fontSize: 13, fontWeight: "700", color: C.t1, textAlign: "center", marginBottom: 2 },
  member: { fontSize: 11, color: C.t4 },
});

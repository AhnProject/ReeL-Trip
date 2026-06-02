import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import type { TeamSpaceResponse } from "@/domains/teamspace/api";
import { C } from "@/lib/colors";
import { row, radius, sp } from "@/lib/styles";

interface SpaceTabsProps {
  spaces:      TeamSpaceResponse[];
  selectedIdx: number;
  onSelect:    (idx: number) => void;
}

export function SpaceTabs({ spaces, selectedIdx, onSelect }: SpaceTabsProps) {
  if (spaces.length <= 1) return null;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabs} contentContainerStyle={{ paddingHorizontal: sp.lg, gap: sp.sm }}>
      {spaces.map((sp_, i) => (
        <TouchableOpacity key={sp_.id} onPress={() => onSelect(i)} style={[s.tab, i === selectedIdx && s.tabActive]}>
          <Text style={{ marginRight: 4 }}>{sp_.emoji ?? "✈️"}</Text>
          <Text style={[s.tabText, i === selectedIdx && { color: C.primary }]}>{sp_.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

interface SpaceInfoProps {
  space: TeamSpaceResponse;
}

export function SpaceInfo({ space }: SpaceInfoProps) {
  return (
    <View style={s.info}>
      <View style={[s.emojiBox, { backgroundColor: space.bgColor ?? C.primary }]}>
        <Text style={{ fontSize: 22 }}>{space.emoji ?? "✈️"}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.name}>{space.name}</Text>
        <Text style={s.meta}>{space.members.length}명 참여 중</Text>
      </View>
      <View style={s.avatarRow}>
        {space.members.slice(0, 4).map((m, i) => (
          <View key={m.userId} style={[s.avatar, { marginLeft: i === 0 ? 0 : -8, zIndex: 10 - i }]}>
            <Text style={s.avatarText}>{m.username.slice(0, 1)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  tabs:      { backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border, maxHeight: 50 },
  tab:       { ...row, paddingHorizontal: 14, paddingVertical: sp.sm + 2, borderRadius: radius.full, backgroundColor: C.bg },
  tabActive: { backgroundColor: C.primaryLight },
  tabText:   { fontSize: 13, fontWeight: "600", color: C.t3 },
  info:      { ...row, backgroundColor: C.white, paddingHorizontal: sp.lg, paddingVertical: 14, gap: sp.md, borderBottomWidth: 1, borderBottomColor: C.border },
  emojiBox:  { width: 44, height: 44, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  name:      { fontSize: 15, fontWeight: "700", color: C.t1 },
  meta:      { fontSize: 12, color: C.t4, marginTop: 2 },
  avatarRow: { flexDirection: "row" },
  avatar:    { width: 28, height: 28, borderRadius: 14, backgroundColor: C.primary, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: C.white },
  avatarText:{ color: C.white, fontSize: 11, fontWeight: "700" },
});

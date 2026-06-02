import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C } from "@/lib/colors";
import { screenHeader, rtBadge, sp } from "@/lib/styles";

interface HeaderProps {
  username: string;
  onBell: () => void;
}

export function Header({ username, onBell }: HeaderProps) {
  return (
    <View style={s.header}>
      <View style={s.left}>
        <View style={s.badge}><Text style={s.badgeText}>RT</Text></View>
        <View>
          <Text style={s.brand}>ReeL-Trip</Text>
          <Text style={s.sub}>{username}님, 환영합니다</Text>
        </View>
      </View>
      <TouchableOpacity onPress={onBell} style={s.bell}>
        <Ionicons name="notifications-outline" size={22} color={C.t2} />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  header:    screenHeader,
  left:      { flexDirection: "row", alignItems: "center", gap: sp.sm + 2 },
  badge:     { ...rtBadge, borderRadius: 12 },
  badgeText: { color: C.white, fontSize: 12, fontWeight: "800" },
  brand:     { fontSize: 15, fontWeight: "700", color: C.t1 },
  sub:       { fontSize: 11, color: C.t4 },
  bell:      { padding: 4 },
});

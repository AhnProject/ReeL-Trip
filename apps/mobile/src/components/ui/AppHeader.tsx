import { View, Text, StyleSheet } from "react-native";
import { C } from "@/lib/colors";
import { screenHeader, rtBadge } from "@/lib/styles";

interface AppHeaderProps {
  title: string;
  right?: React.ReactNode;
}

export function AppHeader({ title, right }: AppHeaderProps) {
  return (
    <View style={s.bar}>
      <View style={s.badge}><Text style={s.badgeText}>RT</Text></View>
      <Text style={s.title}>{title}</Text>
      {right ?? <View style={{ width: 36 }} />}
    </View>
  );
}

const s = StyleSheet.create({
  bar:       screenHeader,
  badge:     rtBadge,
  badgeText: { color: C.white, fontSize: 12, fontWeight: "800" },
  title:     { fontSize: 17, fontWeight: "700", color: C.t1 },
});

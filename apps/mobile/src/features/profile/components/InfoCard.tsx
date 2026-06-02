import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C } from "@/lib/colors";
import { card, row, radius, sp } from "@/lib/styles";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

export interface InfoRow {
  icon:  IconName;
  label: string;
  value: string;
}

interface InfoCardProps {
  title: string;
  rows:  InfoRow[];
}

export function InfoCard({ title, rows }: InfoCardProps) {
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>{title}</Text>
      {rows.map((r, idx) => (
        <View key={r.label} style={[s.row, idx > 0 && s.rowBorder]}>
          <View style={s.icon}><Ionicons name={r.icon} size={16} color={C.primary} /></View>
          <View style={s.body}>
            <Text style={s.label}>{r.label}</Text>
            <Text style={s.value}>{r.value}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  card:      { ...card, marginHorizontal: sp.lg, marginBottom: sp.md, padding: sp.lg },
  cardTitle: { fontSize: 13, fontWeight: "700", color: C.t3, marginBottom: sp.md, textTransform: "uppercase", letterSpacing: 0.5 },
  row:       { ...row, paddingVertical: sp.sm + 2 },
  rowBorder: { borderTopWidth: 1, borderTopColor: C.border },
  icon:      { width: 32, height: 32, borderRadius: radius.sm, backgroundColor: C.primaryLight, alignItems: "center", justifyContent: "center", marginRight: sp.md },
  body:      { flex: 1 },
  label:     { fontSize: 11, color: C.t4, marginBottom: 2 },
  value:     { fontSize: 14, fontWeight: "600", color: C.t1 },
});

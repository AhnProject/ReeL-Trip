import { View, Text, StyleSheet } from "react-native";
import { C } from "@/lib/colors";
import { card, radius, sp } from "@/lib/styles";

interface EmptyStateProps {
  emoji?: string;
  title: string;
  description?: string;
  small?: boolean;
}

export function EmptyState({ emoji, title, description, small }: EmptyStateProps) {
  if (small) {
    return (
      <View style={s.small}>
        <Text style={s.smallText}>{title}</Text>
      </View>
    );
  }
  return (
    <View style={s.card}>
      {emoji ? <Text style={s.emoji}>{emoji}</Text> : null}
      <Text style={s.title}>{title}</Text>
      {description ? <Text style={s.desc}>{description}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  card:      { ...card, alignItems: "center", paddingVertical: 48, borderStyle: "dashed", borderColor: C.borderLight },
  emoji:     { fontSize: 36, marginBottom: sp.sm + 2 },
  title:     { fontSize: 15, fontWeight: "700", color: C.t2, marginBottom: sp.sm - 2 },
  desc:      { fontSize: 13, color: C.t4 },
  small:     { ...card, padding: sp.xl, alignItems: "center" },
  smallText: { fontSize: 13, color: C.t4 },
});

import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { C } from "@/lib/colors";
import { radius, sp } from "@/lib/styles";

interface StatusBadgeProps {
  status: string;
  onToggle: () => void;
}

export function StatusBadge({ status, onToggle }: StatusBadgeProps) {
  const isConfirmed = status === "confirmed";
  return (
    <TouchableOpacity
      onPress={onToggle}
      style={[s.btn, isConfirmed ? s.confirmed : s.pending]}
    >
      <Text style={[s.text, { color: isConfirmed ? C.primary : C.t4 }]}>
        {isConfirmed ? "확정" : "대기"}
      </Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  btn:       { borderRadius: radius.full, paddingHorizontal: sp.md, paddingVertical: sp.sm - 2, borderWidth: 1 },
  confirmed: { backgroundColor: C.primaryLight, borderColor: C.primary },
  pending:   { backgroundColor: C.bg, borderColor: C.borderLight },
  text:      { fontSize: 12, fontWeight: "600" },
});

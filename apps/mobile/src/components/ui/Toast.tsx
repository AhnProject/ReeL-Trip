import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useToastStore } from "@/store/toast";
import { C } from "@/lib/colors";
import { sp, radius, shadow } from "@/lib/styles";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const CONFIG = {
  success: { bg: "#1A1A2E",  icon: "checkmark-circle" as IconName },
  error:   { bg: "#7F1D1D",  icon: "close-circle"     as IconName },
  info:    { bg: "#1A1A2E",  icon: "information-circle" as IconName },
} as const;

export function Toast() {
  const toasts = useToastStore((s) => s.toasts);
  if (toasts.length === 0) return null;

  const latest = toasts[toasts.length - 1];
  const { bg, icon } = CONFIG[latest.type];

  return (
    <View style={s.overlay} pointerEvents="none">
      <View style={[s.card, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={16} color={C.white} style={{ marginRight: sp.sm }} />
        <Text style={s.text}>{latest.message}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  overlay: {
    position:  "absolute",
    top:       60,
    left:      0,
    right:     0,
    alignItems:"center",
    zIndex:    9999,
  },
  card: {
    flexDirection:  "row",
    alignItems:     "center",
    paddingHorizontal: sp.xl,
    paddingVertical:   13,
    borderRadius:   radius.full,
    ...shadow.lg,
  },
  text: { fontSize: 14, fontWeight: "600", color: C.white },
});

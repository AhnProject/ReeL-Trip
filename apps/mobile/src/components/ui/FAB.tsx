import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C } from "@/lib/colors";
import { radius, sp, shadow } from "@/lib/styles";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

interface FABProps {
  label: string;
  iconName: IconName;
  onPress: () => void;
  disabled?: boolean;
}

export function FAB({ label, iconName, onPress, disabled }: FABProps) {
  return (
    <TouchableOpacity
      style={[s.fab, disabled && { opacity: 0.5 }]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
    >
      <Ionicons name={iconName} size={20} color={C.white} />
      <Text style={s.text}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  fab: {
    position:         "absolute",
    right:            sp.xl,
    bottom:           sp.xxl,
    flexDirection:    "row",
    alignItems:       "center",
    gap:              sp.sm - 2,
    backgroundColor:  C.primary,
    borderRadius:     radius.full,
    paddingHorizontal: sp.xl,
    paddingVertical:  13,
    shadowColor:      C.primary,
    ...shadow.lg,
  },
  text: { color: C.white, fontSize: 14, fontWeight: "700" },
});

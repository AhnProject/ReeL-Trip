import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from "react-native";
import { C } from "@/lib/colors";
import { radius } from "@/lib/styles";

interface ButtonProps {
  onPress: () => void;
  label: string;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "ghost" | "danger";
  style?: ViewStyle;
}

export function Button({ onPress, label, loading, disabled, variant = "primary", style }: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      style={[s.base, s[variant], isDisabled && s.disabled, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading
        ? <ActivityIndicator color={variant === "ghost" ? C.t3 : C.white} />
        : <Text style={[s.text, variant === "ghost" && { color: C.t3 }]}>{label}</Text>
      }
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  base:     { borderRadius: radius.full, paddingVertical: 14, alignItems: "center" },
  primary:  { backgroundColor: C.primary },
  ghost:    { borderWidth: 1, borderColor: C.borderLight, backgroundColor: C.white },
  danger:   { backgroundColor: C.red },
  disabled: { opacity: 0.5 },
  text:     { color: C.white, fontWeight: "700", fontSize: 15 },
});

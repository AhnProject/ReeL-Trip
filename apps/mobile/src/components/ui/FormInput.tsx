import { View, Text, TextInput, StyleSheet, TextInputProps } from "react-native";
import { C } from "@/lib/colors";
import { input, sp } from "@/lib/styles";

interface FormInputProps extends TextInputProps {
  label: string;
}

export function FormInput({ label, style, ...props }: FormInputProps) {
  return (
    <View style={s.wrapper}>
      <Text style={s.label}>{label}</Text>
      <TextInput style={[s.input, style]} placeholderTextColor={C.t4} {...props} />
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: { marginBottom: sp.lg },
  label:   { fontSize: 12, fontWeight: "600", color: C.t3, marginBottom: sp.sm - 2 },
  input,
});

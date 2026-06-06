import { View, ActivityIndicator, StyleSheet } from "react-native";
import { C } from "@/lib/colors";

export function LoadingScreen() {
  return (
    <View style={s.center}>
      <ActivityIndicator color={C.primary} size="large" />
    </View>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: C.bg },
});

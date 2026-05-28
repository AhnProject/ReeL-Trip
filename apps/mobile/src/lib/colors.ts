import { StyleSheet } from "react-native";

export const C = {
  primary:      "#4A6CF7",
  primaryLight: "#EEF2FF",
  primaryDim:   "rgba(74,108,247,0.12)",
  green:        "#16A34A",
  greenLight:   "#DCFCE7",
  red:          "#EF4444",
  orange:       "#F59E0B",
  bg:           "#F5F6FA",
  white:        "#FFFFFF",
  border:       "#EAEDF3",
  borderLight:  "#E2E6F0",
  t1:           "#0F172A",
  t2:           "#334155",
  t3:           "#64748B",
  t4:           "#94A3B8",
} as const;

export const shadow = StyleSheet.create({
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
}).sm;

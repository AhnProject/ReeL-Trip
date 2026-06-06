import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C } from "@/lib/colors";
import { card, row, radius, sp } from "@/lib/styles";

type PlaceType = "restaurant" | "attraction" | "unknown";

interface PlaceMenuSectionProps {
  menu:     string[];
  category: string | null;
}

const RESTAURANT_KEYWORDS  = ["식당", "음식", "카페", "맛집", "레스토랑", "restaurant", "cafe", "술집", "바", "분식", "이자카야", "포차", "고기", "치킨", "피자", "라멘", "초밥"];
const ATTRACTION_KEYWORDS  = ["관광", "액티비티", "어트랙션", "놀이", "체험", "투어", "attraction", "activity", "박물관", "미술관", "공원", "테마파크", "스파", "온천", "리조트"];

function detectType(category: string | null): PlaceType {
  if (!category) return "unknown";
  const lower = category.toLowerCase();
  if (RESTAURANT_KEYWORDS.some((k) => lower.includes(k))) return "restaurant";
  if (ATTRACTION_KEYWORDS.some((k) => lower.includes(k))) return "attraction";
  return "unknown";
}

export function PlaceMenuSection({ menu, category }: PlaceMenuSectionProps) {
  if (menu.length === 0) return null;

  const type  = detectType(category);
  const title = type === "attraction" ? "이용권 / 입장권" : "메뉴";
  const icon  = type === "attraction" ? "ticket-outline" : "restaurant-outline";
  const color = type === "attraction" ? C.green : C.primary;
  const bgCol = type === "attraction" ? "#DCFCE7" : C.primaryLight;

  return (
    <View style={s.wrap}>
      <View style={s.header}>
        <View style={[s.iconBox, { backgroundColor: bgCol }]}>
          <Ionicons name={icon as any} size={14} color={color} />
        </View>
        <Text style={s.title}>{title}</Text>
        <Text style={s.count}>{menu.length}개</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.scroll} contentContainerStyle={s.chipRow}>
        {menu.map((item, i) => (
          <View key={i} style={[s.chip, { borderColor: color + "33", backgroundColor: bgCol }]}>
            <Text style={[s.chipText, { color }]}>{item}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  wrap:     { marginBottom: 20 },
  header:   { ...row, gap: 8, marginBottom: sp.sm + 2 },
  iconBox:  { width: 26, height: 26, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  title:    { fontSize: 14, fontWeight: "700", color: C.t1, flex: 1 },
  count:    { fontSize: 12, color: C.t4 },
  scroll:   { marginHorizontal: -4 },
  chipRow:  { paddingHorizontal: 4, gap: 8, flexDirection: "row" },
  chip:     { borderRadius: radius.full, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 7 },
  chipText: { fontSize: 13, fontWeight: "500" },
});

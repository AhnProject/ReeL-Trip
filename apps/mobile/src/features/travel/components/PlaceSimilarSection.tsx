import { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, StyleSheet, Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C } from "@/lib/colors";
import { card, row, radius, sp } from "@/lib/styles";

// TODO: 실제 API 연결 시 PlaceResponse 기반의 SimilarPlace 타입으로 교체
export interface SimilarPlace {
  id:          number;
  name:        string;
  category:    string | null;
  region:      string | null;
  thumbnailUrl:string | null;
  matchScore:  number;  // 0 ~ 1
  tags:        string[];
}

interface PlaceSimilarSectionProps {
  similar:     SimilarPlace[];
  loading?:    boolean;
  onConsent?:  (consented: boolean) => void;
  consented?:  boolean;
}

function matchColor(score: number): string {
  if (score >= 0.9) return C.primary;
  if (score >= 0.7) return "#0D9488"; // teal
  return C.orange;
}

function MatchBadge({ score }: { score: number }) {
  const pct   = Math.round(score * 100);
  const color = matchColor(score);
  return (
    <View style={[s.matchBadge, { backgroundColor: color + "18", borderColor: color + "40" }]}>
      <View style={[s.matchDot, { backgroundColor: color }]} />
      <Text style={[s.matchText, { color }]}>{pct}%</Text>
    </View>
  );
}

function SimilarPlaceCard({ item, onPress }: { item: SimilarPlace; onPress?: () => void }) {
  return (
    <TouchableOpacity style={s.simCard} onPress={onPress} activeOpacity={0.8}>
      {item.thumbnailUrl ? (
        <Image source={{ uri: item.thumbnailUrl }} style={s.simThumb} resizeMode="cover" />
      ) : (
        <View style={s.simThumbEmpty}>
          <Ionicons name="location" size={20} color={C.t4} />
        </View>
      )}
      <View style={s.simInfo}>
        <Text style={s.simName} numberOfLines={2}>{item.name}</Text>
        {item.category && <Text style={s.simCat} numberOfLines={1}>{item.category}</Text>}
        {item.region   && <Text style={s.simRegion} numberOfLines={1}>📍 {item.region}</Text>}
        <MatchBadge score={item.matchScore} />
      </View>
    </TouchableOpacity>
  );
}

function SkeletonCard() {
  return (
    <View style={[s.simCard, s.skeleton]}>
      <View style={[s.simThumbEmpty, s.skeletonBg]} />
      <View style={s.simInfo}>
        <View style={[s.skeletonLine, { width: "80%", height: 13 }]} />
        <View style={[s.skeletonLine, { width: "50%", height: 10, marginTop: 6 }]} />
        <View style={[s.skeletonLine, { width: "40%", height: 10, marginTop: 4 }]} />
        <View style={[s.skeletonLine, { width: 44, height: 20, borderRadius: radius.full, marginTop: 8 }]} />
      </View>
    </View>
  );
}

export function PlaceSimilarSection({
  similar,
  loading = false,
  onConsent,
  consented = false,
}: PlaceSimilarSectionProps) {
  const [localConsent, setLocalConsent] = useState(consented);

  const handleToggle = (v: boolean) => {
    setLocalConsent(v);
    onConsent?.(v);
  };

  return (
    <View style={s.wrap}>
      {/* 헤더 */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.iconBox}>
            <Ionicons name="sparkles" size={14} color={C.primary} />
          </View>
          <View>
            <Text style={s.title}>비슷한 장소</Text>
            <Text style={s.subtitle}>AI가 분석한 다른 사용자의 기록</Text>
          </View>
        </View>
      </View>

      {/* 공개 동의 토글 */}
      <View style={s.consentRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.consentTitle}>내 기록 공개 동의</Text>
          <Text style={s.consentDesc}>동의 시 다른 사용자의 비슷한 장소를 볼 수 있습니다</Text>
        </View>
        <Switch
          value={localConsent}
          onValueChange={handleToggle}
          trackColor={{ false: C.borderLight, true: C.primary + "80" }}
          thumbColor={localConsent ? C.primary : C.t4}
        />
      </View>

      {/* 장소 목록 */}
      {!localConsent ? (
        <View style={s.lockedState}>
          <Ionicons name="lock-closed-outline" size={28} color={C.t4} />
          <Text style={s.lockedTitle}>공개 동의 후 이용 가능</Text>
          <Text style={s.lockedDesc}>내 장소 정보 공개에 동의하면{"\n"}비슷한 장소를 추천받을 수 있어요</Text>
        </View>
      ) : loading ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.cardRow}>
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </ScrollView>
      ) : similar.length === 0 ? (
        <View style={s.emptyState}>
          <Ionicons name="search-outline" size={28} color={C.t4} />
          <Text style={s.emptyTitle}>분석 중입니다</Text>
          <Text style={s.emptyDesc}>비슷한 장소를 찾고 있어요{"\n"}나중에 다시 확인해보세요</Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.cardRow}>
          {similar.map((item) => (
            <SimilarPlaceCard key={item.id} item={item} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap:         { marginBottom: 20 },
  header:       { ...row, justifyContent: "space-between", marginBottom: sp.md },
  headerLeft:   { ...row, gap: 10 },
  iconBox:      { width: 30, height: 30, borderRadius: radius.sm, backgroundColor: C.primaryLight, alignItems: "center", justifyContent: "center" },
  title:        { fontSize: 15, fontWeight: "700", color: C.t1 },
  subtitle:     { fontSize: 11, color: C.t3 },
  consentRow:   { ...row, ...card, padding: sp.md, marginBottom: sp.md, gap: sp.md },
  consentTitle: { fontSize: 13, fontWeight: "600", color: C.t1, marginBottom: 2 },
  consentDesc:  { fontSize: 11, color: C.t3 },
  lockedState:  { alignItems: "center", paddingVertical: 28, gap: 8 },
  lockedTitle:  { fontSize: 14, fontWeight: "600", color: C.t3 },
  lockedDesc:   { fontSize: 12, color: C.t4, textAlign: "center", lineHeight: 18 },
  emptyState:   { alignItems: "center", paddingVertical: 28, gap: 8 },
  emptyTitle:   { fontSize: 14, fontWeight: "600", color: C.t3 },
  emptyDesc:    { fontSize: 12, color: C.t4, textAlign: "center", lineHeight: 18 },
  cardRow:      { gap: 10, paddingVertical: 4 },
  // 카드
  simCard:      { ...card, width: 148, overflow: "hidden" },
  simThumb:     { width: "100%", height: 100 },
  simThumbEmpty:{ width: "100%", height: 100, backgroundColor: C.bg, alignItems: "center", justifyContent: "center" },
  simInfo:      { padding: sp.sm + 2 },
  simName:      { fontSize: 13, fontWeight: "700", color: C.t1, marginBottom: 4, lineHeight: 17 },
  simCat:       { fontSize: 10, color: C.primary, fontWeight: "600", marginBottom: 2 },
  simRegion:    { fontSize: 10, color: C.t4, marginBottom: 6 },
  matchBadge:   { ...row, gap: 4, alignSelf: "flex-start", borderWidth: 1, borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  matchDot:     { width: 5, height: 5, borderRadius: 3 },
  matchText:    { fontSize: 11, fontWeight: "700" },
  // 스켈레톤
  skeleton:     {},
  skeletonBg:   { backgroundColor: C.borderLight },
  skeletonLine: { backgroundColor: C.borderLight, borderRadius: 4 },
});

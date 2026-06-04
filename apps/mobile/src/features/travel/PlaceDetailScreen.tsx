import { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, StyleSheet, StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { usePlaceDetailStore } from "@/store/place-detail";
import { PlaceMapCard }       from "./components/PlaceMapCard";
import { PlaceMenuSection }   from "./components/PlaceMenuSection";
import { PlaceCorrectSection } from "./components/PlaceCorrectSection";
import { PlaceSimilarSection } from "./components/PlaceSimilarSection";
import type { PlaceResponse } from "@/domains/place/api";
import { C } from "@/lib/colors";
import { row, radius, sp } from "@/lib/styles";

// ── 신뢰도 배지 ─────────────────────────────────────────────────────────────

function ConfidenceBadge({ confidence }: { confidence: string | null }) {
  if (!confidence || confidence === "high") return null;

  const config = confidence === "medium"
    ? { label: "정보 일부 불확실", bg: "#FEF3C7", text: "#92400E", icon: "alert-circle-outline" as const }
    : { label: "정보 불확실",      bg: "#FEE2E2", text: "#991B1B", icon: "warning-outline" as const };

  return (
    <View style={[s.confBadge, { backgroundColor: config.bg }]}>
      <Ionicons name={config.icon} size={12} color={config.text} />
      <Text style={[s.confText, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

// ── 플랫폼 배지 ─────────────────────────────────────────────────────────────

function PlatformBadge({ platform }: { platform: string | null }) {
  if (!platform) return null;
  const isInsta = platform.includes("instagram");
  return (
    <View style={[s.platBadge, { backgroundColor: isInsta ? "#E1306C" : "#FF0000" }]}>
      <Ionicons name={isInsta ? "logo-instagram" : "logo-youtube"} size={11} color="#fff" />
      <Text style={s.platText}>{isInsta ? "Instagram" : "YouTube"}</Text>
    </View>
  );
}

// ── 정보 행 ────────────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={s.infoRow}>
      <View style={s.infoIconBox}>
        <Ionicons name={icon as any} size={14} color={C.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.infoLabel}>{label}</Text>
        <Text style={s.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

// ── 구분선 ─────────────────────────────────────────────────────────────────

function Divider() {
  return <View style={s.divider} />;
}

// ── 메인 스크린 ─────────────────────────────────────────────────────────────

export function PlaceDetailScreen() {
  const router = useRouter();
  const { place, setPlace } = usePlaceDetailStore();
  const [localPlace, setLocalPlace] = useState<PlaceResponse | null>(place);

  if (!localPlace) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={[s.safe, { alignItems: "center", justifyContent: "center" }]}>
          <Ionicons name="location-outline" size={40} color={C.t4} />
          <Text style={{ color: C.t3, marginTop: 12 }}>장소 정보를 찾을 수 없습니다</Text>
          <TouchableOpacity onPress={() => router.back()} style={[s.backBtn, { position: "relative", top: 0, left: 0, marginTop: 20 }]}>
            <Text style={{ color: C.primary, fontWeight: "600" }}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const p = localPlace;

  const priceText = (() => {
    if (p.priceDesc) return p.priceDesc;
    if (p.priceMin != null && p.priceMax != null)
      return `${p.priceMin.toLocaleString()} ~ ${p.priceMax.toLocaleString()}${p.currency ? ` ${p.currency}` : ""}`;
    if (p.priceMin != null)
      return `${p.priceMin.toLocaleString()}${p.currency ? ` ${p.currency}` : ""}~`;
    return null;
  })();

  const handlePlaceUpdate = (updated: Partial<PlaceResponse>) => {
    setLocalPlace((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updated };
      setPlace(next);
      return next;
    });
  };

  return (
    <View style={s.safe}>
      <StatusBar barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false} bounces>

        {/* ── 히어로 이미지 ── */}
        <View style={s.heroWrap}>
          {p.thumbnailUrl ? (
            <Image source={{ uri: p.thumbnailUrl }} style={s.hero} resizeMode="cover" />
          ) : (
            <View style={[s.hero, s.heroEmpty]}>
              <Ionicons name="location" size={48} color={C.t4} />
            </View>
          )}
          {/* 그라데이션 오버레이 */}
          <View style={s.heroGrad} pointerEvents="none" />

          {/* 뒤로가기 버튼 */}
          <SafeAreaView style={s.heroOverlay} edges={["top"]}>
            <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={20} color={C.white} />
            </TouchableOpacity>
            <PlatformBadge platform={p.sourcePlatform} />
          </SafeAreaView>
        </View>

        {/* ── 본문 ── */}
        <View style={s.body}>

          {/* 이름 + 배지 */}
          <View style={s.titleRow}>
            <Text style={s.name}>{p.name}</Text>
            {p.category && (
              <View style={s.catBadge}><Text style={s.catText}>{p.category}</Text></View>
            )}
          </View>
          <ConfidenceBadge confidence={p.confidence} />

          <Divider />

          {/* 지도 */}
          <Text style={s.sectionTitle}>위치</Text>
          <PlaceMapCard
            name={p.name}
            address={p.address}
            region={p.region}
            country={p.country}
            latitude={p.latitude}
            longitude={p.longitude}
          />

          {/* 상세 정보 */}
          {(priceText || p.hours || p.region) && (
            <>
              <Text style={s.sectionTitle}>상세 정보</Text>
              <View style={s.infoCard}>
                {priceText  && <InfoRow icon="cash-outline"    label="가격"     value={priceText} />}
                {p.hours    && <InfoRow icon="time-outline"    label="운영시간" value={p.hours} />}
                {(p.region || p.country) && (
                  <InfoRow
                    icon="globe-outline"
                    label="지역"
                    value={[p.country, p.region].filter(Boolean).join(" · ")}
                  />
                )}
              </View>
            </>
          )}

          {/* 메뉴 / 이용권 */}
          {p.menu.length > 0 && (
            <>
              <Divider />
              <PlaceMenuSection menu={p.menu} category={p.category} />
            </>
          )}

          {/* 태그 */}
          {p.tags.length > 0 && (
            <>
              <Divider />
              <View style={s.tagWrap}>
                {p.tags.map((t) => (
                  <View key={t} style={s.tag}>
                    <Text style={s.tagText}>#{t}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* 출처 링크 */}
          {p.sourceUrl && (
            <TouchableOpacity
              style={s.sourceRow}
              onPress={() => {
                const { Linking } = require("react-native");
                Linking.openURL(p.sourceUrl!);
              }}
            >
              <Ionicons name="open-outline" size={13} color={C.t4} />
              <Text style={s.sourceText}>원본 콘텐츠 보기</Text>
            </TouchableOpacity>
          )}

          <Divider />

          {/* 정보 보완 */}
          <Text style={s.sectionTitle}>정보 보완</Text>
          <PlaceCorrectSection place={p} onUpdate={handlePlaceUpdate} />

          <Divider />

          {/* 비슷한 장소 */}
          <Text style={s.sectionTitle}>AI 추천</Text>
          <PlaceSimilarSection
            similar={[]}
            loading={false}
            // TODO: onConsent → API 연결 후 서버에 동의 저장
          />

        </View>
      </ScrollView>
    </View>
  );
}

// ── 스타일 ─────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: C.white },
  // 히어로
  heroWrap:   { position: "relative" },
  hero:       { width: "100%", height: 260 },
  heroEmpty:  { backgroundColor: "#E8EDF5", alignItems: "center", justifyContent: "center" },
  heroGrad:   { position: "absolute", bottom: 0, left: 0, right: 0, height: 80, backgroundColor: "rgba(0,0,0,0.25)" },
  heroOverlay:{ position: "absolute", top: 0, left: 0, right: 0, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: sp.md, paddingTop: 4 },
  backBtn:    { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center" },
  // 플랫폼 배지
  platBadge:  { ...row, gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full },
  platText:   { fontSize: 11, fontWeight: "700", color: C.white },
  // 본문
  body:       { padding: sp.xl, paddingBottom: 60 },
  titleRow:   { ...row, gap: 8, flexWrap: "wrap", marginBottom: 8 },
  name:       { fontSize: 22, fontWeight: "800", color: C.t1, flex: 1 },
  catBadge:   { backgroundColor: C.primaryLight, borderRadius: sp.sm + 2, paddingHorizontal: sp.sm + 2, paddingVertical: 4, alignSelf: "flex-start" },
  catText:    { fontSize: 11, color: C.primary, fontWeight: "700" },
  confBadge:  { ...row, gap: 5, alignSelf: "flex-start", borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 8 },
  confText:   { fontSize: 11, fontWeight: "600" },
  divider:    { height: 1, backgroundColor: C.border, marginVertical: sp.xl },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: C.t3, letterSpacing: 0.3, marginBottom: sp.md, textTransform: "uppercase" },
  // 정보 카드
  infoCard:   { backgroundColor: C.bg, borderRadius: radius.lg, overflow: "hidden", marginBottom: 20 },
  infoRow:    { ...row, gap: 12, padding: sp.md, borderBottomWidth: 1, borderBottomColor: C.border },
  infoIconBox:{ width: 30, height: 30, borderRadius: radius.sm, backgroundColor: C.primaryLight, alignItems: "center", justifyContent: "center" },
  infoLabel:  { fontSize: 10, color: C.t4, fontWeight: "600", marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.3 },
  infoValue:  { fontSize: 13, color: C.t1, fontWeight: "500" },
  // 태그
  tagWrap:    { ...row, flexWrap: "wrap", gap: 8, marginBottom: 20 },
  tag:        { backgroundColor: C.bg, borderRadius: radius.full, paddingHorizontal: sp.md, paddingVertical: 6, borderWidth: 1, borderColor: C.borderLight },
  tagText:    { fontSize: 12, color: C.t3 },
  // 출처
  sourceRow:  { ...row, gap: 5, marginBottom: 12 },
  sourceText: { fontSize: 11, color: C.t4 },
});

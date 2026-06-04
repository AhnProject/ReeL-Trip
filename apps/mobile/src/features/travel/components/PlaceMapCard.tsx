import { View, Text, TouchableOpacity, StyleSheet, Linking, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C } from "@/lib/colors";
import { card, row, radius, sp } from "@/lib/styles";

interface PlaceMapCardProps {
  name:      string;
  address:   string | null;
  region:    string | null;
  country:   string | null;
  latitude:  number | null;
  longitude: number | null;
}

function openMaps(lat: number | null, lng: number | null, name: string, address: string | null) {
  const query = lat && lng
    ? `${lat},${lng}`
    : encodeURIComponent(address ?? name);

  const url = Platform.select({
    ios:     lat && lng ? `maps:0,0?q=${encodeURIComponent(name)}@${lat},${lng}` : `maps:0,0?q=${query}`,
    android: `geo:0,0?q=${query}(${encodeURIComponent(name)})`,
  }) ?? `https://www.google.com/maps/search/?api=1&query=${query}`;

  Linking.openURL(url).catch(() =>
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`)
  );
}

export function PlaceMapCard({ name, address, region, country, latitude, longitude }: PlaceMapCardProps) {
  const locationLine = [address, region, country].filter(Boolean).join(", ");
  const hasCoords    = latitude != null && longitude != null;

  return (
    <View style={s.wrap}>
      {/* 지도 플레이스홀더 */}
      <TouchableOpacity
        style={s.mapArea}
        activeOpacity={0.85}
        onPress={() => openMaps(latitude, longitude, name, address)}
      >
        {/* 격자 배경 패턴 효과 */}
        <View style={s.gridOverlay} pointerEvents="none" />

        <View style={s.pinWrap}>
          <View style={s.pinCircle}>
            <Ionicons name="location" size={22} color={C.white} />
          </View>
          <View style={s.pinTail} />
        </View>

        <View style={s.mapBadge}>
          <Ionicons name="map-outline" size={12} color={C.primary} />
          <Text style={s.mapBadgeText}>지도 앱에서 보기</Text>
        </View>
      </TouchableOpacity>

      {/* 주소 행 */}
      <View style={s.addrRow}>
        <Ionicons name="location-outline" size={14} color={C.t3} />
        <View style={{ flex: 1, marginLeft: 6 }}>
          {locationLine ? (
            <Text style={s.addrText}>{locationLine}</Text>
          ) : (
            <Text style={[s.addrText, { color: C.t4 }]}>주소 정보 없음</Text>
          )}
          {hasCoords && (
            <Text style={s.coordText}>{latitude?.toFixed(5)}, {longitude?.toFixed(5)}</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap:         { ...card, overflow: "hidden", marginBottom: 20 },
  mapArea:      { height: 140, backgroundColor: "#E8EDF5", alignItems: "center", justifyContent: "center", position: "relative" },
  gridOverlay:  {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    borderWidth: 0,
    // 격자 느낌의 배경
    backgroundColor: "#DDE4EF",
  },
  pinWrap:      { alignItems: "center", zIndex: 2 },
  pinCircle:    { width: 40, height: 40, borderRadius: 20, backgroundColor: C.primary, alignItems: "center", justifyContent: "center", elevation: 4, shadowColor: C.primary, shadowOpacity: 0.4, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
  pinTail:      { width: 3, height: 10, backgroundColor: C.primary, borderBottomLeftRadius: 2, borderBottomRightRadius: 2 },
  mapBadge:     { ...row, gap: 4, position: "absolute", bottom: 10, right: 10, backgroundColor: C.white, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 5, elevation: 2 },
  mapBadgeText: { fontSize: 11, fontWeight: "600", color: C.primary },
  addrRow:      { ...row, padding: sp.md, alignItems: "flex-start" },
  addrText:     { fontSize: 13, color: C.t2, lineHeight: 18 },
  coordText:    { fontSize: 10, color: C.t4, marginTop: 2 },
});

import { View, Text, TouchableOpacity, ScrollView, StyleSheet, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useProfileData } from "./hooks/useProfileData";
import { ProfileHeader } from "./components/ProfileHeader";
import { InfoCard } from "./components/InfoCard";
import type { InfoRow } from "./components/InfoCard";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { C } from "@/lib/colors";

export function ProfileScreen() {
  const { profile, username, loading, refreshing, onRefresh, handleLogout } = useProfileData();

  if (loading) return <LoadingScreen />;

  const accountRows: InfoRow[] = [
    { icon: "person-outline", label: "아이디", value: profile?.username || username },
    ...(profile?.email ? [{ icon: "mail-outline" as const, label: "이메일", value: profile.email }] : []),
    ...(profile?.role ? [{ icon: "shield-checkmark-outline" as const, label: "역할", value: profile.role }] : []),
    ...(profile?.createdAt ? [{ icon: "calendar-outline" as const, label: "가입일", value: profile.createdAt.slice(0, 10) }] : []),
  ];

  const isPro = profile?.plan?.toLowerCase().includes("pro");

  return (
    <ScrollView
      style={s.scroll}
      contentContainerStyle={s.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />
      }
    >
      <View style={s.header}>
        <Text style={s.headerTitle}>프로필</Text>
      </View>

      <ProfileHeader profile={profile} username={username} />

      <InfoCard title="계정 정보" rows={accountRows} />

      {/* 플랜 카드 */}
      <View style={s.card}>
        <Text style={s.cardTitle}>플랜</Text>
        <View style={s.planRow}>
          <View style={s.planInfo}>
            <Ionicons name="star-outline" size={20} color={C.primary} />
            <Text style={s.planName}>{isPro ? "Pro 플랜" : "Free 플랜"}</Text>
          </View>
          <View style={[s.planBadge, isPro ? s.planBadgePro : s.planBadgeFree]}>
            <Text style={[s.planBadgeText, isPro ? s.planBadgeTextPro : s.planBadgeTextFree]}>
              {isPro ? "Pro" : "Free"}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={18} color={C.white} style={{ marginRight: 8 }} />
        <Text style={s.logoutText}>로그아웃</Text>
      </TouchableOpacity>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: C.bg },
  container: { paddingBottom: 40 },
  header: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: C.t1 },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  cardTitle: {
    fontSize: 13, fontWeight: "700", color: C.t3,
    marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5,
  },
  planRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  planInfo: { flexDirection: "row", alignItems: "center", gap: 8 },
  planName: { fontSize: 15, fontWeight: "600", color: C.t1 },
  planBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  planBadgePro: { backgroundColor: C.primaryLight },
  planBadgeFree: { backgroundColor: "#F1F5F9" },
  planBadgeText: { fontSize: 11, fontWeight: "700" },
  planBadgeTextPro: { color: C.primary },
  planBadgeTextFree: { color: C.t3 },
  logoutBtn: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: C.red,
    borderRadius: 999,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: { color: C.white, fontWeight: "700", fontSize: 15 },
});

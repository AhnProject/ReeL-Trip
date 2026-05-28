import { useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { clearAuth, getToken, getUsername } from "@/lib/auth-store";
import { getProfile, UserProfile } from "@/domains/user/api";
import { C } from "@/lib/colors";

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [token, name] = await Promise.all([getToken(), getUsername()]);
      setUsername(name ?? "");
      if (token) {
        const res = await getProfile(token).catch(() => null);
        if (res?.success && res.data) setProfile(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await clearAuth();
    router.replace("/auth/login");
  };

  const displayName = profile?.username || username || "?";
  const initial = displayName.charAt(0).toUpperCase();

  const planLabel = (plan?: string) => {
    if (!plan) return null;
    const isPro = plan.toLowerCase().includes("pro");
    return (
      <View style={[s.planBadge, isPro ? s.planBadgePro : s.planBadgeFree]}>
        <Text style={[s.planText, isPro ? s.planTextPro : s.planTextFree]}>
          {isPro ? "Pro" : "Free"}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={C.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={s.scroll}
      contentContainerStyle={s.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
    >
      {/* 헤더 */}
      <View style={s.header}>
        <Text style={s.headerTitle}>프로필</Text>
      </View>

      {/* 아바타 + 이름 */}
      <View style={s.profileSection}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{initial}</Text>
        </View>
        <View style={s.nameRow}>
          <Text style={s.displayName}>{displayName}</Text>
          {planLabel(profile?.plan)}
        </View>
        {profile?.email ? (
          <Text style={s.email}>{profile.email}</Text>
        ) : null}
      </View>

      {/* 계정 정보 카드 */}
      <View style={s.card}>
        <Text style={s.cardTitle}>계정 정보</Text>

        <View style={s.row}>
          <View style={s.rowIcon}>
            <Ionicons name="person-outline" size={16} color={C.primary} />
          </View>
          <View style={s.rowBody}>
            <Text style={s.rowLabel}>아이디</Text>
            <Text style={s.rowValue}>{profile?.username || username}</Text>
          </View>
        </View>

        {profile?.email ? (
          <View style={[s.row, s.rowBorder]}>
            <View style={s.rowIcon}>
              <Ionicons name="mail-outline" size={16} color={C.primary} />
            </View>
            <View style={s.rowBody}>
              <Text style={s.rowLabel}>이메일</Text>
              <Text style={s.rowValue}>{profile.email}</Text>
            </View>
          </View>
        ) : null}

        {profile?.role ? (
          <View style={[s.row, s.rowBorder]}>
            <View style={s.rowIcon}>
              <Ionicons name="shield-checkmark-outline" size={16} color={C.primary} />
            </View>
            <View style={s.rowBody}>
              <Text style={s.rowLabel}>역할</Text>
              <Text style={s.rowValue}>{profile.role}</Text>
            </View>
          </View>
        ) : null}

        {profile?.createdAt ? (
          <View style={[s.row, s.rowBorder]}>
            <View style={s.rowIcon}>
              <Ionicons name="calendar-outline" size={16} color={C.primary} />
            </View>
            <View style={s.rowBody}>
              <Text style={s.rowLabel}>가입일</Text>
              <Text style={s.rowValue}>{profile.createdAt.slice(0, 10)}</Text>
            </View>
          </View>
        ) : null}
      </View>

      {/* 플랜 카드 */}
      <View style={s.card}>
        <Text style={s.cardTitle}>플랜</Text>
        <View style={s.planRow}>
          <View style={s.planInfo}>
            <Ionicons name="star-outline" size={20} color={C.primary} />
            <Text style={s.planName}>
              {profile?.plan?.toLowerCase().includes("pro") ? "Pro 플랜" : "Free 플랜"}
            </Text>
          </View>
          {planLabel(profile?.plan)}
        </View>
      </View>

      {/* 로그아웃 */}
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
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: C.bg },

  header: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: C.t1 },

  profileSection: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: C.white,
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: "800", color: C.white },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  displayName: { fontSize: 20, fontWeight: "700", color: C.t1 },
  email: { fontSize: 13, color: C.t3 },

  planBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  planBadgePro: { backgroundColor: C.primaryLight },
  planBadgeFree: { backgroundColor: "#F1F5F9" },
  planText: { fontSize: 11, fontWeight: "700" },
  planTextPro: { color: C.primary },
  planTextFree: { color: C.t3 },

  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  cardTitle: { fontSize: 13, fontWeight: "700", color: C.t3, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 },

  row: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  rowBorder: { borderTopWidth: 1, borderTopColor: C.border },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rowBody: { flex: 1 },
  rowLabel: { fontSize: 11, color: C.t4, marginBottom: 2 },
  rowValue: { fontSize: 14, fontWeight: "600", color: C.t1 },

  planRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  planInfo: { flexDirection: "row", alignItems: "center", gap: 8 },
  planName: { fontSize: 15, fontWeight: "600", color: C.t1 },

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

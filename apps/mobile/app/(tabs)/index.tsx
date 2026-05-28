import { useCallback, useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Modal, TextInput, RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getToken, getUsername } from "@/lib/auth-store";
import { listTeamSpaces, createTeamSpace } from "@/domains/teamspace/api";
import type { TeamSpaceResponse } from "@/domains/teamspace/api";
import { listEvents, updateEvent } from "@/domains/event/api";
import type { EventResponse } from "@/domains/event/api";
import { listNotifications } from "@/domains/notification/api";
import type { NotificationResponse } from "@/domains/notification/api";
import { C } from "@/lib/colors";

const SPACE_EMOJIS = ["✈️", "🏖️", "🏔️", "🗺️", "🌏", "🎒", "🏕️", "🚢", "🌴", "🗼"];
const SPACE_COLORS = ["#4A6CF7", "#7C3AED", "#DB2777", "#DC2626", "#D97706", "#16A34A"];

/* ── 상단 헤더 ── */
function Header({ username, onBell }: { username: string; onBell: () => void }) {
  return (
    <View style={s.header}>
      <View style={s.headerLeft}>
        <View style={s.rtBadge}>
          <Text style={s.rtText}>RT</Text>
        </View>
        <View>
          <Text style={s.headerBrand}>ReeL-Trip</Text>
          <Text style={s.headerSub}>{username}님, 환영합니다</Text>
        </View>
      </View>
      <TouchableOpacity onPress={onBell} style={s.bellBtn}>
        <Ionicons name="notifications-outline" size={22} color={C.t2} />
      </TouchableOpacity>
    </View>
  );
}

/* ── 팀스페이스 카드 ── */
function SpaceCard({
  space, onPress,
}: { space: TeamSpaceResponse; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={s.spaceCard}>
      <View style={[s.spaceEmoji, { backgroundColor: space.bgColor ?? C.primary }]}>
        <Text style={{ fontSize: 20 }}>{space.emoji ?? "✈️"}</Text>
      </View>
      <Text style={s.spaceName} numberOfLines={1}>{space.name}</Text>
      <Text style={s.spaceMember}>{space.members.length}명</Text>
    </TouchableOpacity>
  );
}

/* ── 오늘 일정 카드 ── */
function EventCard({
  event, onToggle,
}: { event: EventResponse; onToggle: () => void }) {
  const timeStr = event.startDate.includes("T")
    ? event.startDate.split("T")[1]?.slice(0, 5) ?? ""
    : "";
  const isConfirmed = event.status === "confirmed";

  return (
    <View style={[s.eventCard, { borderLeftColor: event.color, borderLeftWidth: 3 }]}>
      <View style={s.eventInfo}>
        <Text style={s.eventTitle} numberOfLines={1}>{event.title}</Text>
        <Text style={s.eventMeta}>
          {timeStr ? `🕐 ${timeStr}` : ""}
          {timeStr && event.price ? " · " : ""}
          {event.price ?? ""}
        </Text>
        {event.location ? (
          <Text style={s.eventLocation} numberOfLines={1}>📍 {event.location}</Text>
        ) : null}
      </View>
      <TouchableOpacity
        onPress={onToggle}
        style={[s.statusBtn, isConfirmed ? s.statusConfirmed : s.statusPending]}
      >
        <Text style={[s.statusText, { color: isConfirmed ? C.primary : C.t4 }]}>
          {isConfirmed ? "확정" : "대기"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/* ── 팀스페이스 만들기 모달 ── */
function CreateSpaceModal({
  visible, token, onClose, onCreated,
}: {
  visible: boolean;
  token: string;
  onClose: () => void;
  onCreated: (space: TeamSpaceResponse) => void;
}) {
  const [name, setName]     = useState("");
  const [emoji, setEmoji]   = useState("✈️");
  const [color, setColor]   = useState("#4A6CF7");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const handleCreate = async () => {
    if (!name.trim()) { setError("이름을 입력해주세요."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await createTeamSpace({ name: name.trim(), emoji, bgColor: color }, token);
      if (res.success && res.data) {
        onCreated(res.data);
        setName(""); setEmoji("✈️"); setColor("#4A6CF7");
      } else {
        setError("생성에 실패했습니다.");
      }
    } catch {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={sm.container}>
        <View style={sm.header}>
          <Text style={sm.title}>새 팀스페이스</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={C.t2} />
          </TouchableOpacity>
        </View>

        <ScrollView style={sm.body}>
          <Text style={sm.label}>이름</Text>
          <TextInput
            style={sm.input}
            placeholder="예: 제주 여행"
            placeholderTextColor={C.t4}
            value={name}
            onChangeText={setName}
            maxLength={30}
            autoFocus
          />

          <Text style={sm.label}>아이콘</Text>
          <View style={sm.emojiRow}>
            {SPACE_EMOJIS.map((e) => (
              <TouchableOpacity
                key={e}
                onPress={() => setEmoji(e)}
                style={[sm.emojiBtn, emoji === e && sm.emojiBtnActive]}
              >
                <Text style={{ fontSize: 22 }}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={sm.label}>색상</Text>
          <View style={sm.colorRow}>
            {SPACE_COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setColor(c)}
                style={[sm.colorBtn, { backgroundColor: c }, color === c && sm.colorBtnActive]}
              />
            ))}
          </View>

          {error ? <Text style={sm.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[sm.btn, (!name.trim() || loading) && { opacity: 0.5 }]}
            onPress={handleCreate}
            disabled={loading || !name.trim()}
          >
            {loading
              ? <ActivityIndicator color={C.white} />
              : <Text style={sm.btnText}>만들기</Text>
            }
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

/* ── 홈 화면 ── */
export default function HomeScreen() {
  const router = useRouter();
  const [token, setToken]         = useState("");
  const [username, setUsername]   = useState("");
  const [spaces, setSpaces]       = useState<TeamSpaceResponse[]>([]);
  const [todayEvents, setTodayEvents] = useState<EventResponse[]>([]);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNotifModal, setShowNotifModal]   = useState(false);

  const load = useCallback(async (tok: string) => {
    const [spacesRes, notifRes] = await Promise.all([
      listTeamSpaces(tok).catch(() => null),
      listNotifications(tok).catch(() => null),
    ]);

    if (spacesRes?.success && spacesRes.data) {
      setSpaces(spacesRes.data);

      if (spacesRes.data.length > 0) {
        const spaceId = spacesRes.data[0].id;
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        const monthStr = todayStr.slice(0, 7);

        const eventsRes = await listEvents(spaceId, monthStr, tok).catch(() => null);
        if (eventsRes?.success && eventsRes.data) {
          const todayEvts = eventsRes.data.filter((e) => {
            const d = e.startDate.includes("T") ? e.startDate.split("T")[0] : e.startDate;
            return d === todayStr;
          });
          setTodayEvents(todayEvts);
        }
      }
    }
    if (notifRes?.success && notifRes.data) {
      setNotifications(notifRes.data.slice(0, 5));
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const tok  = await getToken();
        const name = await getUsername();
        if (!tok) { router.replace("/auth/login"); return; }
        setToken(tok);
        setUsername(name ?? "");
        await load(tok);
      } finally {
        setLoading(false);
      }
    })();
  }, [load, router]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load(token);
    setRefreshing(false);
  };

  const handleToggleEvent = async (event: EventResponse) => {
    const newStatus = event.status === "confirmed" ? "pending" : "confirmed";
    setTodayEvents((prev) =>
      prev.map((e) => (e.id === event.id ? { ...e, status: newStatus } : e)),
    );
    await updateEvent(event.id, {
      title: event.title,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location ?? undefined,
      price: event.price ?? undefined,
      color: event.color,
      status: newStatus,
    }, token).catch(() => {
      setTodayEvents((prev) =>
        prev.map((e) => (e.id === event.id ? { ...e, status: event.status } : e)),
      );
    });
  };

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator color={C.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <Header username={username} onBell={() => setShowNotifModal(true)} />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={C.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* 인사 */}
        <View style={s.greetSection}>
          <Text style={s.greetText}>안녕하세요, {username}님 👋</Text>
          <Text style={s.greetSub}>오늘도 멋진 여행을 계획해보세요.</Text>
        </View>

        {/* 팀스페이스 섹션 */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>내 팀스페이스</Text>
            <TouchableOpacity onPress={() => setShowCreateModal(true)} style={s.addBtn}>
              <Ionicons name="add" size={16} color={C.primary} />
              <Text style={s.addBtnText}>만들기</Text>
            </TouchableOpacity>
          </View>

          {spaces.length === 0 ? (
            <TouchableOpacity style={s.emptyCard} onPress={() => setShowCreateModal(true)}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>✈️</Text>
              <Text style={s.emptyTitle}>팀스페이스를 만들어보세요</Text>
              <Text style={s.emptyDesc}>팀원들과 함께 여행을 계획하세요</Text>
            </TouchableOpacity>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
              {spaces.map((sp) => (
                <SpaceCard
                  key={sp.id}
                  space={sp}
                  onPress={() => router.push("/(tabs)/travel")}
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* 오늘의 일정 */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>오늘의 일정</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/calendar")}>
              <Text style={s.moreText}>더보기 ›</Text>
            </TouchableOpacity>
          </View>

          {todayEvents.length === 0 ? (
            <View style={s.emptySmall}>
              <Text style={s.emptySmallText}>오늘 등록된 일정이 없습니다</Text>
            </View>
          ) : (
            todayEvents.map((evt) => (
              <EventCard key={evt.id} event={evt} onToggle={() => handleToggleEvent(evt)} />
            ))
          )}
        </View>

        {/* 최근 알림 */}
        {notifications.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>최근 알림</Text>
            </View>
            {notifications.slice(0, 3).map((notif) => (
              <View key={notif.id} style={s.notifItem}>
                <View style={s.notifDot}>
                  <Ionicons name="notifications" size={14} color={C.primary} />
                </View>
                <View style={s.notifBody}>
                  <Text style={s.notifMsg} numberOfLines={2}>{notif.message}</Text>
                  <Text style={s.notifTime}>
                    {new Date(notif.createdAt).toLocaleDateString("ko-KR")}
                  </Text>
                </View>
                {!notif.isRead && <View style={s.unreadDot} />}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <CreateSpaceModal
        visible={showCreateModal}
        token={token}
        onClose={() => setShowCreateModal(false)}
        onCreated={(sp) => {
          setSpaces((prev) => [...prev, sp]);
          setShowCreateModal(false);
        }}
      />

      {/* 알림 모달 */}
      <Modal visible={showNotifModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowNotifModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
          <View style={sm.header}>
            <Text style={sm.title}>알림</Text>
            <TouchableOpacity onPress={() => setShowNotifModal(false)}>
              <Ionicons name="close" size={24} color={C.t2} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            {notifications.length === 0 ? (
              <Text style={[s.emptySmallText, { textAlign: "center", marginTop: 40 }]}>알림이 없습니다</Text>
            ) : (
              notifications.map((notif) => (
                <View key={notif.id} style={s.notifItem}>
                  <View style={s.notifDot}>
                    <Ionicons name="notifications" size={14} color={C.primary} />
                  </View>
                  <View style={s.notifBody}>
                    <Text style={s.notifMsg}>{notif.message}</Text>
                    <Text style={s.notifTime}>{new Date(notif.createdAt).toLocaleDateString("ko-KR")}</Text>
                  </View>
                  {!notif.isRead && <View style={s.unreadDot} />}
                </View>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: C.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 12,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  rtBadge: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: C.primary, alignItems: "center", justifyContent: "center",
  },
  rtText: { color: C.white, fontSize: 12, fontWeight: "800" },
  headerBrand: { fontSize: 15, fontWeight: "700", color: C.t1 },
  headerSub: { fontSize: 11, color: C.t4 },
  bellBtn: { padding: 4 },

  greetSection: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 4 },
  greetText: { fontSize: 22, fontWeight: "800", color: C.t1, marginBottom: 4 },
  greetSub: { fontSize: 13, color: C.t3 },

  section: { paddingHorizontal: 20, paddingTop: 24 },
  sectionHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: C.t1 },
  moreText: { fontSize: 13, fontWeight: "600", color: C.primary },
  addBtn: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: C.primaryLight, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
  },
  addBtnText: { fontSize: 12, fontWeight: "700", color: C.primary },

  spaceCard: {
    width: 120, backgroundColor: C.white, borderRadius: 16,
    padding: 14, alignItems: "center",
    borderWidth: 1, borderColor: C.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  spaceEmoji: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: "center", justifyContent: "center", marginBottom: 8,
  },
  spaceName: { fontSize: 13, fontWeight: "700", color: C.t1, textAlign: "center", marginBottom: 2 },
  spaceMember: { fontSize: 11, color: C.t4 },

  eventCard: {
    backgroundColor: C.white, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14,
    marginBottom: 8, flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderColor: C.border,
  },
  eventInfo: { flex: 1, marginRight: 12 },
  eventTitle: { fontSize: 14, fontWeight: "700", color: C.t1, marginBottom: 2 },
  eventMeta: { fontSize: 12, color: C.t3, marginBottom: 2 },
  eventLocation: { fontSize: 11, color: C.t4 },
  statusBtn: {
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1,
  },
  statusConfirmed: { backgroundColor: C.primaryLight, borderColor: C.primary },
  statusPending:   { backgroundColor: C.bg, borderColor: C.borderLight },
  statusText: { fontSize: 12, fontWeight: "600" },

  emptyCard: {
    backgroundColor: C.white, borderRadius: 16, padding: 28,
    alignItems: "center", borderWidth: 1, borderStyle: "dashed", borderColor: C.borderLight,
  },
  emptyTitle: { fontSize: 15, fontWeight: "700", color: C.t2, marginBottom: 4 },
  emptyDesc: { fontSize: 13, color: C.t4 },
  emptySmall: {
    backgroundColor: C.white, borderRadius: 14, padding: 20,
    alignItems: "center", borderWidth: 1, borderColor: C.border,
  },
  emptySmallText: { fontSize: 13, color: C.t4 },

  notifItem: {
    flexDirection: "row", alignItems: "flex-start", backgroundColor: C.white,
    borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: C.border,
  },
  notifDot: {
    width: 28, height: 28, borderRadius: 8, backgroundColor: C.primaryLight,
    alignItems: "center", justifyContent: "center", marginRight: 10, flexShrink: 0,
  },
  notifBody: { flex: 1 },
  notifMsg: { fontSize: 13, color: C.t2, lineHeight: 18, marginBottom: 3 },
  notifTime: { fontSize: 11, color: C.t4 },
  unreadDot: {
    width: 7, height: 7, borderRadius: 3.5, backgroundColor: C.primary, marginTop: 4, flexShrink: 0,
  },
});

const sm = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  title: { fontSize: 18, fontWeight: "700", color: C.t1 },
  body: { padding: 20 },
  label: { fontSize: 12, fontWeight: "600", color: C.t3, marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: C.borderLight, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: C.t1,
    backgroundColor: C.white, marginBottom: 20,
  },
  emojiRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  emojiBtn: {
    width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: C.borderLight,
  },
  emojiBtnActive: { borderColor: C.primary, backgroundColor: C.primaryLight },
  colorRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  colorBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 3, borderColor: "transparent" },
  colorBtnActive: { borderColor: C.t1 },
  error: { fontSize: 13, color: C.red, marginBottom: 12, textAlign: "center" },
  btn: {
    backgroundColor: C.primary, borderRadius: 999,
    paddingVertical: 14, alignItems: "center", marginTop: 8,
  },
  btnText: { color: C.white, fontWeight: "700", fontSize: 15 },
});

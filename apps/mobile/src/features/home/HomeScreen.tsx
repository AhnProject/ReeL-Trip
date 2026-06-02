import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useHomeData } from "./hooks/useHomeData";
import { Header } from "./components/Header";
import { SpaceCard } from "./components/SpaceCard";
import { EventCard } from "./components/EventCard";
import { CreateSpaceModal } from "./components/CreateSpaceModal";
import { NotificationModal } from "./components/NotificationModal";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { EmptyState } from "@/components/ui/EmptyState";
import { Ionicons } from "@expo/vector-icons";
import { C } from "@/lib/colors";
import { card, row, sectionHeader, radius, sp } from "@/lib/styles";

export function HomeScreen() {
  const router = useRouter();
  const {
    username, spaces, todayEvents, notifications,
    loading, refreshing,
    handleRefresh, handleToggleEvent,
  } = useHomeData();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNotifModal, setShowNotifModal]   = useState(false);

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView style={s.safe}>
      <Header username={username} onBell={() => setShowNotifModal(true)} />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={C.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* 인사 */}
        <View style={s.greet}>
          <Text style={s.greetText}>안녕하세요, {username}님 👋</Text>
          <Text style={s.greetSub}>오늘도 멋진 여행을 계획해보세요.</Text>
        </View>

        {/* 팀스페이스 */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>내 팀스페이스</Text>
            <TouchableOpacity onPress={() => setShowCreateModal(true)} style={s.addBtn}>
              <Ionicons name="add" size={16} color={C.primary} />
              <Text style={s.addBtnText}>만들기</Text>
            </TouchableOpacity>
          </View>

          {spaces.length === 0 ? (
            <TouchableOpacity onPress={() => setShowCreateModal(true)}>
              <EmptyState emoji="✈️" title="팀스페이스를 만들어보세요" description="팀원들과 함께 여행을 계획하세요" />
            </TouchableOpacity>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -sp.xl }} contentContainerStyle={{ paddingHorizontal: sp.xl, gap: sp.md }}>
              {spaces.map((sp_) => (
                <SpaceCard key={sp_.id} space={sp_} onPress={() => router.push("/(tabs)/travel")} />
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
            <EmptyState title="오늘 등록된 일정이 없습니다" small />
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
                <View style={s.notifIcon}>
                  <Ionicons name="notifications" size={14} color={C.primary} />
                </View>
                <View style={s.notifBody}>
                  <Text style={s.notifMsg} numberOfLines={2}>{notif.message}</Text>
                  <Text style={s.notifTime}>{new Date(notif.createdAt).toLocaleDateString("ko-KR")}</Text>
                </View>
                {!notif.isRead && <View style={s.unreadDot} />}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <CreateSpaceModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      <NotificationModal
        visible={showNotifModal}
        notifications={notifications}
        onClose={() => setShowNotifModal(false)}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: C.bg },
  scroll:       { flex: 1 },
  content:      { paddingBottom: 32 },
  greet:        { paddingHorizontal: sp.xl, paddingTop: sp.xl, paddingBottom: 4 },
  greetText:    { fontSize: 22, fontWeight: "800", color: C.t1, marginBottom: 4 },
  greetSub:     { fontSize: 13, color: C.t3 },
  section:      { paddingHorizontal: sp.xl, paddingTop: sp.xxl },
  sectionHeader,
  sectionTitle: { fontSize: 16, fontWeight: "700", color: C.t1 },
  moreText:     { fontSize: 13, fontWeight: "600", color: C.primary },
  addBtn:       { ...row, gap: 3, backgroundColor: C.primaryLight, borderRadius: radius.full, paddingHorizontal: sp.sm + 2, paddingVertical: 5 },
  addBtnText:   { fontSize: 12, fontWeight: "700", color: C.primary },
  notifItem:    { ...card, ...row, alignItems: "flex-start", padding: 14, marginBottom: sp.sm },
  notifIcon:    { width: 28, height: 28, borderRadius: radius.sm, backgroundColor: C.primaryLight, alignItems: "center", justifyContent: "center", marginRight: sp.sm + 2, flexShrink: 0 },
  notifBody:    { flex: 1 },
  notifMsg:     { fontSize: 13, color: C.t2, lineHeight: 18, marginBottom: 3 },
  notifTime:    { fontSize: 11, color: C.t4 },
  unreadDot:    { width: 7, height: 7, borderRadius: 3.5, backgroundColor: C.primary, marginTop: 4, flexShrink: 0 },
});

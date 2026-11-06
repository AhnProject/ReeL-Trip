import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getNotificationSettings, updateNotificationSettings } from "@/domains/notification/api";
import type { NotificationSettingsResponse } from "@/domains/notification/api";
import { useAuthStore } from "@/store/auth";
import { toast } from "@/store/toast";
import { C } from "@/lib/colors";
import { modalHeader, sp } from "@/lib/styles";

interface NotificationSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

const ITEMS: { key: keyof NotificationSettingsResponse; label: string; desc: string }[] = [
  { key: "newPlace",       label: "새 장소 추가",  desc: "팀원이 장소를 추가하면 알려드려요" },
  { key: "scheduleChange", label: "일정 변경",    desc: "일정이 수정되거나 삭제되면 알려드려요" },
  { key: "memberJoin",     label: "멤버 참여",    desc: "새 멤버가 스페이스에 참여하면 알려드려요" },
  { key: "aiRecommend",    label: "AI 추천 도착", desc: "AI 추천 장소가 준비되면 알려드려요" },
];

export function NotificationSettingsModal({ visible, onClose }: NotificationSettingsModalProps) {
  const token = useAuthStore((s) => s.token);

  const [settings, setSettings] = useState<NotificationSettingsResponse | null>(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!visible || !token) return;
    setLoading(true);
    getNotificationSettings(token).then((res) => {
      if (res.success && res.data) setSettings(res.data);
    }).finally(() => setLoading(false));
  }, [visible, token]);

  const handleToggle = async (key: keyof NotificationSettingsResponse) => {
    if (!settings || !token) return;
    const prev = settings;
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    try {
      const res = await updateNotificationSettings(next, token);
      if (!res.success) {
        setSettings(prev);
        toast.error("알림 설정 저장에 실패했습니다");
      }
    } catch {
      setSettings(prev);
      toast.error("서버 오류가 발생했습니다");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        <View style={s.header}>
          <Text style={s.title}>알림 설정</Text>
          <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={C.t2} /></TouchableOpacity>
        </View>

        {loading || !settings ? (
          <ActivityIndicator style={{ marginTop: sp.xl }} color={C.primary} />
        ) : (
          <View style={s.body}>
            {ITEMS.map((item) => (
              <View key={item.key} style={s.row}>
                <View style={{ flex: 1 }}>
                  <Text style={s.label}>{item.label}</Text>
                  <Text style={s.desc}>{item.desc}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleToggle(item.key)}
                  style={[s.track, settings[item.key] && s.trackOn]}
                  activeOpacity={0.8}
                >
                  <View style={[s.thumb, settings[item.key] && s.thumbOn]} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  header:  modalHeader,
  title:   { fontSize: 18, fontWeight: "700", color: C.t1 },
  body:    { padding: sp.xl, gap: sp.lg },
  row:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: sp.sm },
  label:   { fontSize: 14, fontWeight: "600", color: C.t1 },
  desc:    { fontSize: 12, color: C.t4, marginTop: 2 },
  track:   { width: 44, height: 24, borderRadius: 12, backgroundColor: C.border, padding: 2, justifyContent: "center" },
  trackOn: { backgroundColor: C.primary },
  thumb:   { width: 20, height: 20, borderRadius: 10, backgroundColor: C.white },
  thumbOn: { alignSelf: "flex-end" },
});

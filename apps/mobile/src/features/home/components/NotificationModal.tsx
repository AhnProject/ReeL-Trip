import { View, Text, TouchableOpacity, Modal, ScrollView, Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { NotificationResponse } from "@/domains/notification/api";
import { C } from "@/lib/colors";
import { modalHeader, card, row, radius, sp } from "@/lib/styles";

interface NotificationModalProps {
  visible: boolean;
  notifications: NotificationResponse[];
  onClose: () => void;
  onRead: (id: number) => void;
  onDelete: (id: number) => void;
}

export function NotificationModal({ visible, notifications, onClose, onRead, onDelete }: NotificationModalProps) {
  const handleDelete = (id: number) => {
    Alert.alert("알림 삭제", "이 알림을 삭제할까요?", [
      { text: "취소", style: "cancel" },
      { text: "삭제", style: "destructive", onPress: () => onDelete(id) },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        <View style={s.header}>
          <Text style={s.title}>알림</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={C.t2} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{ padding: sp.xl }}>
          {notifications.length === 0 ? (
            <Text style={s.empty}>알림이 없습니다</Text>
          ) : (
            notifications.map((notif) => (
              <TouchableOpacity
                key={notif.id}
                style={s.item}
                activeOpacity={0.7}
                onPress={() => !notif.isRead && onRead(notif.id)}
              >
                <View style={s.iconWrap}>
                  <Ionicons name="notifications" size={14} color={C.primary} />
                </View>
                <View style={s.body}>
                  <Text style={s.msg}>{notif.message}</Text>
                  <Text style={s.time}>{new Date(notif.createdAt).toLocaleDateString("ko-KR")}</Text>
                </View>
                {!notif.isRead && <View style={s.dot} />}
                <TouchableOpacity onPress={() => handleDelete(notif.id)} style={s.deleteBtn}>
                  <Ionicons name="close" size={16} color={C.t4} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  header:   modalHeader,
  title:    { fontSize: 18, fontWeight: "700", color: C.t1 },
  empty:    { textAlign: "center", marginTop: 40, fontSize: 13, color: C.t4 },
  item:     { ...card, ...row, alignItems: "flex-start", padding: 14, marginBottom: sp.sm },
  iconWrap: { width: 28, height: 28, borderRadius: radius.sm, backgroundColor: C.primaryLight, alignItems: "center", justifyContent: "center", marginRight: sp.sm + 2, flexShrink: 0 },
  body:     { flex: 1 },
  msg:      { fontSize: 13, color: C.t2, lineHeight: 18, marginBottom: 3 },
  time:     { fontSize: 11, color: C.t4 },
  dot:      { width: 7, height: 7, borderRadius: 3.5, backgroundColor: C.primary, marginTop: 4, flexShrink: 0 },
  deleteBtn:{ marginLeft: sp.sm, padding: 4 },
});

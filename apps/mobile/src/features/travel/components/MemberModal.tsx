import { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { removeMember } from "@/domains/teamspace/api";
import type { TeamSpaceResponse, MemberResponse } from "@/domains/teamspace/api";
import { useAuthStore } from "@/store/auth";
import { useInvalidateSpaces } from "@/hooks/useSpaces";
import { toast } from "@/store/toast";
import { C } from "@/lib/colors";
import { modalHeader, row, radius, sp } from "@/lib/styles";

interface MemberModalProps {
  visible: boolean;
  space:   TeamSpaceResponse;
  onClose: () => void;
}

export function MemberModal({ visible, space, onClose }: MemberModalProps) {
  const token             = useAuthStore((s) => s.token);
  const username          = useAuthStore((s) => s.username);
  const invalidateSpaces  = useInvalidateSpaces();

  const [removingId, setRemovingId] = useState<number | null>(null);

  const owner   = space.members.find((m) => m.role === "owner");
  const isOwner = !!owner && owner.username === username;

  const handleRemove = (member: MemberResponse) => {
    Alert.alert(
      "멤버 내보내기",
      `${member.username}님을 팀스페이스에서 내보낼까요?`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "내보내기",
          style: "destructive",
          onPress: async () => {
            if (!token) return;
            setRemovingId(member.userId);
            try {
              const res = await removeMember(space.id, member.userId, token);
              if (res.success) {
                toast.success(`${member.username}님을 내보냈습니다`);
                invalidateSpaces();
              } else {
                toast.error("멤버 내보내기에 실패했습니다");
              }
            } catch {
              toast.error("서버 오류가 발생했습니다");
            } finally {
              setRemovingId(null);
            }
          },
        },
      ],
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        <View style={s.header}>
          <Text style={s.title}>멤버 ({space.members.length})</Text>
          <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={C.t2} /></TouchableOpacity>
        </View>

        <View style={s.list}>
          {space.members.map((m) => {
            const canRemove = isOwner && m.role !== "owner";
            return (
              <View key={m.userId} style={s.item}>
                <View style={s.avatar}>
                  <Text style={s.avatarText}>{m.username[0]?.toUpperCase() ?? "?"}</Text>
                </View>
                <Text style={s.name} numberOfLines={1}>{m.username}</Text>
                <View style={[s.roleBadge, m.role === "owner" && s.roleBadgeOwner]}>
                  <Text style={[s.roleText, m.role === "owner" && s.roleTextOwner]}>
                    {m.role === "owner" ? "소유자" : "멤버"}
                  </Text>
                </View>
                {canRemove && (
                  <TouchableOpacity
                    onPress={() => handleRemove(m)}
                    disabled={removingId === m.userId}
                    style={s.removeBtn}
                  >
                    <Text style={s.removeText}>내보내기</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  header:        modalHeader,
  title:         { fontSize: 18, fontWeight: "700", color: C.t1 },
  list:          { padding: sp.xl, gap: sp.md },
  item:          { ...row, gap: sp.md },
  avatar:        { width: 36, height: 36, borderRadius: 18, backgroundColor: C.primary, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  avatarText:    { color: C.white, fontSize: 13, fontWeight: "700" },
  name:          { flex: 1, fontSize: 14, fontWeight: "600", color: C.t1 },
  roleBadge:     { backgroundColor: C.bg, borderRadius: radius.full, paddingHorizontal: sp.sm + 2, paddingVertical: 3 },
  roleBadgeOwner:{ backgroundColor: C.primaryLight },
  roleText:      { fontSize: 11, fontWeight: "600", color: C.t3 },
  roleTextOwner: { color: C.primary },
  removeBtn:     { marginLeft: sp.sm },
  removeText:    { fontSize: 12, color: C.red },
});

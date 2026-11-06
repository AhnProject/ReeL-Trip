import { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { updateTeamSpace, deleteTeamSpace } from "@/domains/teamspace/api";
import type { TeamSpaceResponse } from "@/domains/teamspace/api";
import { useAuthStore } from "@/store/auth";
import { useInvalidateSpaces } from "@/hooks/useSpaces";
import { toast } from "@/store/toast";
import { FormInput } from "@/components/ui/FormInput";
import { Button } from "@/components/ui/Button";
import { C } from "@/lib/colors";
import { modalHeader, sp } from "@/lib/styles";

interface SpaceSettingsModalProps {
  visible: boolean;
  space:   TeamSpaceResponse;
  onClose: () => void;
}

export function SpaceSettingsModal({ visible, space, onClose }: SpaceSettingsModalProps) {
  const token            = useAuthStore((s) => s.token);
  const username         = useAuthStore((s) => s.username);
  const invalidateSpaces = useInvalidateSpaces();

  const owner   = space.members.find((m) => m.role === "owner");
  const isOwner = !!owner && owner.username === username;

  const [name,     setName]     = useState(space.name);
  const [emoji,    setEmoji]    = useState(space.emoji ?? "");
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error,    setError]    = useState("");

  const handleSave = async () => {
    if (!name.trim() || !token) return;
    setSaving(true); setError("");
    try {
      const res = await updateTeamSpace(space.id, {
        name:    name.trim(),
        emoji:   emoji.trim() || undefined,
        bgColor: space.bgColor ?? undefined,
      }, token);
      if (res.success) {
        toast.success("스페이스 정보를 저장했습니다");
        invalidateSpaces();
        onClose();
      } else {
        setError("저장에 실패했습니다.");
      }
    } catch {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "스페이스 삭제",
      `"${space.name}" 스페이스를 삭제할까요? 이 작업은 되돌릴 수 없습니다.`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            if (!token) return;
            setDeleting(true);
            try {
              const res = await deleteTeamSpace(space.id, token);
              if (res.success) {
                toast.success("스페이스를 삭제했습니다");
                invalidateSpaces();
                onClose();
              } else {
                toast.error("삭제에 실패했습니다");
              }
            } catch {
              toast.error("서버 오류가 발생했습니다");
            } finally {
              setDeleting(false);
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
          <Text style={s.title}>여행 스페이스 설정</Text>
          <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={C.t2} /></TouchableOpacity>
        </View>

        <View style={s.body}>
          <FormInput
            label="스페이스 이름"
            placeholder="예: 제주도 여행"
            value={name}
            onChangeText={setName}
            editable={isOwner}
          />
          <FormInput
            label="이모지"
            placeholder="✈️"
            value={emoji}
            onChangeText={setEmoji}
            editable={isOwner}
          />
          {error ? <Text style={s.error}>{error}</Text> : null}

          {isOwner ? (
            <>
              <Button label="저장" onPress={handleSave} loading={saving} disabled={!name.trim()} />

              <View style={s.dangerZone}>
                <Text style={s.dangerTitle}>위험 구역</Text>
                <Button label="스페이스 삭제" variant="danger" onPress={handleDelete} loading={deleting} />
              </View>
            </>
          ) : (
            <Text style={s.hint}>스페이스 이름/이모지 수정과 삭제는 소유자만 할 수 있어요.</Text>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  header:     modalHeader,
  title:      { fontSize: 18, fontWeight: "700", color: C.t1 },
  body:       { padding: sp.xl, gap: sp.md },
  hint:       { fontSize: 13, color: C.t3, lineHeight: 18 },
  error:      { fontSize: 13, color: C.red },
  dangerZone: { marginTop: sp.lg, paddingTop: sp.lg, borderTopWidth: 1, borderTopColor: C.borderLight, gap: sp.sm },
  dangerTitle:{ fontSize: 13, fontWeight: "700", color: C.red, marginBottom: 4 },
});

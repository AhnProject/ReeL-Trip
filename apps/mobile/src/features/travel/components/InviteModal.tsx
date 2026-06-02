import { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { inviteMember } from "@/domains/teamspace/api";
import { useAuthStore } from "@/store/auth";
import { useInvalidateSpaces } from "@/hooks/useSpaces";
import { toast } from "@/store/toast";
import { FormInput } from "@/components/ui/FormInput";
import { Button } from "@/components/ui/Button";
import { C } from "@/lib/colors";
import { modalHeader, sp } from "@/lib/styles";

interface InviteModalProps {
  visible: boolean;
  spaceId: number;
  onClose: () => void;
}

export function InviteModal({ visible, spaceId, onClose }: InviteModalProps) {
  const token            = useAuthStore((s) => s.token);
  const invalidateSpaces = useInvalidateSpaces();

  const [name,    setName]    = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const submit = async () => {
    if (!name.trim()) { setError("사용자 이름을 입력해주세요."); return; }
    if (!token) { setError("로그인이 필요합니다."); return; }
    setLoading(true); setError("");
    try {
      const res = await inviteMember(spaceId, name.trim(), token);
      if (res.success) {
        toast.success(`${name.trim()}님을 초대했습니다`);
        invalidateSpaces();
        setName("");
        onClose();
      } else {
        setError("초대에 실패했습니다. 사용자 이름을 확인해주세요.");
      }
    } catch {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        <View style={s.header}>
          <Text style={s.title}>멤버 초대</Text>
          <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={C.t2} /></TouchableOpacity>
        </View>
        <View style={s.body}>
          <Text style={s.hint}>초대할 사용자 이름을 입력하세요.</Text>
          <FormInput label="사용자 이름" placeholder="예: gildong123" value={name} onChangeText={setName} autoCapitalize="none" autoCorrect={false} autoFocus />
          {error ? <Text style={s.error}>{error}</Text> : null}
          <Button label="초대하기" onPress={submit} loading={loading} disabled={!name.trim()} />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  header: modalHeader,
  title:  { fontSize: 18, fontWeight: "700", color: C.t1 },
  body:   { padding: sp.xl },
  hint:   { fontSize: 13, color: C.t3, lineHeight: 18, marginBottom: sp.lg },
  error:  { fontSize: 13, color: C.red, marginBottom: sp.md },
});

import { useState } from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { createTeamSpace } from "@/domains/teamspace/api";
import { useAuthStore } from "@/store/auth";
import { useInvalidateSpaces } from "@/hooks/useSpaces";
import { toast } from "@/store/toast";
import { FormInput } from "@/components/ui/FormInput";
import { Button } from "@/components/ui/Button";
import { C } from "@/lib/colors";
import { modalHeader, radius, sp } from "@/lib/styles";

const SPACE_EMOJIS = ["✈️", "🏖️", "🏔️", "🗺️", "🌏", "🎒", "🏕️", "🚢", "🌴", "🗼"];
const SPACE_COLORS = ["#4A6CF7", "#7C3AED", "#DB2777", "#DC2626", "#D97706", "#16A34A"];

interface CreateSpaceModalProps {
  visible:  boolean;
  onClose:  () => void;
}

export function CreateSpaceModal({ visible, onClose }: CreateSpaceModalProps) {
  const token           = useAuthStore((s) => s.token);
  const invalidateSpaces = useInvalidateSpaces();

  const [name,    setName]    = useState("");
  const [emoji,   setEmoji]   = useState("✈️");
  const [color,   setColor]   = useState("#4A6CF7");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleCreate = async () => {
    if (!name.trim()) { setError("이름을 입력해주세요."); return; }
    if (!token) { setError("로그인이 필요합니다."); return; }
    setLoading(true); setError("");
    try {
      const res = await createTeamSpace({ name: name.trim(), emoji, bgColor: color }, token);
      if (res.success) {
        toast.success(`"${name.trim()}" 스페이스 생성됨`);
        invalidateSpaces();
        setName(""); setEmoji("✈️"); setColor("#4A6CF7");
        onClose();
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
      <SafeAreaView style={s.container}>
        <View style={s.header}>
          <Text style={s.title}>새 팀스페이스</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={C.t2} />
          </TouchableOpacity>
        </View>

        <ScrollView style={s.body}>
          <FormInput label="이름" placeholder="예: 제주 여행" value={name} onChangeText={setName} maxLength={30} autoFocus />

          <Text style={s.label}>아이콘</Text>
          <View style={s.emojiRow}>
            {SPACE_EMOJIS.map((e) => (
              <TouchableOpacity key={e} onPress={() => setEmoji(e)} style={[s.emojiBtn, emoji === e && s.emojiBtnActive]}>
                <Text style={{ fontSize: 22 }}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={s.label}>색상</Text>
          <View style={s.colorRow}>
            {SPACE_COLORS.map((c) => (
              <TouchableOpacity key={c} onPress={() => setColor(c)} style={[s.colorBtn, { backgroundColor: c }, color === c && s.colorBtnActive]} />
            ))}
          </View>

          {error ? <Text style={s.error}>{error}</Text> : null}

          <Button label="만들기" onPress={handleCreate} loading={loading} disabled={!name.trim()} style={{ marginTop: sp.sm }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: C.bg },
  header:         modalHeader,
  title:          { fontSize: 18, fontWeight: "700", color: C.t1 },
  body:           { padding: sp.xl },
  label:          { fontSize: 12, fontWeight: "600", color: C.t3, marginBottom: sp.sm },
  emojiRow:       { flexDirection: "row", flexWrap: "wrap", gap: sp.sm, marginBottom: sp.xl },
  emojiBtn:       { width: 44, height: 44, borderRadius: radius.md, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: C.borderLight },
  emojiBtnActive: { borderColor: C.primary, backgroundColor: C.primaryLight },
  colorRow:       { flexDirection: "row", gap: sp.sm + 2, marginBottom: sp.xxl },
  colorBtn:       { width: 32, height: 32, borderRadius: 16, borderWidth: 3, borderColor: "transparent" },
  colorBtnActive: { borderColor: C.t1 },
  error:          { fontSize: 13, color: C.red, marginBottom: sp.md, textAlign: "center" },
});

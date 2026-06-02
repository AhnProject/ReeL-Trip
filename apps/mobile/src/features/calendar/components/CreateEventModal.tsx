import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { createEvent } from "@/domains/event/api";
import { useAuthStore } from "@/store/auth";
import { useInvalidateEvents } from "@/hooks/useEvents";
import { toast } from "@/store/toast";
import { FormInput } from "@/components/ui/FormInput";
import { Button } from "@/components/ui/Button";
import { C } from "@/lib/colors";
import { modalHeader, sp } from "@/lib/styles";

const EVENT_COLORS = ["#4A6CF7", "#7C3AED", "#DB2777", "#DC2626", "#D97706", "#16A34A", "#0891B2", "#64748B"];

interface CreateEventModalProps {
  visible:     boolean;
  spaceId:     number;
  defaultDate: string;
  onClose:     () => void;
}

export function CreateEventModal({ visible, spaceId, defaultDate, onClose }: CreateEventModalProps) {
  const token           = useAuthStore((s) => s.token);
  const invalidateEvents = useInvalidateEvents();

  const [title,    setTitle]    = useState("");
  const [start,    setStart]    = useState(defaultDate);
  const [end,      setEnd]      = useState(defaultDate);
  const [location, setLocation] = useState("");
  const [price,    setPrice]    = useState("");
  const [color,    setColor]    = useState("#4A6CF7");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  useEffect(() => { setStart(defaultDate); setEnd(defaultDate); }, [defaultDate]);

  const submit = async () => {
    if (!title.trim()) { setError("제목을 입력해주세요."); return; }
    if (!token) { setError("로그인이 필요합니다."); return; }
    setLoading(true); setError("");
    try {
      const res = await createEvent({
        spaceId, title: title.trim(), startDate: start, endDate: end,
        location: location || undefined, price: price || undefined, color, status: "pending",
      }, token);
      if (res.success) {
        toast.success(`"${title.trim()}" 일정 추가됨`);
        invalidateEvents(spaceId);
        setTitle(""); setLocation(""); setPrice("");
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
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        <View style={s.header}>
          <Text style={s.headerTitle}>일정 추가</Text>
          <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={C.t2} /></TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
          <FormInput label="제목 *" placeholder="예: 성수 재즈 페스티벌" value={title} onChangeText={setTitle} autoFocus />

          <View style={{ flexDirection: "row", gap: sp.md }}>
            <View style={{ flex: 1 }}>
              <FormInput label="시작일" placeholder="YYYY-MM-DD" value={start} onChangeText={setStart} keyboardType="numbers-and-punctuation" />
            </View>
            <View style={{ flex: 1 }}>
              <FormInput label="종료일" placeholder="YYYY-MM-DD" value={end} onChangeText={setEnd} keyboardType="numbers-and-punctuation" />
            </View>
          </View>

          <FormInput label="장소"  placeholder="예: 서울 성동구" value={location} onChangeText={setLocation} />
          <FormInput label="가격"  placeholder="예: ₩35,000"    value={price}    onChangeText={setPrice} />

          <Text style={s.label}>색상</Text>
          <View style={s.colorRow}>
            {EVENT_COLORS.map((c) => (
              <TouchableOpacity key={c} onPress={() => setColor(c)} style={[s.colorBtn, { backgroundColor: c }, color === c && s.colorBtnActive]} />
            ))}
          </View>

          {error ? <Text style={s.error}>{error}</Text> : null}

          <Button label="추가하기" onPress={submit} loading={loading} disabled={!title.trim()} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  header:         modalHeader,
  headerTitle:    { fontSize: 18, fontWeight: "700", color: C.t1 },
  body:           { padding: sp.xl },
  label:          { fontSize: 12, fontWeight: "600", color: C.t3, marginBottom: sp.sm - 2 },
  colorRow:       { flexDirection: "row", gap: sp.sm + 2, flexWrap: "wrap", marginBottom: sp.xxl },
  colorBtn:       { width: 30, height: 30, borderRadius: 15, borderWidth: 3, borderColor: "transparent" },
  colorBtnActive: { borderColor: C.t1 },
  error:          { fontSize: 13, color: C.red, marginBottom: sp.md, textAlign: "center" },
});

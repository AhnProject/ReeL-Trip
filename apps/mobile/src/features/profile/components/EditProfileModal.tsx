import { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "@/domains/user/api";
import { useAuthStore } from "@/store/auth";
import { toast } from "@/store/toast";
import { FormInput } from "@/components/ui/FormInput";
import { Button } from "@/components/ui/Button";
import { C } from "@/lib/colors";
import { modalHeader, sp } from "@/lib/styles";

interface EditProfileModalProps {
  visible:      boolean;
  initialEmail: string;
  onClose:      () => void;
}

export function EditProfileModal({ visible, initialEmail, onClose }: EditProfileModalProps) {
  const token = useAuthStore((s) => s.token);
  const qc    = useQueryClient();

  const [email,   setEmail]   = useState(initialEmail);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  const handleSave = async () => {
    if (!token) return;
    setSaving(true); setError("");
    try {
      const res = await updateProfile({ email: email.trim() }, token);
      if (res.success) {
        toast.success("프로필을 저장했습니다");
        qc.invalidateQueries({ queryKey: ["profile"] });
        onClose();
      } else if (res.errorCode === "EMAIL_ALREADY_EXISTS") {
        setError("이미 사용 중인 이메일입니다.");
      } else {
        setError("저장에 실패했습니다.");
      }
    } catch {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        <View style={s.header}>
          <Text style={s.title}>프로필 수정</Text>
          <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={C.t2} /></TouchableOpacity>
        </View>
        <View style={s.body}>
          <FormInput
            label="이메일"
            placeholder="example@reeltrip.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
          {error ? <Text style={s.error}>{error}</Text> : null}
          <Button label="저장" onPress={handleSave} loading={saving} disabled={!email.trim()} />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  header: modalHeader,
  title:  { fontSize: 18, fontWeight: "700", color: C.t1 },
  body:   { padding: sp.xl },
  error:  { fontSize: 13, color: C.red, marginBottom: sp.md },
});

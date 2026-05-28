import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { signup } from "@/domains/auth/api";
import { saveToken, saveUsername } from "@/lib/auth-store";
import { C } from "@/lib/colors";

export default function SignupScreen() {
  const router = useRouter();
  const [form, setForm]     = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const handleSignup = async () => {
    if (!form.username.trim() || !form.email.trim() || !form.password.trim()) {
      setError("모든 항목을 입력해주세요.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await signup(form);
      if (res.success && res.data) {
        await saveToken(res.data.accessToken);
        await saveUsername(res.data.username);
        router.replace("/(tabs)");
      } else {
        setError(res.message || "회원가입에 실패했습니다.");
      }
    } catch {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        {/* 브랜드 */}
        <View style={s.brand}>
          <View style={s.logo}>
            <Text style={s.logoText}>RT</Text>
          </View>
          <Text style={s.brandName}>ReeL-Trip</Text>
          <Text style={s.brandSub}>지금 여행을 시작해보세요</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>회원가입</Text>

          <Text style={s.label}>아이디</Text>
          <TextInput
            style={s.input}
            placeholder="3자 이상"
            placeholderTextColor={C.t4}
            value={form.username}
            onChangeText={(v) => setForm((p) => ({ ...p, username: v }))}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={s.label}>이메일</Text>
          <TextInput
            style={s.input}
            placeholder="example@email.com"
            placeholderTextColor={C.t4}
            value={form.email}
            onChangeText={(v) => setForm((p) => ({ ...p, email: v }))}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={s.label}>비밀번호</Text>
          <TextInput
            style={s.input}
            placeholder="8자 이상"
            placeholderTextColor={C.t4}
            value={form.password}
            onChangeText={(v) => setForm((p) => ({ ...p, password: v }))}
            secureTextEntry
            onSubmitEditing={handleSignup}
            returnKeyType="done"
          />

          {error ? <Text style={s.error}>{error}</Text> : null}

          <TouchableOpacity style={s.btn} onPress={handleSignup} disabled={loading}>
            {loading
              ? <ActivityIndicator color={C.white} />
              : <Text style={s.btnText}>가입하기</Text>
            }
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.link}>
            이미 계정이 있으신가요? <Text style={s.linkBold}>로그인</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: C.bg },
  container: { flexGrow: 1, justifyContent: "center", padding: 24, paddingBottom: 40 },
  brand: { alignItems: "center", marginBottom: 32 },
  logo: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: C.primary, alignItems: "center", justifyContent: "center", marginBottom: 10,
  },
  logoText: { color: C.white, fontSize: 18, fontWeight: "800", letterSpacing: 1 },
  brandName: { fontSize: 22, fontWeight: "800", color: C.t1, marginBottom: 4 },
  brandSub: { fontSize: 13, color: C.t3 },
  card: {
    backgroundColor: C.white, borderRadius: 20,
    padding: 24, marginBottom: 20, borderWidth: 1, borderColor: C.border,
  },
  cardTitle: { fontSize: 20, fontWeight: "700", color: C.t1, marginBottom: 20 },
  label: { fontSize: 12, fontWeight: "600", color: C.t3, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: C.borderLight, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14,
    color: C.t1, backgroundColor: C.bg, marginBottom: 14,
  },
  error: { fontSize: 13, color: C.red, marginBottom: 12, textAlign: "center" },
  btn: {
    backgroundColor: C.primary, borderRadius: 999,
    paddingVertical: 14, alignItems: "center", marginTop: 4,
  },
  btnText: { color: C.white, fontWeight: "700", fontSize: 15 },
  link: { textAlign: "center", fontSize: 13, color: C.t3 },
  linkBold: { color: C.primary, fontWeight: "700" },
});

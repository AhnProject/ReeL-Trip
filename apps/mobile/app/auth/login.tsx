import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { login } from "@/domains/auth/api";
import { saveToken, saveUsername } from "@/lib/auth-store";
import { C } from "@/lib/colors";

export default function LoginScreen() {
  const router = useRouter();
  const [form, setForm]     = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const handleLogin = async () => {
    if (!form.username.trim() || !form.password.trim()) {
      setError("아이디와 비밀번호를 입력해주세요.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await login(form);
      if (res.success && res.data) {
        await saveToken(res.data.accessToken);
        await saveUsername(res.data.username);
        router.replace("/(tabs)");
      } else {
        setError(res.message || "로그인에 실패했습니다.");
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
          <Text style={s.brandSub}>공유한 순간이 여행이 되는 곳</Text>
        </View>

        {/* 폼 카드 */}
        <View style={s.card}>
          <Text style={s.cardTitle}>로그인</Text>

          <Text style={s.label}>아이디</Text>
          <TextInput
            style={s.input}
            placeholder="아이디 입력"
            placeholderTextColor={C.t4}
            value={form.username}
            onChangeText={(v) => setForm((p) => ({ ...p, username: v }))}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={s.label}>비밀번호</Text>
          <TextInput
            style={s.input}
            placeholder="비밀번호 입력"
            placeholderTextColor={C.t4}
            value={form.password}
            onChangeText={(v) => setForm((p) => ({ ...p, password: v }))}
            secureTextEntry
            onSubmitEditing={handleLogin}
            returnKeyType="done"
          />

          {error ? <Text style={s.error}>{error}</Text> : null}

          <TouchableOpacity style={s.btn} onPress={handleLogin} disabled={loading}>
            {loading
              ? <ActivityIndicator color={C.white} />
              : <Text style={s.btnText}>로그인</Text>
            }
          </TouchableOpacity>
        </View>

        {/* 회원가입 링크 */}
        <TouchableOpacity onPress={() => router.push("/auth/signup")}>
          <Text style={s.link}>
            계정이 없으신가요? <Text style={s.linkBold}>회원가입</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: C.bg },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    paddingBottom: 40,
  },
  brand: { alignItems: "center", marginBottom: 32 },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  logoText: { color: C.white, fontSize: 18, fontWeight: "800", letterSpacing: 1 },
  brandName: { fontSize: 22, fontWeight: "800", color: C.t1, marginBottom: 4 },
  brandSub: { fontSize: 13, color: C.t3 },
  card: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: C.border,
  },
  cardTitle: { fontSize: 20, fontWeight: "700", color: C.t1, marginBottom: 20 },
  label: { fontSize: 12, fontWeight: "600", color: C.t3, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: C.borderLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: C.t1,
    backgroundColor: C.bg,
    marginBottom: 14,
  },
  error: { fontSize: 13, color: C.red, marginBottom: 12, textAlign: "center" },
  btn: {
    backgroundColor: C.primary,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  btnText: { color: C.white, fontWeight: "700", fontSize: 15 },
  link: { textAlign: "center", fontSize: 13, color: C.t3 },
  linkBold: { color: C.primary, fontWeight: "700" },
});

import { useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { login } from "@/domains/auth/api";
import { useAuthStore } from "@/store/auth";
import { FormInput } from "@/components/ui/FormInput";
import { Button } from "@/components/ui/Button";
import { C } from "@/lib/colors";
import { card, radius, sp } from "@/lib/styles";

export function LoginScreen() {
  const router = useRouter();
  const { setAuth, setSavedUsername, setAutoLogin, savedUsername, autoLogin } = useAuthStore();

  const [form,         setForm]         = useState({ username: "", password: "" });
  const [saveUsername, setSaveUsername] = useState(false);
  const [autoLoginOn,  setAutoLoginOn]  = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");

  // 저장된 아이디 / 자동 로그인 설정 복원
  useEffect(() => {
    if (savedUsername) {
      setForm((p) => ({ ...p, username: savedUsername }));
      setSaveUsername(true);
    }
    setAutoLoginOn(autoLogin);
  }, [savedUsername, autoLogin]);

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
        setAutoLogin(autoLoginOn);
        setSavedUsername(form.username, saveUsername);
        setAuth(res.data.accessToken, res.data.username, res.data.refreshToken);
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

  const toggleSaveUsername = () => {
    const next = !saveUsername;
    setSaveUsername(next);
    if (!next) setSavedUsername("", false);
  };

  const toggleAutoLogin = () => {
    const next = !autoLoginOn;
    setAutoLoginOn(next);
    // 자동 로그인 켜면 아이디 저장도 함께 활성화
    if (next && !saveUsername) setSaveUsername(true);
  };

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <View style={s.brand}>
          <View style={s.logo}><Text style={s.logoText}>RT</Text></View>
          <Text style={s.brandName}>ReeL-Trip</Text>
          <Text style={s.brandSub}>공유한 순간이 여행이 되는 곳</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>로그인</Text>

          <FormInput
            label="아이디"
            placeholder="아이디 입력"
            value={form.username}
            onChangeText={(v) => setForm((p) => ({ ...p, username: v }))}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <FormInput
            label="비밀번호"
            placeholder="비밀번호 입력"
            value={form.password}
            onChangeText={(v) => setForm((p) => ({ ...p, password: v }))}
            secureTextEntry
            onSubmitEditing={handleLogin}
            returnKeyType="done"
          />

          <View style={s.options}>
            <TouchableOpacity style={s.checkRow} onPress={toggleSaveUsername} activeOpacity={0.7}>
              <View style={[s.checkbox, saveUsername && s.checkboxOn]}>
                {saveUsername && <Text style={s.checkmark}>✓</Text>}
              </View>
              <Text style={s.checkLabel}>아이디 저장</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.checkRow} onPress={toggleAutoLogin} activeOpacity={0.7}>
              <View style={[s.checkbox, autoLoginOn && s.checkboxOn]}>
                {autoLoginOn && <Text style={s.checkmark}>✓</Text>}
              </View>
              <Text style={s.checkLabel}>자동 로그인</Text>
            </TouchableOpacity>
          </View>

          {error ? <Text style={s.error}>{error}</Text> : null}
          <Button label="로그인" onPress={handleLogin} loading={loading} style={{ marginTop: 4 }} />
        </View>

        <TouchableOpacity onPress={() => router.push("/auth/signup")}>
          <Text style={s.link}>계정이 없으신가요? <Text style={s.linkBold}>회원가입</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex:       { flex: 1, backgroundColor: C.bg },
  container:  { flexGrow: 1, justifyContent: "center", padding: sp.xxl, paddingBottom: 40 },
  brand:      { alignItems: "center", marginBottom: 32 },
  logo:       { width: 56, height: 56, borderRadius: radius.lg, backgroundColor: C.primary, alignItems: "center", justifyContent: "center", marginBottom: sp.sm + 2 },
  logoText:   { color: C.white, fontSize: 18, fontWeight: "800", letterSpacing: 1 },
  brandName:  { fontSize: 22, fontWeight: "800", color: C.t1, marginBottom: 4 },
  brandSub:   { fontSize: 13, color: C.t3 },
  card:       { ...card, padding: sp.xxl, marginBottom: sp.xl },
  cardTitle:  { fontSize: 20, fontWeight: "700", color: C.t1, marginBottom: sp.xl },
  options:    { flexDirection: "row", justifyContent: "space-between", marginTop: sp.sm, marginBottom: sp.md },
  checkRow:   { flexDirection: "row", alignItems: "center", gap: 6 },
  checkbox:   { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: C.border, alignItems: "center", justifyContent: "center" },
  checkboxOn: { backgroundColor: C.primary, borderColor: C.primary },
  checkmark:  { color: C.white, fontSize: 11, fontWeight: "700" },
  checkLabel: { fontSize: 13, color: C.t2 },
  error:      { fontSize: 13, color: C.red, marginBottom: sp.md, textAlign: "center" },
  link:       { textAlign: "center", fontSize: 13, color: C.t3 },
  linkBold:   { color: C.primary, fontWeight: "700" },
});

import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ShareIntentProvider, useShareIntentContext } from "expo-share-intent";
import { getToken } from "@/lib/auth-store";
import { listTeamSpaces } from "@/domains/teamspace/api";
import { addPlace } from "@/domains/place/api";
import { parseUrl } from "@/domains/url-parser/api";
import { C } from "@/lib/colors";

/* ── 공유 인텐트 자동 처리 ── */

type ShareStatus = "idle" | "parsing" | "saving" | "success" | "error";

function ShareHandler() {
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntentContext();
  const [status, setStatus] = useState<ShareStatus>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!hasShareIntent) return;
    const url = shareIntent?.text ?? shareIntent?.webUrl;
    if (!url) { resetShareIntent(); return; }
    handleAutoSave(url);
  }, [hasShareIntent]);

  const handleAutoSave = async (url: string) => {
    try {
      setStatus("parsing");
      setMessage("URL 분석 중...");

      const token = await getToken();
      if (!token) {
        show("error", "로그인이 필요합니다.");
        return;
      }

      const parseRes = await parseUrl(url, token);
      if (!parseRes.success || !parseRes.data) {
        show("error", "파싱에 실패했습니다.");
        return;
      }

      const parsed = parseRes.data;
      setStatus("saving");
      setMessage("저장 중...");

      const spacesRes = await listTeamSpaces(token);
      if (!spacesRes.success || !spacesRes.data || spacesRes.data.length === 0) {
        show("error", "팀스페이스가 없습니다.");
        return;
      }

      const spaceId = spacesRes.data[0].id;

      const saveRes = await addPlace({
        spaceId,
        name: parsed.name ?? "이름 없음",
        category: parsed.category ?? undefined,
        address: parsed.location.address ?? undefined,
        region: parsed.location.region ?? undefined,
        country: parsed.location.country ?? undefined,
        priceDesc: parsed.price.description ?? undefined,
        priceMin: parsed.price.min ?? undefined,
        priceMax: parsed.price.max ?? undefined,
        currency: parsed.price.currency ?? undefined,
        hours: parsed.hours ?? undefined,
        thumbnailUrl: parsed.thumbnailUrl ?? undefined,
        sourceUrl: parsed.sourceUrl,
        sourcePlatform: parsed.sourcePlatform,
        tags: parsed.tags,
        menu: parsed.menu,
        confidence: parsed.confidence,
      }, token);

      if (saveRes.success) {
        show("success", `"${parsed.name ?? "장소"}" 저장됨`);
      } else {
        show("error", "저장에 실패했습니다.");
      }
    } catch {
      show("error", "오류가 발생했습니다.");
    }
  };

  const show = (s: ShareStatus, msg: string) => {
    setStatus(s);
    setMessage(msg);
    setTimeout(() => {
      setStatus("idle");
      resetShareIntent();
    }, 2500);
  };

  if (status === "idle") return null;

  return (
    <View style={sh.overlay} pointerEvents="none">
      <View style={sh.card}>
        {status === "parsing" || status === "saving" ? (
          <ActivityIndicator color="#fff" size="small" style={{ marginRight: 8 }} />
        ) : (
          <Text style={sh.icon}>{status === "success" ? "✅" : "❌"}</Text>
        )}
        <Text style={sh.label}>{message}</Text>
      </View>
    </View>
  );
}

/* ── 루트 레이아웃 ── */

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [token, setToken] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    getToken().then(setToken);
  }, [segments]);

  useEffect(() => {
    if (token === undefined) return;
    const inAuthGroup = segments[0] === "auth";
    if (!token && !inAuthGroup) {
      router.replace("/auth/login");
    } else if (token && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [token, segments]);

  return (
    <ShareIntentProvider>
      <View style={{ flex: 1 }}>
        <StatusBar style="auto" />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth/login" options={{ title: "로그인", headerBackVisible: false }} />
          <Stack.Screen name="auth/signup" options={{ title: "회원가입" }} />
        </Stack>
        <ShareHandler />
      </View>
    </ShareIntentProvider>
  );
}

const sh = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 9999,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.82)",
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  icon: { fontSize: 15, marginRight: 8 },
  label: { fontSize: 14, fontWeight: "600", color: "#fff" },
});

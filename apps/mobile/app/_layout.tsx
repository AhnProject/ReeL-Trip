import { useEffect } from "react";
import { View } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ShareIntentProvider } from "expo-share-intent";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
import { Toast } from "@/components/ui/Toast";
import { ShareHandler } from "@/features/share/ShareHandler";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry:                 1,
      refetchOnWindowFocus:  false,
    },
  },
});

/* ── 인증 가드 ── */

function AuthGuard() {
  const { token, isReady } = useAuthStore();
  const segments = useSegments();
  const router   = useRouter();

  useEffect(() => {
    if (!isReady) return;
    const inAuthGroup = segments[0] === "auth";
    if (!token && !inAuthGroup) {
      router.replace("/auth/login");
    } else if (token && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [token, isReady, segments]);

  return null;
}

/* ── 루트 레이아웃 ── */

export default function RootLayout() {
  const initFromStorage = useAuthStore((s) => s.initFromStorage);

  useEffect(() => {
    initFromStorage();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ShareIntentProvider>
        <View style={{ flex: 1 }}>
          <StatusBar style="auto" />
          <Stack>
            <Stack.Screen name="(tabs)"      options={{ headerShown: false }} />
            <Stack.Screen name="auth/login"  options={{ title: "로그인", headerBackVisible: false }} />
            <Stack.Screen name="auth/signup" options={{ title: "회원가입" }} />
          </Stack>
          <AuthGuard />
          <ShareHandler />
          <Toast />
        </View>
      </ShareIntentProvider>
    </QueryClientProvider>
  );
}

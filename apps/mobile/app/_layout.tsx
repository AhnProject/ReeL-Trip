import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { getToken } from "@/lib/auth-store";

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
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ title: "로그인", headerBackVisible: false }} />
        <Stack.Screen name="auth/signup" options={{ title: "회원가입" }} />
      </Stack>
    </>
  );
}

import { useState } from "react";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/auth";
import { useProfile, useAvatar } from "@/hooks/useProfile";

export function useProfileData() {
  const router    = useRouter();
  const username  = useAuthStore((s) => s.username);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [refreshing, setRefreshing] = useState(false);

  const profileQuery = useProfile();
  const avatarQuery  = useAvatar();

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([profileQuery.refetch(), avatarQuery.refetch()]);
    setRefreshing(false);
  };

  const handleLogout = () => {
    clearAuth();
    router.replace("/auth/login");
  };

  return {
    profile:    profileQuery.data ?? null,
    avatar:     avatarQuery.data?.avatar ?? null,
    username,
    loading:    profileQuery.isLoading,
    refreshing,
    onRefresh,
    handleLogout,
  };
}

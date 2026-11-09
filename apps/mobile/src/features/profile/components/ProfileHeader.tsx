import { View, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { UserProfile } from "@/domains/user/api";
import { C } from "@/lib/colors";

interface ProfileHeaderProps {
  profile: UserProfile | null;
  username: string;
  avatar?: string | null;
  onEditAvatar?: () => void;
  avatarUploading?: boolean;
}

function PlanBadge({ plan }: { plan?: string }) {
  if (!plan) return null;
  const isPro = plan.toLowerCase().includes("pro");
  return (
    <View style={[s.badge, isPro ? s.badgePro : s.badgeFree]}>
      <Text style={[s.badgeText, isPro ? s.badgeTextPro : s.badgeTextFree]}>
        {isPro ? "Pro" : "Free"}
      </Text>
    </View>
  );
}

export function ProfileHeader({ profile, username, avatar, onEditAvatar, avatarUploading }: ProfileHeaderProps) {
  const displayName = profile?.username || username || "?";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <View style={s.section}>
      <TouchableOpacity
        style={s.avatar}
        onPress={onEditAvatar}
        disabled={!onEditAvatar || avatarUploading}
        activeOpacity={0.8}
      >
        <View style={s.avatarInner}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={s.avatarImage} />
          ) : (
            <Text style={s.avatarText}>{initial}</Text>
          )}
        </View>
        {onEditAvatar && (
          <View style={s.editBadge}>
            {avatarUploading ? (
              <ActivityIndicator size="small" color={C.white} />
            ) : (
              <Ionicons name="camera" size={14} color={C.white} />
            )}
          </View>
        )}
      </TouchableOpacity>
      <View style={s.nameRow}>
        <Text style={s.name}>{displayName}</Text>
        <PlanBadge plan={profile?.plan} />
      </View>
      {profile?.email ? <Text style={s.email}>{profile.email}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  section: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: C.white,
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  avatarInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: { width: 80, height: 80 },
  avatarText: { fontSize: 32, fontWeight: "800", color: C.white },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: C.white,
  },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  name: { fontSize: 20, fontWeight: "700", color: C.t1 },
  email: { fontSize: 13, color: C.t3 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  badgePro: { backgroundColor: C.primaryLight },
  badgeFree: { backgroundColor: "#F1F5F9" },
  badgeText: { fontSize: 11, fontWeight: "700" },
  badgeTextPro: { color: C.primary },
  badgeTextFree: { color: C.t3 },
});

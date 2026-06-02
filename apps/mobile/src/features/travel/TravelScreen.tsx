import { useState } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTravelData } from "./hooks/useTravelData";
import { PlaceCard } from "./components/PlaceCard";
import { SpaceTabs, SpaceInfo } from "./components/SpaceInfo";
import { UrlParserModal } from "./components/UrlParserModal";
import { InviteModal } from "./components/InviteModal";
import { AppHeader } from "@/components/ui/AppHeader";
import { FAB } from "@/components/ui/FAB";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { C } from "@/lib/colors";

export function TravelScreen() {
  const {
    spaces, selectedIdx, setSelectedIdx,
    places, confirmedIds, loading, currentSpace,
    handleToggleConfirm,
  } = useTravelData();

  const [showUrlModal, setShowUrlModal]     = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  if (loading) return <LoadingScreen />;

  const inviteButton = currentSpace ? (
    <TouchableOpacity onPress={() => setShowInviteModal(true)} style={s.inviteBtn}>
      <Ionicons name="person-add-outline" size={18} color={C.primary} />
    </TouchableOpacity>
  ) : undefined;

  return (
    <SafeAreaView style={s.safe}>
      <AppHeader title="여행지" right={inviteButton} />

      <SpaceTabs spaces={spaces} selectedIdx={selectedIdx} onSelect={setSelectedIdx} />

      {currentSpace && <SpaceInfo space={currentSpace} />}

      <ScrollView
        style={s.list}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {places.length === 0 ? (
          <EmptyState
            emoji="📍"
            title="저장된 여행지가 없습니다"
            description="아래 버튼으로 여행지를 추가해보세요"
          />
        ) : (
          places.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              isConfirmed={confirmedIds.has(place.id)}
              onToggleConfirm={() => handleToggleConfirm(place.id)}
            />
          ))
        )}
      </ScrollView>

      <FAB
        label="URL로 추가"
        iconName="link"
        onPress={() => setShowUrlModal(true)}
        disabled={!currentSpace}
      />

      {showUrlModal && currentSpace && (
        <UrlParserModal
          visible={showUrlModal}
          spaceId={currentSpace.id}
          onClose={() => setShowUrlModal(false)}
        />
      )}

      {showInviteModal && currentSpace && (
        <InviteModal
          visible={showInviteModal}
          spaceId={currentSpace.id}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  list: { flex: 1 },
  inviteBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
});

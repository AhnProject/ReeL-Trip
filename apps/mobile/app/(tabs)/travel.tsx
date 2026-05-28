import { useCallback, useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, TextInput, ActivityIndicator, Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getToken } from "@/lib/auth-store";
import { listTeamSpaces, inviteMember } from "@/domains/teamspace/api";
import type { TeamSpaceResponse, MemberResponse } from "@/domains/teamspace/api";
import { listPlaces, addPlace, updatePlace } from "@/domains/place/api";
import type { PlaceResponse } from "@/domains/place/api";
import { apiRequest } from "@/lib/api-client";
import { C } from "@/lib/colors";

/* ── ParsedResult 타입 ── */
interface ParsedResult {
  name: string | null;
  category: string | null;
  location: { address: string | null; region: string | null; country: string | null };
  price: { description: string | null; min: number | null; max: number | null; currency: string | null };
  hours: string | null;
  menu: string[];
  tags: string[];
  description: string | null;
  sourceUrl: string;
  sourcePlatform: "youtube_shorts" | "instagram_reels";
  thumbnailUrl: string | null;
  confidence: "high" | "medium" | "low";
}

const ERROR_MSGS: Record<string, string> = {
  UNSUPPORTED_URL:  "YouTube Shorts 또는 Instagram Reels URL만 지원합니다.",
  PRIVATE_CONTENT:  "비공개 콘텐츠이거나 접근할 수 없는 URL입니다.",
  EXTRACTION_FAILED:"여행/관광 관련 정보를 찾을 수 없는 콘텐츠입니다.",
};

/* ── URL 파서 모달 ── */
function UrlParserModal({
  visible, token, spaceId, onClose, onAdded,
}: {
  visible: boolean; token: string; spaceId: number;
  onClose: () => void; onAdded: (place: PlaceResponse) => void;
}) {
  const [url, setUrl]       = useState("");
  const [status, setStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  const [result, setResult] = useState<ParsedResult | null>(null);
  const [errMsg, setErrMsg] = useState("");
  const [adding, setAdding] = useState(false);

  const handleParse = async () => {
    if (!url.trim()) return;
    setStatus("loading"); setResult(null); setErrMsg("");
    const res = await apiRequest<ParsedResult>(
      "/api/url-parser/parse",
      { method: "POST", body: JSON.stringify({ url: url.trim() }) },
      token,
    );
    if (res.success && res.data) { setResult(res.data); setStatus("success"); }
    else {
      const code = (res as { errorCode?: string }).errorCode ?? "";
      setErrMsg(ERROR_MSGS[code] ?? "파싱 중 오류가 발생했습니다.");
      setStatus("error");
    }
  };

  const handleAdd = async () => {
    if (!result) return;
    setAdding(true);
    const res = await addPlace({
      spaceId,
      name: result.name ?? "이름 없음",
      category: result.category ?? undefined,
      address: result.location.address ?? undefined,
      region: result.location.region ?? undefined,
      country: result.location.country ?? undefined,
      priceDesc: result.price.description ?? undefined,
      priceMin: result.price.min ?? undefined,
      priceMax: result.price.max ?? undefined,
      currency: result.price.currency ?? undefined,
      hours: result.hours ?? undefined,
      thumbnailUrl: result.thumbnailUrl ?? undefined,
      sourceUrl: result.sourceUrl,
      sourcePlatform: result.sourcePlatform,
      tags: result.tags,
      menu: result.menu,
      confidence: result.confidence,
    }, token);
    if (res.success && res.data) {
      onAdded(res.data);
      setUrl(""); setStatus("idle"); setResult(null);
    }
    setAdding(false);
  };

  const reset = () => { setUrl(""); setStatus("idle"); setResult(null); setErrMsg(""); };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        <View style={um.header}>
          <Text style={um.title}>URL로 여행지 추가</Text>
          <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={C.t2} /></TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={um.body} keyboardShouldPersistTaps="handled">
          <Text style={um.hint}>YouTube Shorts 또는 Instagram Reels URL을 붙여넣으세요.</Text>

          <View style={um.inputRow}>
            <TextInput
              style={um.urlInput}
              placeholder="https://..."
              placeholderTextColor={C.t4}
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            <TouchableOpacity
              style={[um.parseBtn, (!url.trim() || status === "loading") && { opacity: 0.5 }]}
              onPress={handleParse}
              disabled={!url.trim() || status === "loading"}
            >
              {status === "loading"
                ? <ActivityIndicator color={C.white} size="small" />
                : <Text style={um.parseBtnText}>분석</Text>
              }
            </TouchableOpacity>
          </View>

          {status === "error" && (
            <View style={um.errorBox}>
              <Ionicons name="warning-outline" size={16} color={C.red} />
              <Text style={um.errorText}>{errMsg}</Text>
            </View>
          )}

          {status === "success" && result && (
            <View style={um.resultCard}>
              {result.thumbnailUrl && (
                <Image source={{ uri: result.thumbnailUrl }} style={um.thumb} resizeMode="cover" />
              )}
              <View style={um.resultBody}>
                <View style={um.platformBadge}>
                  <Text style={um.platformText}>
                    {result.sourcePlatform === "youtube_shorts" ? "YouTube Shorts" : "Instagram Reels"}
                  </Text>
                </View>
                <Text style={um.resultName}>{result.name}</Text>
                {result.description && (
                  <Text style={um.resultDesc} numberOfLines={2}>{result.description}</Text>
                )}
                {result.location.region && (
                  <Text style={um.resultMeta}>📍 {[result.location.country, result.location.region].filter(Boolean).join(" · ")}</Text>
                )}
                {result.price.description && (
                  <Text style={um.resultMeta}>💰 {result.price.description}</Text>
                )}
                {result.hours && (
                  <Text style={um.resultMeta}>🕐 {result.hours}</Text>
                )}

                {result.tags.length > 0 && (
                  <View style={um.tagRow}>
                    {result.tags.slice(0, 5).map((t) => (
                      <View key={t} style={um.tag}><Text style={um.tagText}>#{t}</Text></View>
                    ))}
                  </View>
                )}

                <View style={um.resultActions}>
                  <TouchableOpacity onPress={reset} style={um.resetBtn}>
                    <Text style={um.resetText}>다시 입력</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[um.addBtn, adding && { opacity: 0.6 }]}
                    onPress={handleAdd}
                    disabled={adding}
                  >
                    {adding
                      ? <ActivityIndicator color={C.white} size="small" />
                      : <Text style={um.addBtnText}>목록에 추가</Text>
                    }
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

/* ── 멤버 초대 모달 ── */
function InviteModal({
  visible, token, spaceId, onClose, onInvited,
}: {
  visible: boolean; token: string; spaceId: number;
  onClose: () => void; onInvited: (m: MemberResponse) => void;
}) {
  const [name, setName]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const submit = async () => {
    if (!name.trim()) { setError("사용자 이름을 입력해주세요."); return; }
    setLoading(true); setError("");
    try {
      const res = await inviteMember(spaceId, name.trim(), token);
      if (res.success && res.data) { onInvited(res.data); setName(""); onClose(); }
      else setError("초대에 실패했습니다. 사용자 이름을 확인해주세요.");
    } catch { setError("서버 오류가 발생했습니다."); }
    finally { setLoading(false); }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        <View style={um.header}>
          <Text style={um.title}>멤버 초대</Text>
          <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={C.t2} /></TouchableOpacity>
        </View>
        <View style={{ padding: 20 }}>
          <Text style={[um.hint, { marginBottom: 16 }]}>초대할 사용자 이름을 입력하세요.</Text>
          <TextInput
            style={[um.urlInput, { flex: undefined, borderRadius: 12, padding: 14, marginBottom: 12 }]}
            placeholder="예: gildong123"
            placeholderTextColor={C.t4}
            value={name}
            onChangeText={setName}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
          />
          {error ? <Text style={um.errorText}>{error}</Text> : null}
          <TouchableOpacity
            style={[um.addBtn, { marginTop: 8 }, (!name.trim() || loading) && { opacity: 0.5 }]}
            onPress={submit}
            disabled={loading || !name.trim()}
          >
            {loading ? <ActivityIndicator color={C.white} size="small" /> : <Text style={um.addBtnText}>초대하기</Text>}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

/* ── 여행지 화면 ── */
export default function TravelScreen() {
  const router = useRouter();
  const [token, setToken]   = useState("");
  const [spaces, setSpaces] = useState<TeamSpaceResponse[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [places, setPlaces] = useState<PlaceResponse[]>([]);
  const [confirmedIds, setConfirmedIds] = useState<Set<number>>(new Set());
  const [showUrlModal, setShowUrlModal]   = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadPlaces = useCallback(async (tok: string, spaceId: number) => {
    const res = await listPlaces(spaceId, tok).catch(() => null);
    if (res?.success && res.data) setPlaces(res.data);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const tok = await getToken();
        if (!tok) { router.replace("/auth/login"); return; }
        setToken(tok);
        const res = await listTeamSpaces(tok).catch(() => null);
        if (res?.success && res.data && res.data.length > 0) {
          setSpaces(res.data);
          await loadPlaces(tok, res.data[0].id);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [loadPlaces, router]);

  useEffect(() => {
    if (token && spaces.length > 0) {
      loadPlaces(token, spaces[selectedIdx].id);
    }
  }, [selectedIdx, token, spaces, loadPlaces]);

  const currentSpace = spaces[selectedIdx];

  const handleToggleConfirm = async (placeId: number) => {
    setConfirmedIds((prev) => {
      const next = new Set(prev);
      if (next.has(placeId)) next.delete(placeId);
      else next.add(placeId);
      return next;
    });
    if (token) updatePlace(placeId, {}, token).catch(() => {});
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: C.bg }}>
        <ActivityIndicator color={C.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      {/* 상단 헤더 */}
      <View style={s.topBar}>
        <View style={s.rtBadge}><Text style={s.rtText}>RT</Text></View>
        <Text style={s.screenTitle}>여행지</Text>
        {currentSpace ? (
          <TouchableOpacity onPress={() => setShowInviteModal(true)} style={s.inviteBtn}>
            <Ionicons name="person-add-outline" size={18} color={C.primary} />
          </TouchableOpacity>
        ) : <View style={{ width: 36 }} />}
      </View>

      {/* 스페이스 선택 탭 */}
      {spaces.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.spaceTabs} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {spaces.map((sp, i) => (
            <TouchableOpacity
              key={sp.id}
              onPress={() => setSelectedIdx(i)}
              style={[s.spaceTab, i === selectedIdx && s.spaceTabActive]}
            >
              <Text style={{ marginRight: 4 }}>{sp.emoji ?? "✈️"}</Text>
              <Text style={[s.spaceTabText, i === selectedIdx && { color: C.primary }]}>{sp.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* 스페이스 정보 */}
      {currentSpace && (
        <View style={s.spaceInfo}>
          <View style={[s.spaceEmojiBox, { backgroundColor: currentSpace.bgColor ?? C.primary }]}>
            <Text style={{ fontSize: 22 }}>{currentSpace.emoji ?? "✈️"}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.spaceName}>{currentSpace.name}</Text>
            <Text style={s.spaceMeta}>{currentSpace.members.length}명 참여 중</Text>
          </View>
          {/* 멤버 아바타 */}
          <View style={s.avatarRow}>
            {currentSpace.members.slice(0, 4).map((m, i) => (
              <View key={m.userId} style={[s.avatar, { marginLeft: i === 0 ? 0 : -8, zIndex: 10 - i }]}>
                <Text style={s.avatarText}>{m.username.slice(0, 1)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 장소 목록 */}
      <ScrollView style={s.list} contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {places.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={{ fontSize: 40, marginBottom: 10 }}>📍</Text>
            <Text style={s.emptyTitle}>저장된 여행지가 없습니다</Text>
            <Text style={s.emptyDesc}>아래 버튼으로 여행지를 추가해보세요</Text>
          </View>
        ) : (
          places.map((place) => {
            const isConfirmed = confirmedIds.has(place.id);
            return (
              <View key={place.id} style={s.placeCard}>
                {place.thumbnailUrl ? (
                  <Image source={{ uri: place.thumbnailUrl }} style={s.placeThumb} resizeMode="cover" />
                ) : (
                  <View style={s.placeThumbEmpty}>
                    <Ionicons name="location" size={24} color={C.t4} />
                  </View>
                )}
                <View style={s.placeInfo}>
                  <Text style={s.placeName} numberOfLines={1}>{place.name}</Text>
                  {place.category && (
                    <View style={s.categoryBadge}>
                      <Text style={s.categoryText}>{place.category}</Text>
                    </View>
                  )}
                  {(place.region || place.country) && (
                    <Text style={s.placeMeta} numberOfLines={1}>
                      📍 {[place.country, place.region].filter(Boolean).join(" · ")}
                    </Text>
                  )}
                  {place.priceDesc && (
                    <Text style={s.placeMeta} numberOfLines={1}>💰 {place.priceDesc}</Text>
                  )}
                  {place.tags.length > 0 && (
                    <View style={s.tagRow}>
                      {place.tags.slice(0, 3).map((t) => (
                        <View key={t} style={s.tag}><Text style={s.tagText}>#{t}</Text></View>
                      ))}
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => handleToggleConfirm(place.id)}
                  style={[s.confirmBtn, isConfirmed && s.confirmBtnActive]}
                >
                  <Ionicons
                    name={isConfirmed ? "checkmark-circle" : "checkmark-circle-outline"}
                    size={16}
                    color={isConfirmed ? C.white : C.t4}
                  />
                  <Text style={[s.confirmText, isConfirmed && { color: C.white }]}>
                    {isConfirmed ? "확정됨" : "확정"}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* + 장소 추가 FAB */}
      <TouchableOpacity style={s.fab} onPress={() => currentSpace && setShowUrlModal(true)}>
        <Ionicons name="link" size={20} color={C.white} />
        <Text style={s.fabText}>URL로 추가</Text>
      </TouchableOpacity>

      {showUrlModal && currentSpace && (
        <UrlParserModal
          visible={showUrlModal}
          token={token}
          spaceId={currentSpace.id}
          onClose={() => setShowUrlModal(false)}
          onAdded={(place) => { setPlaces((p) => [...p, place]); setShowUrlModal(false); }}
        />
      )}

      {showInviteModal && currentSpace && (
        <InviteModal
          visible={showInviteModal}
          token={token}
          spaceId={currentSpace.id}
          onClose={() => setShowInviteModal(false)}
          onInvited={(member) => {
            setSpaces((prev) => prev.map((sp, i) =>
              i === selectedIdx
                ? { ...sp, members: [...sp.members, member] }
                : sp,
            ));
          }}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  topBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 12,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  rtBadge: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.primary, alignItems: "center", justifyContent: "center" },
  rtText: { color: C.white, fontSize: 12, fontWeight: "800" },
  screenTitle: { fontSize: 17, fontWeight: "700", color: C.t1 },
  inviteBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: C.primaryLight,
    alignItems: "center", justifyContent: "center",
  },
  spaceTabs: { backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border, maxHeight: 50 },
  spaceTab: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 20, backgroundColor: C.bg,
  },
  spaceTabActive: { backgroundColor: C.primaryLight },
  spaceTabText: { fontSize: 13, fontWeight: "600", color: C.t3 },

  spaceInfo: {
    flexDirection: "row", alignItems: "center", backgroundColor: C.white,
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  spaceEmojiBox: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  spaceName: { fontSize: 15, fontWeight: "700", color: C.t1 },
  spaceMeta: { fontSize: 12, color: C.t4, marginTop: 2 },
  avatarRow: { flexDirection: "row" },
  avatar: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: C.primary,
    alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: C.white,
  },
  avatarText: { color: C.white, fontSize: 11, fontWeight: "700" },

  list: { flex: 1 },
  placeCard: {
    backgroundColor: C.white, borderRadius: 16, marginBottom: 10,
    borderWidth: 1, borderColor: C.border, overflow: "hidden",
    flexDirection: "row", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  placeThumb: { width: 80, height: 90 },
  placeThumbEmpty: {
    width: 80, height: 90, backgroundColor: C.bg,
    alignItems: "center", justifyContent: "center",
  },
  placeInfo: { flex: 1, padding: 12 },
  placeName: { fontSize: 14, fontWeight: "700", color: C.t1, marginBottom: 4 },
  categoryBadge: {
    backgroundColor: C.primaryLight, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2,
    alignSelf: "flex-start", marginBottom: 4,
  },
  categoryText: { fontSize: 10, color: C.primary, fontWeight: "600" },
  placeMeta: { fontSize: 11, color: C.t4, marginBottom: 2 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 4 },
  tag: { backgroundColor: C.bg, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  tagText: { fontSize: 10, color: C.t3 },
  confirmBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    margin: 12, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 7,
    borderWidth: 1, borderColor: C.borderLight, backgroundColor: C.bg,
  },
  confirmBtnActive: { backgroundColor: C.green, borderColor: C.green },
  confirmText: { fontSize: 11, fontWeight: "600", color: C.t4 },

  emptyCard: {
    alignItems: "center", paddingVertical: 60,
    backgroundColor: C.white, borderRadius: 16,
    borderWidth: 1, borderStyle: "dashed", borderColor: C.borderLight,
  },
  emptyTitle: { fontSize: 15, fontWeight: "700", color: C.t2, marginBottom: 6 },
  emptyDesc: { fontSize: 13, color: C.t4 },

  fab: {
    position: "absolute", right: 20, bottom: 24,
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: C.primary, borderRadius: 999,
    paddingHorizontal: 20, paddingVertical: 13,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
  },
  fabText: { color: C.white, fontSize: 14, fontWeight: "700" },
});

const um = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  title: { fontSize: 18, fontWeight: "700", color: C.t1 },
  body: { padding: 20 },
  hint: { fontSize: 13, color: C.t3, lineHeight: 18 },
  inputRow: { flexDirection: "row", gap: 8, marginTop: 16, marginBottom: 12 },
  urlInput: {
    flex: 1, borderWidth: 1, borderColor: C.borderLight, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, color: C.t1, backgroundColor: C.white,
  },
  parseBtn: {
    backgroundColor: C.t1, borderRadius: 12, paddingHorizontal: 16,
    alignItems: "center", justifyContent: "center", minWidth: 56,
  },
  parseBtnText: { color: C.white, fontWeight: "700", fontSize: 13 },
  errorBox: {
    flexDirection: "row", alignItems: "center", gap: 8, padding: 14,
    backgroundColor: "#FEF2F2", borderRadius: 12, borderWidth: 1, borderColor: "#FECACA",
  },
  errorText: { fontSize: 13, color: C.red, flex: 1 },
  resultCard: {
    backgroundColor: C.white, borderRadius: 16,
    borderWidth: 1, borderColor: C.border, overflow: "hidden", marginTop: 4,
  },
  thumb: { width: "100%", height: 160 },
  resultBody: { padding: 16 },
  platformBadge: {
    backgroundColor: C.primaryLight, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
    alignSelf: "flex-start", marginBottom: 8,
  },
  platformText: { fontSize: 11, color: C.primary, fontWeight: "600" },
  resultName: { fontSize: 17, fontWeight: "700", color: C.t1, marginBottom: 6, lineHeight: 22 },
  resultDesc: { fontSize: 13, color: C.t3, lineHeight: 18, marginBottom: 8 },
  resultMeta: { fontSize: 12, color: C.t3, marginBottom: 4 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  tag: { backgroundColor: C.bg, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontSize: 11, color: C.t3 },
  resultActions: { flexDirection: "row", gap: 10, marginTop: 16 },
  resetBtn: {
    flex: 1, borderWidth: 1, borderColor: C.borderLight, borderRadius: 12,
    paddingVertical: 12, alignItems: "center",
  },
  resetText: { fontSize: 13, color: C.t3, fontWeight: "600" },
  addBtn: {
    flex: 1, backgroundColor: C.primary, borderRadius: 12,
    paddingVertical: 12, alignItems: "center",
  },
  addBtnText: { color: C.white, fontSize: 13, fontWeight: "700" },
});

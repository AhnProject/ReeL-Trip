import { useState } from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet, TextInput, ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { apiRequest } from "@/lib/api-client";
import { addPlace } from "@/domains/place/api";
import { useAuthStore } from "@/store/auth";
import { useInvalidatePlaces } from "@/hooks/usePlaces";
import { toast } from "@/store/toast";
import { C } from "@/lib/colors";
import { modalHeader, card, input, row, radius, sp } from "@/lib/styles";

interface ParsedResult {
  name:           string | null;
  category:       string | null;
  location:       { address: string | null; region: string | null; country: string | null };
  price:          { description: string | null; min: number | null; max: number | null; currency: string | null };
  hours:          string | null;
  menu:           string[];
  tags:           string[];
  description:    string | null;
  sourceUrl:      string;
  sourcePlatform: "youtube_shorts" | "instagram_reels";
  thumbnailUrl:   string | null;
  confidence:     "high" | "medium" | "low";
}

const ERROR_MSGS: Record<string, string> = {
  UNSUPPORTED_URL:   "YouTube Shorts 또는 Instagram Reels URL만 지원합니다.",
  PRIVATE_CONTENT:   "비공개 콘텐츠이거나 접근할 수 없는 URL입니다.",
  EXTRACTION_FAILED: "여행/관광 관련 정보를 찾을 수 없는 콘텐츠입니다.",
};

interface UrlParserModalProps {
  visible: boolean;
  spaceId: number;
  onClose: () => void;
}

export function UrlParserModal({ visible, spaceId, onClose }: UrlParserModalProps) {
  const token            = useAuthStore((s) => s.token);
  const invalidatePlaces = useInvalidatePlaces();

  const [url,    setUrl]    = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<ParsedResult | null>(null);
  const [errMsg, setErrMsg] = useState("");
  const [adding, setAdding] = useState(false);

  const handleParse = async () => {
    if (!url.trim() || !token) return;
    setStatus("loading"); setResult(null); setErrMsg("");
    const res = await apiRequest<ParsedResult>("/api/url-parser/parse", { method: "POST", body: JSON.stringify({ url: url.trim() }) }, token);
    if (res.success && res.data) { setResult(res.data); setStatus("success"); }
    else {
      const code = (res as { errorCode?: string }).errorCode ?? "";
      setErrMsg(ERROR_MSGS[code] ?? "파싱 중 오류가 발생했습니다.");
      setStatus("error");
    }
  };

  const handleAdd = async () => {
    if (!result || !token) return;
    setAdding(true);
    const res = await addPlace({
      spaceId, name: result.name ?? "이름 없음",
      category: result.category ?? undefined, address: result.location.address ?? undefined,
      region: result.location.region ?? undefined, country: result.location.country ?? undefined,
      priceDesc: result.price.description ?? undefined, priceMin: result.price.min ?? undefined,
      priceMax: result.price.max ?? undefined, currency: result.price.currency ?? undefined,
      hours: result.hours ?? undefined, thumbnailUrl: result.thumbnailUrl ?? undefined,
      sourceUrl: result.sourceUrl, sourcePlatform: result.sourcePlatform,
      tags: result.tags, menu: result.menu, confidence: result.confidence,
    }, token);
    if (res.success) {
      toast.success(`"${result.name ?? "장소"}" 추가됨`);
      invalidatePlaces(spaceId);
      setUrl(""); setStatus("idle"); setResult(null);
      onClose();
    }
    setAdding(false);
  };

  const reset = () => { setUrl(""); setStatus("idle"); setResult(null); setErrMsg(""); };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        <View style={s.header}>
          <Text style={s.title}>URL로 여행지 추가</Text>
          <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={C.t2} /></TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
          <Text style={s.hint}>YouTube Shorts 또는 Instagram Reels URL을 붙여넣으세요.</Text>

          <View style={s.inputRow}>
            <TextInput style={[s.urlInput, { flex: 1 }]} placeholder="https://..." placeholderTextColor={C.t4} value={url} onChangeText={setUrl} autoCapitalize="none" autoCorrect={false} keyboardType="url" />
            <TouchableOpacity style={[s.parseBtn, (!url.trim() || status === "loading") && { opacity: 0.5 }]} onPress={handleParse} disabled={!url.trim() || status === "loading"}>
              {status === "loading" ? <ActivityIndicator color={C.white} size="small" /> : <Text style={s.parseBtnText}>분석</Text>}
            </TouchableOpacity>
          </View>

          {status === "error" && (
            <View style={s.errorBox}>
              <Ionicons name="warning-outline" size={16} color={C.red} />
              <Text style={s.errorText}>{errMsg}</Text>
            </View>
          )}

          {status === "success" && result && (
            <View style={s.resultCard}>
              {result.thumbnailUrl && <Image source={{ uri: result.thumbnailUrl }} style={s.thumb} resizeMode="cover" />}
              <View style={s.resultBody}>
                <View style={s.platformBadge}><Text style={s.platformText}>{result.sourcePlatform === "youtube_shorts" ? "YouTube Shorts" : "Instagram Reels"}</Text></View>
                <Text style={s.resultName}>{result.name}</Text>
                {result.description && <Text style={s.resultDesc} numberOfLines={2}>{result.description}</Text>}
                {result.location.region && <Text style={s.resultMeta}>📍 {[result.location.country, result.location.region].filter(Boolean).join(" · ")}</Text>}
                {result.price.description && <Text style={s.resultMeta}>💰 {result.price.description}</Text>}
                {result.hours && <Text style={s.resultMeta}>🕐 {result.hours}</Text>}
                {result.tags.length > 0 && (
                  <View style={s.tagRow}>
                    {result.tags.slice(0, 5).map((t) => (
                      <View key={t} style={s.tag}><Text style={s.tagText}>#{t}</Text></View>
                    ))}
                  </View>
                )}
                <View style={s.actions}>
                  <TouchableOpacity onPress={reset} style={s.resetBtn}><Text style={s.resetText}>다시 입력</Text></TouchableOpacity>
                  <TouchableOpacity style={[s.addBtn, adding && { opacity: 0.6 }]} onPress={handleAdd} disabled={adding}>
                    {adding ? <ActivityIndicator color={C.white} size="small" /> : <Text style={s.addBtnText}>목록에 추가</Text>}
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

const s = StyleSheet.create({
  header:        modalHeader,
  title:         { fontSize: 18, fontWeight: "700", color: C.t1 },
  body:          { padding: sp.xl },
  hint:          { fontSize: 13, color: C.t3, lineHeight: 18 },
  inputRow:      { ...row, gap: sp.sm, marginTop: sp.lg, marginBottom: sp.md },
  urlInput:      input,
  parseBtn:      { backgroundColor: C.t1, borderRadius: radius.md, paddingHorizontal: sp.lg, alignItems: "center", justifyContent: "center", minWidth: 56 },
  parseBtnText:  { color: C.white, fontWeight: "700", fontSize: 13 },
  errorBox:      { ...row, gap: sp.sm, padding: 14, backgroundColor: "#FEF2F2", borderRadius: radius.md, borderWidth: 1, borderColor: "#FECACA" },
  errorText:     { fontSize: 13, color: C.red, flex: 1 },
  resultCard:    { ...card, overflow: "hidden", marginTop: 4 },
  thumb:         { width: "100%", height: 160 },
  resultBody:    { padding: sp.lg },
  platformBadge: { backgroundColor: C.primaryLight, borderRadius: radius.sm, paddingHorizontal: sp.sm, paddingVertical: 3, alignSelf: "flex-start", marginBottom: sp.sm },
  platformText:  { fontSize: 11, color: C.primary, fontWeight: "600" },
  resultName:    { fontSize: 17, fontWeight: "700", color: C.t1, marginBottom: sp.sm - 2, lineHeight: 22 },
  resultDesc:    { fontSize: 13, color: C.t3, lineHeight: 18, marginBottom: sp.sm },
  resultMeta:    { fontSize: 12, color: C.t3, marginBottom: 4 },
  tagRow:        { ...row, flexWrap: "wrap", gap: sp.sm - 2, marginTop: sp.sm },
  tag:           { backgroundColor: C.bg, borderRadius: radius.full, paddingHorizontal: sp.sm + 2, paddingVertical: 4 },
  tagText:       { fontSize: 11, color: C.t3 },
  actions:       { ...row, gap: sp.sm + 2, marginTop: sp.lg },
  resetBtn:      { flex: 1, borderWidth: 1, borderColor: C.borderLight, borderRadius: radius.md, paddingVertical: sp.md, alignItems: "center" },
  resetText:     { fontSize: 13, color: C.t3, fontWeight: "600" },
  addBtn:        { flex: 1, backgroundColor: C.primary, borderRadius: radius.md, paddingVertical: sp.md, alignItems: "center" },
  addBtnText:    { color: C.white, fontSize: 13, fontWeight: "700" },
});

import { useState } from "react";
import { View, Text, TextInput, FlatList, StyleSheet } from "react-native";
import { Button } from "@/components/ui/Button";
import { apiRequest } from "@/lib/api-client";
import { getToken } from "@/lib/auth-store";
import type { RecommendOutput } from "@reel-trip/types";
import { C } from "@/lib/colors";

export function RecommendScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RecommendOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRecommend = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      const res = await apiRequest<RecommendOutput>(
        "/api/recommend",
        { method: "POST", body: JSON.stringify({ query, topK: 5, threshold: 0.5 }) },
        token ?? undefined,
      );
      if (res.success && res.data) {
        setResults(res.data);
      } else {
        setError(res.message);
      }
    } catch {
      setError("요청 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>여행지 추천</Text>
      <TextInput
        style={s.input}
        placeholder="어떤 여행을 원하시나요?"
        placeholderTextColor={C.t4}
        value={query}
        onChangeText={setQuery}
        multiline
      />
      <Button
        label="추천 받기"
        onPress={handleRecommend}
        loading={loading}
        disabled={!query.trim()}
        style={{ marginBottom: 12 }}
      />
      {error ? <Text style={s.error}>{error}</Text> : null}
      {results && (
        <FlatList
          data={results.results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={s.card}>
              <Text style={s.cardTitle}>{item.title}</Text>
              <Text style={s.cardContent} numberOfLines={3}>{item.content}</Text>
              <Text style={s.similarity}>유사도: {(item.similarity * 100).toFixed(1)}%</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: C.bg },
  title: { fontSize: 24, fontWeight: "800", color: C.t1, marginBottom: 16 },
  input: {
    borderWidth: 1, borderColor: C.borderLight, borderRadius: 12,
    padding: 14, marginBottom: 12, minHeight: 80,
    textAlignVertical: "top", backgroundColor: C.white,
    fontSize: 14, color: C.t1,
  },
  error: { fontSize: 13, color: C.red, marginBottom: 12 },
  card: {
    backgroundColor: C.white, borderRadius: 16,
    padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: C.border,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: C.t1, marginBottom: 6 },
  cardContent: { fontSize: 14, color: C.t3, marginBottom: 8 },
  similarity: { fontSize: 12, color: C.t4 },
});

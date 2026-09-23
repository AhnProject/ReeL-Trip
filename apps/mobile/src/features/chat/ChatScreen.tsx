import { useCallback, useEffect, useRef, useState } from "react";
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/auth";
import { useSpaces } from "@/hooks/useSpaces";
import { listMessages, sendMessage } from "@/domains/chat/api";
import type { MessageResponse } from "@/domains/chat/api";
import { C } from "@/lib/colors";
import { row, radius, sp } from "@/lib/styles";

const POLL_INTERVAL_MS = 5000;

function formatTime(sentAt: string): string {
  const date = new Date(sentAt);
  const h = date.getHours();
  const m = date.getMinutes();
  return `${h < 12 ? "오전" : "오후"} ${h % 12 || 12}:${String(m).padStart(2, "0")}`;
}

interface ChatScreenProps {
  spaceId: number;
}

export function ChatScreen({ spaceId }: ChatScreenProps) {
  const token    = useAuthStore((s) => s.token);
  const username = useAuthStore((s) => s.username);
  const spacesQuery = useSpaces();
  const space = spacesQuery.data?.find((sp_) => sp_.id === spaceId);

  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [input, setInput]       = useState("");
  const [sending, setSending]   = useState(false);
  const listRef = useRef<FlatList<MessageResponse>>(null);

  const fetchMessages = useCallback(() => {
    if (!token) return;
    listMessages(spaceId, token).then((res) => {
      if (res.success && res.data) setMessages(res.data);
    }).catch((err) => console.error("[ChatScreen] fetch messages:", err));
  }, [spaceId, token]);

  useEffect(() => {
    fetchMessages();
    const timer = setInterval(fetchMessages, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [fetchMessages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !token || sending) return;
    setSending(true);
    setInput("");
    try {
      const res = await sendMessage(spaceId, text, token);
      if (res.success && res.data) {
        setMessages((prev) => [...prev, res.data!]);
      }
    } catch (err) {
      console.error("[ChatScreen] send message:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={["bottom"]}>
      <View style={s.header}>
        <Text style={{ fontSize: 18 }}>{space?.emoji ?? "✈️"}</Text>
        <View style={{ marginLeft: sp.sm }}>
          <Text style={s.headerName}>{space?.name ?? "팀 채팅"}</Text>
          <Text style={s.headerSub}>팀 채팅</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={listRef}
          style={s.flex}
          data={messages}
          keyExtractor={(m) => String(m.id)}
          contentContainerStyle={{ padding: sp.lg, gap: sp.md }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            const isMine = item.authorUsername === username;
            return (
              <View style={isMine ? s.msgRowMine : s.msgRow}>
                <View style={[s.bubble, isMine ? s.bubbleMine : s.bubbleOther]}>
                  {!isMine && <Text style={s.author}>{item.authorUsername}</Text>}
                  <Text style={isMine ? s.msgTextMine : s.msgText}>{item.content}</Text>
                </View>
                <Text style={[s.time, isMine && { alignSelf: "flex-end" }]}>{formatTime(item.sentAt)}</Text>
              </View>
            );
          }}
        />

        <View style={s.inputBar}>
          <TextInput
            style={s.input}
            value={input}
            onChangeText={setInput}
            placeholder="메시지를 입력하세요..."
            placeholderTextColor={C.t4}
            editable={!sending}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[s.sendBtn, (!input.trim() || sending) && s.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || sending}
          >
            <Ionicons name="send" size={16} color={C.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: C.white },
  flex:       { flex: 1 },
  header:     { ...row, paddingHorizontal: sp.xl, paddingVertical: sp.md, borderBottomWidth: 1, borderBottomColor: C.border },
  headerName: { fontSize: 14, fontWeight: "700", color: C.t1 },
  headerSub:  { fontSize: 11, color: C.t4, marginTop: 1 },
  msgRow:     { alignItems: "flex-start", marginBottom: sp.xs },
  msgRowMine: { alignItems: "flex-end", marginBottom: sp.xs },
  bubble:     { maxWidth: "78%", borderRadius: radius.lg, paddingHorizontal: sp.md, paddingVertical: sp.sm + 2 },
  bubbleOther:{ backgroundColor: C.bg, borderTopLeftRadius: 4 },
  bubbleMine: { backgroundColor: C.primary, borderTopRightRadius: 4 },
  author:     { fontSize: 11, fontWeight: "600", color: C.t3, marginBottom: 2 },
  msgText:    { fontSize: 14, color: C.t1 },
  msgTextMine:{ fontSize: 14, color: C.white },
  time:       { fontSize: 10, color: C.t4, marginTop: 3 },
  inputBar:   { ...row, gap: sp.sm, borderTopWidth: 1, borderTopColor: C.border, paddingHorizontal: sp.lg, paddingVertical: sp.sm + 2 },
  input:      { flex: 1, backgroundColor: C.bg, borderRadius: radius.full, paddingHorizontal: sp.lg, paddingVertical: sp.sm + 2, fontSize: 14, color: C.t1 },
  sendBtn:    { width: 36, height: 36, borderRadius: radius.full, backgroundColor: C.primary, alignItems: "center", justifyContent: "center" },
  sendBtnDisabled: { backgroundColor: C.t4 },
});

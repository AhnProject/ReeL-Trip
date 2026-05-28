import { useCallback, useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, TextInput, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getToken, getUsername } from "@/lib/auth-store";
import { listTeamSpaces } from "@/domains/teamspace/api";
import { listEvents, createEvent, updateEvent } from "@/domains/event/api";
import type { EventResponse } from "@/domains/event/api";
import { C } from "@/lib/colors";

/* ── 유틸 ── */
const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];
const DAY_COLORS = [C.red, C.t3, C.t3, C.t3, C.t3, C.t3, C.primary];
const EVENT_COLORS = ["#4A6CF7","#7C3AED","#DB2777","#DC2626","#D97706","#16A34A","#0891B2","#64748B"];

function padZ(n: number) { return String(n).padStart(2, "0"); }
function toDateStr(y: number, m: number, d: number) { return `${y}-${padZ(m + 1)}-${padZ(d)}`; }
function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function firstDow(y: number, m: number) { return new Date(y, m, 1).getDay(); }
function dateOnly(s: string) { return s.includes("T") ? s.split("T")[0] : s; }

/* ── 일정 생성 모달 ── */
function CreateEventModal({
  visible, spaceId, token, defaultDate, onClose, onCreated,
}: {
  visible: boolean; spaceId: number; token: string;
  defaultDate: string; onClose: () => void; onCreated: (e: EventResponse) => void;
}) {
  const [title, setTitle]   = useState("");
  const [start, setStart]   = useState(defaultDate);
  const [end, setEnd]       = useState(defaultDate);
  const [location, setLocation] = useState("");
  const [price, setPrice]   = useState("");
  const [color, setColor]   = useState("#4A6CF7");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  useEffect(() => { setStart(defaultDate); setEnd(defaultDate); }, [defaultDate]);

  const submit = async () => {
    if (!title.trim()) { setError("제목을 입력해주세요."); return; }
    setLoading(true); setError("");
    try {
      const res = await createEvent({ spaceId, title: title.trim(), startDate: start, endDate: end, location: location || undefined, price: price || undefined, color, status: "pending" }, token);
      if (res.success && res.data) { onCreated(res.data); setTitle(""); setLocation(""); setPrice(""); }
      else setError("생성에 실패했습니다.");
    } catch { setError("서버 오류가 발생했습니다."); }
    finally { setLoading(false); }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        <View style={ms.header}>
          <Text style={ms.headerTitle}>일정 추가</Text>
          <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={C.t2} /></TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={ms.body} keyboardShouldPersistTaps="handled">
          <Text style={ms.label}>제목 *</Text>
          <TextInput style={ms.input} placeholder="예: 성수 재즈 페스티벌" placeholderTextColor={C.t4}
            value={title} onChangeText={setTitle} autoFocus />

          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={ms.label}>시작일</Text>
              <TextInput style={ms.input} placeholder="YYYY-MM-DD" placeholderTextColor={C.t4}
                value={start} onChangeText={setStart} keyboardType="numbers-and-punctuation" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={ms.label}>종료일</Text>
              <TextInput style={ms.input} placeholder="YYYY-MM-DD" placeholderTextColor={C.t4}
                value={end} onChangeText={setEnd} keyboardType="numbers-and-punctuation" />
            </View>
          </View>

          <Text style={ms.label}>장소</Text>
          <TextInput style={ms.input} placeholder="예: 서울 성동구" placeholderTextColor={C.t4}
            value={location} onChangeText={setLocation} />

          <Text style={ms.label}>가격</Text>
          <TextInput style={ms.input} placeholder="예: ₩35,000" placeholderTextColor={C.t4}
            value={price} onChangeText={setPrice} />

          <Text style={ms.label}>색상</Text>
          <View style={ms.colorRow}>
            {EVENT_COLORS.map((c) => (
              <TouchableOpacity key={c} onPress={() => setColor(c)}
                style={[ms.colorBtn, { backgroundColor: c }, color === c && ms.colorBtnActive]} />
            ))}
          </View>

          {error ? <Text style={ms.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[ms.submitBtn, (!title.trim() || loading) && { opacity: 0.5 }]}
            onPress={submit} disabled={loading || !title.trim()}
          >
            {loading ? <ActivityIndicator color={C.white} /> : <Text style={ms.submitText}>추가하기</Text>}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

/* ── 캘린더 화면 ── */
export default function CalendarScreen() {
  const router = useRouter();
  const [token, setToken]   = useState("");
  const [username, setUsername] = useState("");
  const [spaceId, setSpaceId]   = useState<number | null>(null);
  const [rawEvents, setRawEvents] = useState<EventResponse[]>([]);

  const today = new Date();
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(
    toDateStr(today.getFullYear(), today.getMonth(), today.getDate()),
  );
  const [showCreate, setShowCreate] = useState(false);

  const loadEvents = useCallback(async (tok: string, sid: number, y: number, m: number) => {
    const monthStr = `${y}-${padZ(m + 1)}`;
    const res = await listEvents(sid, monthStr, tok).catch(() => null);
    if (res?.success && res.data) setRawEvents(res.data);
  }, []);

  useEffect(() => {
    (async () => {
      const tok  = await getToken();
      const name = await getUsername();
      if (!tok) { router.replace("/auth/login"); return; }
      setToken(tok);
      setUsername(name ?? "");
      const spacesRes = await listTeamSpaces(tok).catch(() => null);
      if (spacesRes?.success && spacesRes.data && spacesRes.data.length > 0) {
        const sid = spacesRes.data[0].id;
        setSpaceId(sid);
        await loadEvents(tok, sid, viewYear, viewMonth);
      }
    })();
  }, []);

  useEffect(() => {
    if (token && spaceId) loadEvents(token, spaceId, viewYear, viewMonth);
  }, [token, spaceId, viewYear, viewMonth, loadEvents]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const eventsOn = (d: string) => rawEvents.filter((e) => dateOnly(e.startDate) === d);
  const selectedEvts = eventsOn(selectedDate);

  const handleToggle = async (evt: EventResponse) => {
    const ns = evt.status === "confirmed" ? "pending" : "confirmed";
    setRawEvents((p) => p.map((e) => (e.id === evt.id ? { ...e, status: ns } : e)));
    await updateEvent(evt.id, { title: evt.title, startDate: evt.startDate, endDate: evt.endDate, location: evt.location ?? undefined, price: evt.price ?? undefined, color: evt.color, status: ns }, token)
      .catch(() => setRawEvents((p) => p.map((e) => (e.id === evt.id ? { ...e, status: evt.status } : e))));
  };

  /* 캘린더 그리드 데이터 */
  const numDays  = daysInMonth(viewYear, viewMonth);
  const startDow = firstDow(viewYear, viewMonth);
  const cells: (number | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: numDays }, (_, i) => i + 1),
  ];

  return (
    <SafeAreaView style={s.safe}>
      {/* 헤더 */}
      <View style={s.topBar}>
        <View style={s.rtBadge}><Text style={s.rtText}>RT</Text></View>
        <Text style={s.screenTitle}>캘린더</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 월 네비게이션 */}
        <View style={s.monthNav}>
          <TouchableOpacity onPress={prevMonth} style={s.navBtn}>
            <Ionicons name="chevron-back" size={20} color={C.t2} />
          </TouchableOpacity>
          <Text style={s.monthLabel}>{viewYear}년 {viewMonth + 1}월</Text>
          <TouchableOpacity onPress={nextMonth} style={s.navBtn}>
            <Ionicons name="chevron-forward" size={20} color={C.t2} />
          </TouchableOpacity>
        </View>

        {/* 캘린더 그리드 */}
        <View style={s.gridCard}>
          {/* 요일 헤더 */}
          <View style={s.dayHeader}>
            {DAY_LABELS.map((d, i) => (
              <View key={d} style={s.dayCell}>
                <Text style={[s.dayLabel, { color: DAY_COLORS[i] }]}>{d}</Text>
              </View>
            ))}
          </View>

          {/* 날짜 셀 */}
          <View style={s.dateGrid}>
            {cells.map((day, idx) => {
              if (day === null) return <View key={`b-${idx}`} style={s.dateCell} />;
              const dateStr = toDateStr(viewYear, viewMonth, day);
              const dow = (startDow + day - 1) % 7;
              const isToday = dateStr === toDateStr(today.getFullYear(), today.getMonth(), today.getDate());
              const isSel   = dateStr === selectedDate;
              const evts    = eventsOn(dateStr);

              return (
                <TouchableOpacity key={day} style={s.dateCell} onPress={() => setSelectedDate(dateStr)}>
                  <View style={[
                    s.dateBubble,
                    isToday && s.dateBubbleToday,
                    isSel && !isToday && s.dateBubbleSel,
                  ]}>
                    <Text style={[
                      s.dateNum,
                      { color: isToday ? C.white : dow === 0 ? C.red : dow === 6 ? C.primary : C.t2 },
                      isSel && !isToday && { color: C.primary },
                    ]}>
                      {day}
                    </Text>
                  </View>
                  {/* 이벤트 dots */}
                  <View style={s.dots}>
                    {evts.slice(0, 3).map((e) => (
                      <View key={e.id} style={[s.dot, { backgroundColor: e.color }]} />
                    ))}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 선택 날짜 이벤트 */}
        <View style={s.evtSection}>
          <Text style={s.evtDateLabel}>
            {new Date(selectedDate).toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" })} · {username}님의 일정
          </Text>

          {selectedEvts.length === 0 ? (
            <View style={s.emptyEvt}>
              <Text style={{ fontSize: 28, marginBottom: 8 }}>📅</Text>
              <Text style={s.emptyEvtText}>일정이 없습니다</Text>
            </View>
          ) : (
            selectedEvts.map((evt) => (
              <View key={evt.id} style={[s.evtCard, { borderLeftColor: evt.color }]}>
                <View style={s.evtInfo}>
                  <Text style={s.evtTitle} numberOfLines={1}>{evt.title}</Text>
                  {(evt.price) && <Text style={s.evtMeta}>{evt.price}</Text>}
                  {evt.location && <Text style={s.evtLoc} numberOfLines={1}>📍 {evt.location}</Text>}
                </View>
                <TouchableOpacity
                  onPress={() => handleToggle(evt)}
                  style={[s.statusBtn, evt.status === "confirmed" ? s.btnConfirmed : s.btnPending]}
                >
                  <Text style={[s.statusTxt, { color: evt.status === "confirmed" ? C.primary : C.t4 }]}>
                    {evt.status === "confirmed" ? "확정" : "대기"}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* + 일정 추가 FAB */}
      <TouchableOpacity
        style={s.fab}
        onPress={() => spaceId ? setShowCreate(true) : null}
      >
        <Ionicons name="add" size={24} color={C.white} />
        <Text style={s.fabText}>일정 추가</Text>
      </TouchableOpacity>

      {showCreate && spaceId && (
        <CreateEventModal
          visible={showCreate}
          spaceId={spaceId}
          token={token}
          defaultDate={selectedDate}
          onClose={() => setShowCreate(false)}
          onCreated={(e) => { setRawEvents((p) => [...p, e]); setShowCreate(false); }}
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
  rtBadge: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: C.primary,
    alignItems: "center", justifyContent: "center",
  },
  rtText: { color: C.white, fontSize: 12, fontWeight: "800" },
  screenTitle: { fontSize: 17, fontWeight: "700", color: C.t1 },

  monthNav: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 16,
  },
  navBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: C.white,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: C.border,
  },
  monthLabel: { fontSize: 18, fontWeight: "700", color: C.t1 },

  gridCard: {
    marginHorizontal: 16, backgroundColor: C.white, borderRadius: 16,
    borderWidth: 1, borderColor: C.border, overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  dayHeader: { flexDirection: "row", backgroundColor: "#FAFBFF", borderBottomWidth: 1, borderBottomColor: C.border },
  dayCell: { flex: 1, alignItems: "center", paddingVertical: 10 },
  dayLabel: { fontSize: 12, fontWeight: "700" },
  dateGrid: { flexDirection: "row", flexWrap: "wrap" },
  dateCell: { width: "14.28%", alignItems: "center", paddingVertical: 8, minHeight: 52 },
  dateBubble: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  dateBubbleToday: { backgroundColor: C.primary },
  dateBubbleSel: { backgroundColor: C.primaryLight },
  dateNum: { fontSize: 13, fontWeight: "600" },
  dots: { flexDirection: "row", gap: 2, marginTop: 2 },
  dot: { width: 4, height: 4, borderRadius: 2 },

  evtSection: { padding: 20 },
  evtDateLabel: { fontSize: 14, fontWeight: "700", color: C.t2, marginBottom: 12 },
  evtCard: {
    backgroundColor: C.white, borderRadius: 14, padding: 14,
    marginBottom: 8, flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderColor: C.border, borderLeftWidth: 4,
  },
  evtInfo: { flex: 1, marginRight: 12 },
  evtTitle: { fontSize: 14, fontWeight: "700", color: C.t1, marginBottom: 2 },
  evtMeta: { fontSize: 12, color: C.t3, marginBottom: 2 },
  evtLoc: { fontSize: 11, color: C.t4 },
  statusBtn: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1 },
  btnConfirmed: { backgroundColor: C.primaryLight, borderColor: C.primary },
  btnPending:   { backgroundColor: C.bg, borderColor: C.borderLight },
  statusTxt: { fontSize: 12, fontWeight: "600" },

  emptyEvt: { alignItems: "center", paddingVertical: 32 },
  emptyEvtText: { fontSize: 13, color: C.t4 },

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

const ms = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: C.t1 },
  body: { padding: 20 },
  label: { fontSize: 12, fontWeight: "600", color: C.t3, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: C.borderLight, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: C.t1,
    backgroundColor: C.white, marginBottom: 16,
  },
  colorRow: { flexDirection: "row", gap: 10, flexWrap: "wrap", marginBottom: 24 },
  colorBtn: { width: 30, height: 30, borderRadius: 15, borderWidth: 3, borderColor: "transparent" },
  colorBtnActive: { borderColor: C.t1 },
  error: { fontSize: 13, color: C.red, marginBottom: 12, textAlign: "center" },
  submitBtn: {
    backgroundColor: C.primary, borderRadius: 999, paddingVertical: 14, alignItems: "center",
  },
  submitText: { color: C.white, fontWeight: "700", fontSize: 15 },
});

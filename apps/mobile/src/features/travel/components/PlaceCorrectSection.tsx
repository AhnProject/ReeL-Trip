import { useState } from "react";
import {
  View, Text, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { updatePlace } from "@/domains/place/api";
import { useAuthStore } from "@/store/auth";
import { toast } from "@/store/toast";
import type { PlaceResponse, PlaceHours } from "@/domains/place/api";
import { C } from "@/lib/colors";
import { card, row, radius, sp } from "@/lib/styles";

interface PlaceCorrectSectionProps {
  place:    PlaceResponse;
  onUpdate: (updated: Partial<PlaceResponse>) => void;
}

type FieldKey = "address" | "priceDesc" | "menu" | "hours" | "hoursStructured";

interface FieldDef {
  key:         FieldKey;
  label:       string;
  icon:        string;
  placeholder: string;
  multiline?:  boolean;
}

const FIELDS: FieldDef[] = [
  { key: "address",   label: "주소",     icon: "location-outline",    placeholder: "정확한 주소를 입력하세요" },
  { key: "priceDesc", label: "가격",     icon: "cash-outline",        placeholder: "예: 런치 15,000원 / 1인 기준" },
  { key: "hours",     label: "운영시간", icon: "time-outline",         placeholder: "예: 월~금 11:00~22:00" },
  { key: "hoursStructured", label: "운영시간 (요일별)", icon: "calendar-outline", placeholder: "" },
  { key: "menu",      label: "메뉴/이용권", icon: "list-outline",      placeholder: "쉼표(,)로 구분해서 입력하세요", multiline: true },
];

const DAYS: { key: PlaceHours["day"]; label: string }[] = [
  { key: "MON", label: "월" },
  { key: "TUE", label: "화" },
  { key: "WED", label: "수" },
  { key: "THU", label: "목" },
  { key: "FRI", label: "금" },
  { key: "SAT", label: "토" },
  { key: "SUN", label: "일" },
];

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

type HoursDraft = Record<PlaceHours["day"], { enabled: boolean; open: string; close: string }>;

function emptyHoursDraft(): HoursDraft {
  return DAYS.reduce((acc, d) => {
    acc[d.key] = { enabled: false, open: "", close: "" };
    return acc;
  }, {} as HoursDraft);
}

function isMissing(place: PlaceResponse, key: FieldKey): boolean {
  if (key === "menu")      return place.menu.length === 0;
  if (key === "priceDesc") return place.priceDesc == null && place.priceMin == null;
  if (key === "hoursStructured") return place.hoursStructured == null || place.hoursStructured.length === 0;
  return (place as any)[key] == null;
}

export function PlaceCorrectSection({ place, onUpdate }: PlaceCorrectSectionProps) {
  const token              = useAuthStore((s) => s.token);
  const missingFields      = FIELDS.filter((f) => isMissing(place, f.key));
  const [expanded, setExpanded] = useState<FieldKey | null>(null);
  const [value,    setValue]    = useState("");
  const [hoursDraft, setHoursDraft] = useState<HoursDraft>(emptyHoursDraft());
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState<FieldKey[]>([]);

  if (missingFields.length === 0) return null;

  const handleOpen = (key: FieldKey) => {
    setExpanded(key);
    setValue("");
    setHoursDraft(emptyHoursDraft());
  };

  const handleCancel = () => {
    setExpanded(null);
    setValue("");
    setHoursDraft(emptyHoursDraft());
  };

  const toggleDay = (day: PlaceHours["day"]) => {
    setHoursDraft((prev) => ({ ...prev, [day]: { ...prev[day], enabled: !prev[day].enabled } }));
  };

  const setDayTime = (day: PlaceHours["day"], field: "open" | "close", text: string) => {
    setHoursDraft((prev) => ({ ...prev, [day]: { ...prev[day], [field]: text } }));
  };

  const hoursEntries: PlaceHours[] = DAYS
    .map((d) => ({ day: d.key, ...hoursDraft[d.key] }))
    .filter((entry) => entry.enabled && TIME_RE.test(entry.open) && TIME_RE.test(entry.close))
    .map(({ day, open, close }) => ({ day, open, close }));

  const handleSave = async (field: FieldDef) => {
    if (!token) return;
    if (field.key === "hoursStructured") {
      if (hoursEntries.length === 0) return;
    } else if (!value.trim()) {
      return;
    }
    setSaving(true);
    try {
      let payload: Record<string, any> = {};
      if (field.key === "menu") {
        payload.menu = value.split(",").map((s) => s.trim()).filter(Boolean);
      } else if (field.key === "hoursStructured") {
        payload.hoursStructured = hoursEntries;
      } else {
        payload[field.key] = value.trim();
      }
      const res = await updatePlace(place.id, payload, token);
      if (!res.success) {
        toast.error("정보 저장에 실패했습니다");
        return;
      }
      onUpdate(payload as Partial<PlaceResponse>);
      setSaved((p) => [...p, field.key]);
      setExpanded(null);
    } catch {
      toast.error("정보 저장에 실패했습니다");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={s.wrap}>
      {/* 헤더 */}
      <View style={s.warningBanner}>
        <Ionicons name="alert-circle" size={16} color="#92400E" />
        <View style={{ marginLeft: 8, flex: 1 }}>
          <Text style={s.warningTitle}>정보 보완이 필요해요</Text>
          <Text style={s.warningDesc}>AI가 추출하지 못한 정보를 직접 입력해 더 정확하게 만들어보세요</Text>
        </View>
      </View>

      {/* 필드 목록 */}
      {missingFields.map((field) => {
        const done  = saved.includes(field.key);
        const open  = expanded === field.key;

        return (
          <View key={field.key} style={[s.fieldWrap, done && s.fieldDone]}>
            {/* 필드 행 */}
            <View style={s.fieldRow}>
              <Ionicons name={field.icon as any} size={15} color={done ? C.green : C.t3} />
              <Text style={[s.fieldLabel, done && s.fieldLabelDone]}>{field.label}</Text>
              <View style={s.missingBadge}>
                <Text style={s.missingText}>{done ? "완료" : "미입력"}</Text>
              </View>

              {!done && (
                <TouchableOpacity
                  style={[s.editBtn, open && s.editBtnActive]}
                  onPress={() => open ? handleCancel() : handleOpen(field.key)}
                >
                  <Ionicons name={open ? "chevron-up" : "pencil-outline"} size={13} color={open ? C.white : C.primary} />
                  <Text style={[s.editBtnText, open && { color: C.white }]}>
                    {open ? "닫기" : "입력"}
                  </Text>
                </TouchableOpacity>
              )}

              {done && <Ionicons name="checkmark-circle" size={18} color={C.green} style={{ marginLeft: "auto" }} />}
            </View>

            {/* 입력 폼 (확장 시) */}
            {open && (
              <View style={s.inputArea}>
                {field.key === "hoursStructured" ? (
                  <View style={{ gap: sp.sm }}>
                    {DAYS.map((d) => {
                      const entry = hoursDraft[d.key];
                      return (
                        <View key={d.key} style={s.dayRow}>
                          <TouchableOpacity
                            style={[s.dayToggle, entry.enabled && s.dayToggleOn]}
                            onPress={() => toggleDay(d.key)}
                          >
                            <Text style={[s.dayToggleText, entry.enabled && s.dayToggleTextOn]}>{d.label}</Text>
                          </TouchableOpacity>
                          {entry.enabled ? (
                            <View style={s.timeRow}>
                              <TextInput
                                style={s.timeInput}
                                placeholder="09:00"
                                placeholderTextColor={C.t4}
                                value={entry.open}
                                onChangeText={(t) => setDayTime(d.key, "open", t)}
                                maxLength={5}
                              />
                              <Text style={s.timeDash}>~</Text>
                              <TextInput
                                style={s.timeInput}
                                placeholder="22:00"
                                placeholderTextColor={C.t4}
                                value={entry.close}
                                onChangeText={(t) => setDayTime(d.key, "close", t)}
                                maxLength={5}
                              />
                            </View>
                          ) : (
                            <Text style={s.dayClosedText}>휴무</Text>
                          )}
                        </View>
                      );
                    })}
                    <Text style={s.hoursHint}>시간은 24시간 형식(HH:MM)으로 입력하세요. 예: 09:00</Text>
                  </View>
                ) : (
                  <TextInput
                    style={[s.input, field.multiline && s.inputMulti]}
                    placeholder={field.placeholder}
                    placeholderTextColor={C.t4}
                    value={value}
                    onChangeText={setValue}
                    multiline={field.multiline}
                    autoFocus
                  />
                )}
                <View style={s.inputBtns}>
                  <TouchableOpacity style={s.cancelBtn} onPress={handleCancel}>
                    <Text style={s.cancelText}>취소</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.saveBtn, !(field.key === "hoursStructured" ? hoursEntries.length > 0 : value.trim()) && s.saveBtnDisabled]}
                    onPress={() => handleSave(field)}
                    disabled={!(field.key === "hoursStructured" ? hoursEntries.length > 0 : value.trim()) || saving}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color={C.white} />
                    ) : (
                      <Text style={s.saveText}>저장</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  wrap:           { marginBottom: 20 },
  warningBanner:  { ...row, backgroundColor: "#FEF3C7", borderRadius: radius.md, padding: sp.md, marginBottom: sp.md, alignItems: "flex-start" },
  warningTitle:   { fontSize: 13, fontWeight: "700", color: "#92400E", marginBottom: 2 },
  warningDesc:    { fontSize: 11, color: "#78350F", lineHeight: 15 },
  fieldWrap:      { ...card, padding: sp.md, marginBottom: sp.sm, borderColor: "#FDE68A" },
  fieldDone:      { borderColor: C.border },
  fieldRow:       { ...row, gap: 8 },
  fieldLabel:     { fontSize: 13, fontWeight: "600", color: C.t2, flex: 1 },
  fieldLabelDone: { color: C.t4 },
  missingBadge:   { backgroundColor: "#FEF3C7", borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 2 },
  missingText:    { fontSize: 10, color: "#92400E", fontWeight: "600" },
  editBtn:        { ...row, gap: 4, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: C.primaryLight, borderWidth: 1, borderColor: C.primary + "33" },
  editBtnActive:  { backgroundColor: C.primary, borderColor: C.primary },
  editBtnText:    { fontSize: 12, fontWeight: "600", color: C.primary },
  inputArea:      { marginTop: sp.md, borderTopWidth: 1, borderTopColor: C.borderLight, paddingTop: sp.md },
  input:          { backgroundColor: C.bg, borderRadius: radius.md, borderWidth: 1, borderColor: C.borderLight, paddingHorizontal: sp.md, paddingVertical: sp.sm + 2, fontSize: 13, color: C.t1, minHeight: 42 },
  inputMulti:     { minHeight: 80, textAlignVertical: "top" },
  inputBtns:      { ...row, gap: sp.sm, marginTop: sp.md, justifyContent: "flex-end" },
  cancelBtn:      { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1, borderColor: C.borderLight },
  cancelText:     { fontSize: 13, color: C.t3 },
  saveBtn:        { paddingHorizontal: 20, paddingVertical: 8, borderRadius: radius.full, backgroundColor: C.primary, minWidth: 60, alignItems: "center" },
  saveBtnDisabled:{ backgroundColor: C.t4 },
  saveText:       { fontSize: 13, fontWeight: "700", color: C.white },
  dayRow:         { ...row, gap: sp.sm },
  dayToggle:      { width: 36, height: 32, borderRadius: radius.sm, borderWidth: 1, borderColor: C.borderLight, alignItems: "center", justifyContent: "center", backgroundColor: C.bg },
  dayToggleOn:    { backgroundColor: C.primary, borderColor: C.primary },
  dayToggleText:  { fontSize: 12, fontWeight: "700", color: C.t3 },
  dayToggleTextOn:{ color: C.white },
  timeRow:        { ...row, gap: 6, flex: 1 },
  timeInput:      { flex: 1, backgroundColor: C.bg, borderRadius: radius.sm, borderWidth: 1, borderColor: C.borderLight, paddingHorizontal: sp.sm, paddingVertical: 6, fontSize: 13, color: C.t1, textAlign: "center" },
  timeDash:       { fontSize: 12, color: C.t4 },
  dayClosedText:  { fontSize: 12, color: C.t4, flex: 1 },
  hoursHint:      { fontSize: 11, color: C.t4, marginTop: 4 },
});

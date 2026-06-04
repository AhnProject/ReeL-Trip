import { useState } from "react";
import {
  View, Text, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { updatePlace } from "@/domains/place/api";
import { useAuthStore } from "@/store/auth";
import type { PlaceResponse } from "@/domains/place/api";
import { C } from "@/lib/colors";
import { card, row, radius, sp } from "@/lib/styles";

interface PlaceCorrectSectionProps {
  place:    PlaceResponse;
  onUpdate: (updated: Partial<PlaceResponse>) => void;
}

type FieldKey = "address" | "priceDesc" | "menu" | "hours";

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
  { key: "menu",      label: "메뉴/이용권", icon: "list-outline",      placeholder: "쉼표(,)로 구분해서 입력하세요", multiline: true },
];

function isMissing(place: PlaceResponse, key: FieldKey): boolean {
  if (key === "menu")      return place.menu.length === 0;
  if (key === "priceDesc") return place.priceDesc == null && place.priceMin == null;
  return (place as any)[key] == null;
}

export function PlaceCorrectSection({ place, onUpdate }: PlaceCorrectSectionProps) {
  const token              = useAuthStore((s) => s.token);
  const missingFields      = FIELDS.filter((f) => isMissing(place, f.key));
  const [expanded, setExpanded] = useState<FieldKey | null>(null);
  const [value,    setValue]    = useState("");
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState<FieldKey[]>([]);

  if (missingFields.length === 0) return null;

  const handleOpen = (key: FieldKey) => {
    setExpanded(key);
    setValue("");
  };

  const handleCancel = () => {
    setExpanded(null);
    setValue("");
  };

  const handleSave = async (field: FieldDef) => {
    if (!value.trim() || !token) return;
    setSaving(true);
    try {
      let payload: Record<string, any> = {};
      if (field.key === "menu") {
        payload.menu = value.split(",").map((s) => s.trim()).filter(Boolean);
      } else {
        payload[field.key] = value.trim();
      }
      await updatePlace(place.id, payload, token);
      onUpdate(payload as Partial<PlaceResponse>);
      setSaved((p) => [...p, field.key]);
      setExpanded(null);
    } catch {
      /* TODO: show error toast */
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
                <TextInput
                  style={[s.input, field.multiline && s.inputMulti]}
                  placeholder={field.placeholder}
                  placeholderTextColor={C.t4}
                  value={value}
                  onChangeText={setValue}
                  multiline={field.multiline}
                  autoFocus
                />
                <View style={s.inputBtns}>
                  <TouchableOpacity style={s.cancelBtn} onPress={handleCancel}>
                    <Text style={s.cancelText}>취소</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.saveBtn, !value.trim() && s.saveBtnDisabled]}
                    onPress={() => handleSave(field)}
                    disabled={!value.trim() || saving}
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
});

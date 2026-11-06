import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { TodoResponse } from "@/domains/todo/api";
import { C } from "@/lib/colors";
import { card, row, radius, sp } from "@/lib/styles";

const PRIORITY_MAP = {
  high:   { label: "높음", color: C.red,    bg: "#FEE2E2" },
  medium: { label: "중간", color: C.orange, bg: "#FEF3C7" },
  low:    { label: "낮음", color: C.green,  bg: C.greenLight },
} as const;

function calcDday(dateStr: string): number {
  const target = new Date(dateStr);
  const today  = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

interface TodoPanelProps {
  todos:    TodoResponse[];
  onAdd:    (title: string) => void;
  onToggle: (todo: TodoResponse) => void;
  onDelete: (id: number) => void;
}

export function TodoPanel({ todos, onAdd, onToggle, onDelete }: TodoPanelProps) {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    const title = inputValue.trim();
    if (!title) return;
    onAdd(title);
    setInputValue("");
  };

  return (
    <View style={s.panel}>
      <View style={s.headerRow}>
        <Text style={s.title}>다음에 해야 할 일</Text>
        {todos.length > 0 && (
          <View style={s.countBadge}>
            <Text style={s.countText}>{todos.length}</Text>
          </View>
        )}
      </View>

      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          value={inputValue}
          onChangeText={setInputValue}
          placeholder="할 일 추가..."
          placeholderTextColor={C.t4}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[s.addBtn, !inputValue.trim() && s.addBtnDisabled]}
          onPress={handleAdd}
          disabled={!inputValue.trim()}
        >
          <Text style={s.addBtnText}>추가</Text>
        </TouchableOpacity>
      </View>

      {todos.length === 0 ? (
        <Text style={s.empty}>할 일이 없습니다</Text>
      ) : (
        <View style={{ gap: sp.md, marginTop: sp.md }}>
          {todos.map((todo) => {
            const p    = PRIORITY_MAP[todo.priority] ?? PRIORITY_MAP.medium;
            const dday = todo.dueDate ? calcDday(todo.dueDate) : null;
            return (
              <View key={todo.id} style={s.item}>
                <TouchableOpacity onPress={() => onToggle(todo)} style={s.checkRow}>
                  <Ionicons
                    name={todo.isDone ? "checkbox" : "square-outline"}
                    size={18}
                    color={todo.isDone ? C.primary : C.t4}
                  />
                  <View style={{ flex: 1, marginLeft: sp.sm }}>
                    <Text style={[s.itemTitle, todo.isDone && s.itemTitleDone]} numberOfLines={1}>
                      {todo.title}
                    </Text>
                    <View style={s.metaRow}>
                      <View style={[s.priorityBadge, { backgroundColor: p.bg }]}>
                        <Text style={[s.priorityText, { color: p.color }]}>우선순위 {p.label}</Text>
                      </View>
                      {dday !== null && (
                        <Text style={s.ddayText}>마감까지 {dday}일</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onDelete(todo.id)} style={s.deleteBtn}>
                  <Ionicons name="close" size={16} color={C.t4} />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  panel:        { ...card, padding: sp.lg },
  headerRow:    { ...row, gap: sp.sm },
  title:        { fontSize: 14, fontWeight: "700", color: C.t1 },
  countBadge:   { backgroundColor: C.primaryLight, borderRadius: radius.full, paddingHorizontal: sp.sm, paddingVertical: 1 },
  countText:    { fontSize: 11, fontWeight: "700", color: C.primary },
  inputRow:     { ...row, gap: sp.sm, marginTop: sp.md },
  input:        { flex: 1, backgroundColor: C.bg, borderRadius: radius.md, paddingHorizontal: sp.md, paddingVertical: sp.sm, fontSize: 13, color: C.t1 },
  addBtn:       { backgroundColor: C.primary, borderRadius: radius.md, paddingHorizontal: sp.md, paddingVertical: sp.sm, alignItems: "center", justifyContent: "center" },
  addBtnDisabled: { backgroundColor: C.t4 },
  addBtnText:   { fontSize: 12, fontWeight: "700", color: C.white },
  empty:        { textAlign: "center", fontSize: 12, color: C.t4, paddingVertical: sp.lg },
  item:         { ...row, alignItems: "flex-start", justifyContent: "space-between" },
  checkRow:     { ...row, alignItems: "flex-start", flex: 1 },
  itemTitle:    { fontSize: 14, color: C.t2 },
  itemTitleDone:{ color: C.t4, textDecorationLine: "line-through" },
  metaRow:      { ...row, gap: sp.sm, marginTop: 4 },
  priorityBadge:{ borderRadius: radius.full, paddingHorizontal: sp.sm, paddingVertical: 1 },
  priorityText: { fontSize: 11, fontWeight: "600" },
  ddayText:     { fontSize: 11, color: C.t4 },
  deleteBtn:    { padding: 4, marginLeft: sp.sm },
});

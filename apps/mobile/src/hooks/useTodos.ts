import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
import { listTodos, createTodo, updateTodo, deleteTodo } from "@/domains/todo/api";
import type { TodoResponse, CreateTodoPayload } from "@/domains/todo/api";
import { toast } from "@/store/toast";

export function useTodos(spaceId: number | null | undefined) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["todos", spaceId],
    queryFn:  () => listTodos(spaceId!, token!).then((r) => r.data ?? []),
    enabled:  !!token && !!spaceId,
    staleTime: 30_000,
  });
}

export function useCreateTodo(spaceId: number | null | undefined) {
  const token = useAuthStore((s) => s.token);
  const qc    = useQueryClient();
  const key   = ["todos", spaceId];

  return async (title: string) => {
    if (!spaceId || !token) return;
    const payload: CreateTodoPayload = { spaceId, title, priority: "medium" };
    try {
      const res = await createTodo(payload, token);
      if (res.success && res.data) {
        qc.setQueryData<TodoResponse[]>(key, (old) => [...(old ?? []), res.data!]);
      }
    } catch {
      toast.error("할 일 추가에 실패했습니다");
    }
  };
}

/** 낙관적 업데이트 포함 완료 토글 */
export function useToggleTodo(spaceId: number | null | undefined) {
  const token = useAuthStore((s) => s.token);
  const qc    = useQueryClient();
  const key   = ["todos", spaceId];

  return async (todo: TodoResponse) => {
    const nextIsDone = !todo.isDone;

    qc.setQueryData<TodoResponse[]>(key, (old) =>
      old?.map((t) => t.id === todo.id ? { ...t, isDone: nextIsDone } : t) ?? [],
    );

    try {
      await updateTodo(todo.id, { title: todo.title, priority: todo.priority, dueDate: todo.dueDate, isDone: nextIsDone }, token!);
    } catch {
      qc.setQueryData<TodoResponse[]>(key, (old) =>
        old?.map((t) => t.id === todo.id ? { ...t, isDone: todo.isDone } : t) ?? [],
      );
      toast.error("할 일 상태 변경에 실패했습니다");
    }
  };
}

export function useDeleteTodo(spaceId: number | null | undefined) {
  const token = useAuthStore((s) => s.token);
  const qc    = useQueryClient();
  const key   = ["todos", spaceId];

  return async (id: number) => {
    if (!token) return;
    try {
      await deleteTodo(id, token);
      qc.setQueryData<TodoResponse[]>(key, (old) => old?.filter((t) => t.id !== id) ?? []);
    } catch {
      toast.error("할 일 삭제에 실패했습니다");
    }
  };
}

import { apiRequest } from "@/lib/api-client";

export interface TodoResponse {
  id: number;
  spaceId: number;
  title: string;
  priority: "high" | "medium" | "low";
  dueDate: string | null;
  isDone: boolean;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoPayload {
  spaceId: number;
  title: string;
  priority?: "high" | "medium" | "low";
  dueDate?: string;
}

export interface UpdateTodoPayload {
  title: string;
  priority?: "high" | "medium" | "low";
  dueDate?: string | null;
  isDone?: boolean;
}

export function listTodos(spaceId: number, token: string) {
  return apiRequest<TodoResponse[]>(`/api/todos?spaceId=${spaceId}`, {}, token);
}

export function createTodo(payload: CreateTodoPayload, token: string) {
  return apiRequest<TodoResponse>("/api/todos", {
    method: "POST",
    body: JSON.stringify(payload),
  }, token);
}

export function updateTodo(id: number, payload: UpdateTodoPayload, token: string) {
  return apiRequest<TodoResponse>(`/api/todos/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }, token);
}

export function deleteTodo(id: number, token: string) {
  return apiRequest<void>(`/api/todos/${id}`, { method: "DELETE" }, token);
}

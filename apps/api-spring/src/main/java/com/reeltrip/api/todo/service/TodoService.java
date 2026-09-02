package com.reeltrip.api.todo.service;

import com.reeltrip.api.todo.dto.CreateTodoRequest;
import com.reeltrip.api.todo.dto.TodoResponse;
import com.reeltrip.api.todo.dto.UpdateTodoRequest;

import java.util.List;

public interface TodoService {
    TodoResponse create(CreateTodoRequest request, String username);
    List<TodoResponse> findBySpace(Long spaceId, String username);
    TodoResponse update(Long id, UpdateTodoRequest request, String username);
    void delete(Long id, String username);
}

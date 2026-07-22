package com.reeltrip.api.todo.service;

import com.reeltrip.api.auth.mapper.UserMapper;
import com.reeltrip.api.auth.model.User;
import com.reeltrip.api.common.exception.AppException;
import com.reeltrip.api.common.exception.ErrorCode;
import com.reeltrip.api.teamspace.mapper.TeamSpaceMapper;
import com.reeltrip.api.todo.dto.CreateTodoRequest;
import com.reeltrip.api.todo.dto.TodoResponse;
import com.reeltrip.api.todo.dto.UpdateTodoRequest;
import com.reeltrip.api.todo.mapper.TodoMapper;
import com.reeltrip.api.todo.model.Todo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TodoServiceImpl implements TodoService {

    private final TodoMapper todoMapper;
    private final TeamSpaceMapper teamSpaceMapper;
    private final UserMapper userMapper;

    @Override
    public TodoResponse create(CreateTodoRequest request, String username) {
        User user = getUser(username);
        checkSpaceMember(request.getSpaceId(), user.getId());

        Todo todo = Todo.builder()
                .spaceId(request.getSpaceId())
                .title(request.getTitle())
                .priority(request.getPriority() != null ? request.getPriority() : "medium")
                .dueDate(request.getDueDate())
                .isDone(false)
                .createdBy(user.getId())
                .build();

        todoMapper.insert(todo);
        return toResponse(todoMapper.findById(todo.getId())
                .orElseThrow(() -> new AppException(ErrorCode.TODO_NOT_FOUND)));
    }

    @Override
    public List<TodoResponse> findBySpace(Long spaceId, String username) {
        User user = getUser(username);
        checkSpaceMember(spaceId, user.getId());
        return todoMapper.findBySpaceId(spaceId).stream().map(this::toResponse).toList();
    }

    @Override
    public TodoResponse update(Long id, UpdateTodoRequest request, String username) {
        User user = getUser(username);
        Todo todo = getTodo(id);
        checkSpaceMember(todo.getSpaceId(), user.getId());

        todo.setTitle(request.getTitle());
        if (request.getPriority() != null) todo.setPriority(request.getPriority());
        todo.setDueDate(request.getDueDate());
        if (request.getIsDone() != null) todo.setIsDone(request.getIsDone());

        todoMapper.update(todo);
        return toResponse(todoMapper.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TODO_NOT_FOUND)));
    }

    @Override
    public void delete(Long id, String username) {
        User user = getUser(username);
        Todo todo = getTodo(id);
        checkSpaceMember(todo.getSpaceId(), user.getId());
        if (todoMapper.delete(id) == 0) {
            throw new AppException(ErrorCode.TODO_NOT_FOUND);
        }
    }

    /* ── private helpers ── */

    private User getUser(String username) {
        return userMapper.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    private Todo getTodo(Long id) {
        return todoMapper.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TODO_NOT_FOUND));
    }

    private void checkSpaceMember(Long spaceId, Long userId) {
        if (!teamSpaceMapper.existsMember(spaceId, userId)) {
            throw new AppException(ErrorCode.TODO_ACCESS_DENIED);
        }
    }

    private TodoResponse toResponse(Todo t) {
        return TodoResponse.builder()
                .id(t.getId())
                .spaceId(t.getSpaceId())
                .title(t.getTitle())
                .priority(t.getPriority())
                .dueDate(t.getDueDate())
                .isDone(t.getIsDone())
                .createdBy(t.getCreatedBy())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }
}

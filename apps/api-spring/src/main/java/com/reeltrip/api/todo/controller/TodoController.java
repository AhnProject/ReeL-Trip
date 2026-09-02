package com.reeltrip.api.todo.controller;

import com.reeltrip.api.common.response.ApiResponse;
import com.reeltrip.api.todo.dto.CreateTodoRequest;
import com.reeltrip.api.todo.dto.TodoResponse;
import com.reeltrip.api.todo.dto.UpdateTodoRequest;
import com.reeltrip.api.todo.service.TodoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@Tag(name = "Todos", description = "팀스페이스 할 일 관리")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/todos")
@RequiredArgsConstructor
public class TodoController {

    private final TodoService todoService;

    @Operation(summary = "할 일 생성")
    @PostMapping
    public ResponseEntity<ApiResponse<TodoResponse>> create(
            @Valid @RequestBody CreateTodoRequest request,
            Principal principal) {
        return ResponseEntity.ok(ApiResponse.success(todoService.create(request, principal.getName())));
    }

    @Operation(summary = "스페이스 할 일 목록 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<List<TodoResponse>>> findBySpace(
            @RequestParam Long spaceId,
            Principal principal) {
        return ResponseEntity.ok(ApiResponse.success(todoService.findBySpace(spaceId, principal.getName())));
    }

    @Operation(summary = "할 일 수정")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TodoResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTodoRequest request,
            Principal principal) {
        return ResponseEntity.ok(ApiResponse.success(todoService.update(id, request, principal.getName())));
    }

    @Operation(summary = "할 일 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            Principal principal) {
        todoService.delete(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

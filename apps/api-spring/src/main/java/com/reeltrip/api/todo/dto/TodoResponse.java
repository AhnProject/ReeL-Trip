package com.reeltrip.api.todo.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class TodoResponse {
    private Long id;
    private Long spaceId;
    private String title;
    private String priority;
    private LocalDate dueDate;
    private Boolean isDone;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

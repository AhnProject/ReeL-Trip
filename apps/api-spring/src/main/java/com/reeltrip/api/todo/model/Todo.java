package com.reeltrip.api.todo.model;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Todo {
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

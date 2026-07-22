package com.reeltrip.api.todo.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class UpdateTodoRequest {

    @NotBlank
    private String title;

    private String priority;

    private LocalDate dueDate;

    private Boolean isDone;
}

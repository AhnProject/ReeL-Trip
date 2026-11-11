package com.reeltrip.api.todo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class UpdateTodoRequest {

    @NotBlank
    @Size(max = 255)
    private String title;

    private String priority;

    private LocalDate dueDate;

    private Boolean isDone;
}

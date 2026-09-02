package com.reeltrip.api.todo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class CreateTodoRequest {

    @NotNull
    private Long spaceId;

    @NotBlank
    private String title;

    private String priority = "medium";

    private LocalDate dueDate;
}

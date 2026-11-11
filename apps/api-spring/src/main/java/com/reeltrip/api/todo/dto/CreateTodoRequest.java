package com.reeltrip.api.todo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class CreateTodoRequest {

    @NotNull
    private Long spaceId;

    @NotBlank
    @Size(max = 255)
    private String title;

    private String priority = "medium";

    private LocalDate dueDate;
}

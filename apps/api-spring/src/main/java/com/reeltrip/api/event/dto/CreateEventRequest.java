package com.reeltrip.api.event.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CreateEventRequest {

    @NotNull
    private Long spaceId;

    @NotBlank
    @Size(max = 255)
    private String title;

    private String description;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    @Size(max = 255)
    private String location;

    @Size(max = 100)
    private String price;

    @Size(max = 7)
    private String color;

    private String status;
}

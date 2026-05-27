package com.reeltrip.api.document.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class SearchDocumentRequest {

    @NotNull
    private List<Double> embedding;

    @Min(1)
    @Max(20)
    private Integer limit = 10;

    @DecimalMin("0.0")
    @DecimalMax("1.0")
    private Double threshold;
}

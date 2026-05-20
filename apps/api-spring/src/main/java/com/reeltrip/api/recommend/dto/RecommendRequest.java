package com.reeltrip.api.recommend.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RecommendRequest {

    @NotBlank
    @Size(min = 1, max = 500)
    private String query;

    @Min(1)
    @Max(20)
    private Integer topK = 5;

    @DecimalMin("0.0")
    @DecimalMax("1.0")
    private Double threshold = 0.5;
}

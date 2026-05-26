package com.reeltrip.api.place.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class AddPlaceRequest {

    @NotNull
    private Long spaceId;

    @NotBlank
    @Size(max = 255)
    private String name;

    @Size(max = 50)
    private String category;

    private String address;
    private String region;
    private String country;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String priceDesc;
    private BigDecimal priceMin;
    private BigDecimal priceMax;

    @Size(max = 3)
    private String currency;

    private String hours;
    private String thumbnailUrl;
    private String sourceUrl;
    private String sourcePlatform;
    private List<String> tags;
    private List<String> menu;
    private String confidence;
}

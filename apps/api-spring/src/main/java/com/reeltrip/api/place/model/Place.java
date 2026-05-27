package com.reeltrip.api.place.model;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Place {
    private Long id;
    private Long spaceId;
    private String name;
    private String category;
    private String address;
    private String region;
    private String country;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String priceDesc;
    private BigDecimal priceMin;
    private BigDecimal priceMax;
    private String currency;
    private String hours;
    private String thumbnailUrl;
    private String sourceUrl;
    private String sourcePlatform;
    private List<String> tags;
    private List<String> menu;
    private String confidence;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

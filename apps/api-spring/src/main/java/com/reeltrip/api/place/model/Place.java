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
    private List<PlaceHours> hoursStructured;
    private String thumbnailUrl;
    private String sourceUrl;
    private String sourcePlatform;
    private List<String> tags;
    private List<String> menu;
    private String confidence;
    private Long createdBy;

    @Builder.Default
    private boolean consentGiven = false;
    private LocalDateTime consentAt;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /** 지오코딩(Nominatim) 조회용 주소 문자열 — PlaceServiceImpl/배치 양쪽에서 재사용 */
    public String toAddressQuery() {
        StringBuilder sb = new StringBuilder();
        if (address != null) sb.append(address).append(" ");
        if (region != null) sb.append(region).append(" ");
        if (country != null) sb.append(country);
        return sb.toString().trim();
    }
}

package com.reeltrip.api.geocoding.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class GeocodeResult {
    private final BigDecimal latitude;
    private final BigDecimal longitude;
}

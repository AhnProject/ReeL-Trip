package com.reeltrip.api.geocoding.service;

import com.reeltrip.api.geocoding.dto.GeocodeResult;

import java.util.Optional;

public interface GeocodingService {
    /** 주소 문자열로 좌표를 조회합니다. 실패하거나 결과가 없으면 Optional.empty(). */
    Optional<GeocodeResult> geocode(String query);
}

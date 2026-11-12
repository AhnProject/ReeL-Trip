package com.reeltrip.api.geocoding.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.reeltrip.api.geocoding.dto.GeocodeResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.Optional;

/**
 * OSM Nominatim(https://nominatim.openstreetmap.org) 지오코딩 — 주소 문자열을 위경도로 변환.
 * 공식 Usage Policy(https://operations.osmfoundation.org/policies/nominatim/) 준수:
 *  - 표준 사용 시 최대 초당 1회 요청(이 클래스가 호출자 구분 없이 전역으로 강제)
 *  - User-Agent에 애플리케이션을 식별할 수 있는 정보 포함(필수, 기본 라이브러리 UA는 불충분)
 *  - 결과를 캐싱해야 함(이 서비스의 호출자인 PlaceServiceImpl이 좌표를 DB 컬럼에 저장하는 것 자체가 캐싱 역할을 함)
 * 대량/배치 호출(A4의 소급 지오코딩)은 이 클래스가 보장하는 초당 1회보다 더 느리게(정책상 분당
 * 4회 권장) 호출자 쪽에서 추가로 간격을 둬야 함 — 이 클래스는 최소한의 안전장치만 제공.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GeocodingServiceImpl implements GeocodingService {

    private final ObjectMapper objectMapper;

    @Value("${api.base-url:http://localhost:4000}")
    private String apiBaseUrl;

    private static final long MIN_INTERVAL_MS = 1000;
    private static final Object RATE_LIMIT_LOCK = new Object();
    private static volatile long lastRequestAtMs = 0;

    @Override
    public Optional<GeocodeResult> geocode(String query) {
        if (query == null || query.isBlank()) {
            return Optional.empty();
        }

        waitForRateLimit();

        try {
            String response = RestClient.builder()
                    .baseUrl("https://nominatim.openstreetmap.org")
                    .defaultHeader(HttpHeaders.USER_AGENT, "ReeL-Trip/1.0 (+" + apiBaseUrl + ")")
                    .build()
                    .get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/search")
                            .queryParam("q", query)
                            .queryParam("format", "json")
                            .queryParam("limit", "1")
                            .build())
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(response);
            if (!root.isArray() || root.isEmpty()) {
                return Optional.empty();
            }

            JsonNode first = root.get(0);
            BigDecimal latitude = new BigDecimal(first.path("lat").asText());
            BigDecimal longitude = new BigDecimal(first.path("lon").asText());
            return Optional.of(new GeocodeResult(latitude, longitude));
        } catch (Exception e) {
            log.warn("Nominatim geocoding failed for query '{}': {}", query, e.getMessage());
            return Optional.empty();
        }
    }

    /** 전역(모든 호출자 공유) 초당 1회 제한 — Nominatim 정책의 최소 하한선을 강제 */
    private void waitForRateLimit() {
        synchronized (RATE_LIMIT_LOCK) {
            long now = System.currentTimeMillis();
            long waitMs = MIN_INTERVAL_MS - (now - lastRequestAtMs);
            if (waitMs > 0) {
                try {
                    Thread.sleep(waitMs);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
            lastRequestAtMs = System.currentTimeMillis();
        }
    }
}

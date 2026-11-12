package com.reeltrip.api.geocoding;

import com.reeltrip.api.geocoding.service.GeocodingService;
import com.reeltrip.api.place.mapper.PlaceMapper;
import com.reeltrip.api.place.model.Place;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 기존에 저장된 장소(좌표 없음) 전체에 대한 일회성 소급 지오코딩 배치.
 *
 * 평소엔 아무 동작도 하지 않음(app.backfill-geocoding-on-startup 기본값 false) —
 * 운영자가 배포 시 환경변수 BACKFILL_GEOCODING_ON_STARTUP=true로 한 번 켜고
 * 재배포한 뒤, 완료되면 다시 false로 되돌려 다음 재시작부터는 반복 실행되지
 * 않게 하는 방식. REST 엔드포인트로 노출하지 않음 — 일반 사용자가 트리거할
 * 수 있는 기능이 아니라 운영자가 배포 주기에 맞춰 한 번 돌리는 운영 작업이라,
 * 인증만 거치면 누구나 호출 가능한 API보다 이 방식이 더 안전함.
 *
 * Nominatim 공식 Usage Policy상 "지속적인 대량 호출"은 분당 4회 권장 —
 * GeocodingService 자체가 강제하는 초당 1회보다 더 느리게, 호출 사이에
 * 15초를 추가로 둠(분당 4회 = 15초 간격).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class GeocodingBackfillRunner implements CommandLineRunner {

    private final PlaceMapper placeMapper;
    private final GeocodingService geocodingService;

    @Value("${app.backfill-geocoding-on-startup:false}")
    private boolean enabled;

    /** Nominatim 정책의 "지속적인 대량 호출" 권장 간격(분당 4회 = 기본 15초) */
    @Value("${app.backfill-geocoding-interval-ms:15000}")
    private long bulkIntervalMs;

    @Override
    public void run(String... args) {
        if (!enabled) {
            return;
        }

        List<Place> targets = placeMapper.findWithoutCoordinates();
        log.info("[GeocodingBackfill] 좌표 없는 장소 {}건 소급 지오코딩 시작", targets.size());

        int success = 0;
        int failed = 0;
        for (int i = 0; i < targets.size(); i++) {
            Place place = targets.get(i);
            if (i > 0) {
                sleep(bulkIntervalMs);
            }

            String query = place.toAddressQuery();
            if (query.isBlank()) {
                continue;
            }

            try {
                var result = geocodingService.geocode(query);
                if (result.isPresent()) {
                    placeMapper.updateCoordinates(place.getId(), result.get().getLatitude(), result.get().getLongitude());
                    success++;
                } else {
                    failed++;
                }
            } catch (Exception e) {
                failed++;
                log.warn("[GeocodingBackfill] place {} 지오코딩 실패: {}", place.getId(), e.getMessage());
            }

            if ((i + 1) % 10 == 0) {
                log.info("[GeocodingBackfill] 진행 {}/{} (성공 {}, 실패 {})", i + 1, targets.size(), success, failed);
            }
        }

        log.info("[GeocodingBackfill] 완료 — 전체 {}건 중 성공 {}, 실패 {}", targets.size(), success, failed);
    }

    private void sleep(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}

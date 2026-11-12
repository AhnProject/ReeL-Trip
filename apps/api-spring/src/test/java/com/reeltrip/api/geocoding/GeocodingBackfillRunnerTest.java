package com.reeltrip.api.geocoding;

import com.reeltrip.api.geocoding.dto.GeocodeResult;
import com.reeltrip.api.geocoding.service.GeocodingService;
import com.reeltrip.api.place.mapper.PlaceMapper;
import com.reeltrip.api.place.model.Place;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GeocodingBackfillRunnerTest {

    @Mock private PlaceMapper placeMapper;
    @Mock private GeocodingService geocodingService;

    private GeocodingBackfillRunner runner;

    @BeforeEach
    void setUp() {
        runner = new GeocodingBackfillRunner(placeMapper, geocodingService);
        ReflectionTestUtils.setField(runner, "bulkIntervalMs", 0L); // 테스트에서는 간격 대기 생략
    }

    @Test
    void disabledByDefault_doesNothing() throws Exception {
        ReflectionTestUtils.setField(runner, "enabled", false);

        runner.run();

        verify(placeMapper, never()).findWithoutCoordinates();
    }

    @Test
    void enabled_geocodesEachTargetAndUpdatesCoordinates() throws Exception {
        ReflectionTestUtils.setField(runner, "enabled", true);

        Place p1 = Place.builder().id(1L).address("서울 성동구").build();
        Place p2 = Place.builder().id(2L).address("부산 해운대구").build();
        when(placeMapper.findWithoutCoordinates()).thenReturn(List.of(p1, p2));
        when(geocodingService.geocode(any()))
                .thenReturn(Optional.of(new GeocodeResult(new BigDecimal("37.5"), new BigDecimal("127.0"))))
                .thenReturn(Optional.empty());

        runner.run();

        verify(placeMapper).updateCoordinates(eq(1L), any(BigDecimal.class), any(BigDecimal.class));
        verify(placeMapper, never()).updateCoordinates(eq(2L), any(), any());
    }

    @Test
    void enabled_skipsPlacesWithBlankAddressQuery() throws Exception {
        ReflectionTestUtils.setField(runner, "enabled", true);

        Place noAddress = Place.builder().id(5L).build(); // address/region/country 전부 null
        when(placeMapper.findWithoutCoordinates()).thenReturn(List.of(noAddress));

        runner.run();

        verify(geocodingService, never()).geocode(any());
        verify(placeMapper, never()).updateCoordinates(anyLong(), any(), any());
    }
}

package com.reeltrip.api.event.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Builder
public class EventResponse {
    private Long id;
    private Long spaceId;
    private String title;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long placeId;
    private LocalTime startTime;
    private LocalTime endTime;
    /** placeId가 있을 때만 채워짐 — 운영시간 비활성화 로직(C5)이 hoursStructured 참조 */
    private EventPlaceSummary place;
    private String location;
    private String price;
    private String color;
    private String status;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

package com.reeltrip.api.event.dto;

import com.reeltrip.api.place.model.PlaceHours;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

/** 일정에 연결된 장소의 요약 정보 — 운영시간 비활성화 로직(C5)이 hoursStructured를 사용 */
@Getter
@Builder
public class EventPlaceSummary {
    private Long id;
    private String name;
    private String hours;
    private List<PlaceHours> hoursStructured;
}

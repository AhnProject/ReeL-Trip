package com.reeltrip.api.place.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 요일 하나의 영업시간 — day는 MON~SUN, open/close는 "HH:mm"(24시간) */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PlaceHours {
    private String day;
    private String open;
    private String close;
}

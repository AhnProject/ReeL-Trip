package com.reeltrip.api.urlparser.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class RawCollectedContent {

    private String title;
    private String caption;
    private String transcript;
    private List<String> hashtags;
    private String locationName;
    private String thumbnailUrl;
}

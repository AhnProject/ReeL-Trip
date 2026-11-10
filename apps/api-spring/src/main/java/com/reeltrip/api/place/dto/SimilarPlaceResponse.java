package com.reeltrip.api.place.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class SimilarPlaceResponse {

    private Long id;
    private String name;
    private String category;
    private String region;
    private String thumbnailUrl;
    private List<String> tags;

    /** pgvector cosine 유사도 (0~1, 소수점 4자리) */
    private Double matchScore;
}

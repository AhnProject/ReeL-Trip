package com.reeltrip.api.recommend.dto;

import com.reeltrip.api.document.dto.DocumentResponse;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class RecommendResponse {

    private String originalQuery;
    private String refinedQuery;
    private List<String> keywords;
    private List<DocumentResponse> results;
    private int totalCount;
}

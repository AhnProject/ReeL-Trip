package com.reeltrip.api.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class ParsedQueryResult {

    private String originalText;
    private List<String> keywords;
    private String refinedQuery;
    private List<Double> embedding;
}

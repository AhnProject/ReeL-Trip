package com.reeltrip.api.ai.service;

import com.reeltrip.api.ai.dto.ParsedQueryResult;

import java.util.List;
import java.util.Map;

public interface AiService {

    /** 텍스트에서 OpenAI text-embedding-3-small 임베딩 벡터를 생성합니다. */
    List<Double> createEmbedding(String text);

    /** 사용자 쿼리를 파싱하고 키워드·정제된 쿼리·임베딩을 반환합니다. */
    ParsedQueryResult parseAndEmbed(String userInput);

    /** 소셜 미디어 raw 컨텐츠에서 여행 정보를 추출합니다 (Claude API). */
    Map<String, Object> extractTravelInfo(Map<String, Object> rawContent);
}

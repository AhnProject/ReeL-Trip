package com.reeltrip.api.recommend.service;

import com.reeltrip.api.ai.dto.ParsedQueryResult;
import com.reeltrip.api.ai.service.AiService;
import com.reeltrip.api.document.dto.DocumentResponse;
import com.reeltrip.api.document.mapper.DocumentMapper;
import com.reeltrip.api.document.service.DocumentService;
import com.reeltrip.api.recommend.dto.RecommendRequest;
import com.reeltrip.api.recommend.dto.RecommendResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendServiceImpl implements RecommendService {

    private final AiService aiService;
    private final DocumentMapper documentMapper;

    @Override
    public RecommendResponse recommend(RecommendRequest request) {
        ParsedQueryResult parsed = aiService.parseAndEmbed(request.getQuery());

        int topK = request.getTopK() != null ? request.getTopK() : 5;
        Double threshold = request.getThreshold();

        String embeddingStr = "[" + parsed.getEmbedding().stream()
                .map(Object::toString)
                .collect(Collectors.joining(",")) + "]";

        List<DocumentResponse> results = threshold != null
                ? documentMapper.searchByVectorWithThreshold(embeddingStr, topK, threshold)
                : documentMapper.searchByVector(embeddingStr, topK);

        return RecommendResponse.builder()
                .originalQuery(request.getQuery())
                .refinedQuery(parsed.getRefinedQuery())
                .keywords(parsed.getKeywords())
                .results(results)
                .totalCount(results.size())
                .build();
    }
}

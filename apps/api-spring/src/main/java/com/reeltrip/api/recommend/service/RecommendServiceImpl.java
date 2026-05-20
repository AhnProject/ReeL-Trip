package com.reeltrip.api.recommend.service;

import com.reeltrip.api.ai.dto.ParsedQueryResult;
import com.reeltrip.api.ai.service.AiService;
import com.reeltrip.api.document.dto.DocumentResponse;
import com.reeltrip.api.document.repository.DocumentRepository;
import com.reeltrip.api.recommend.dto.RecommendRequest;
import com.reeltrip.api.recommend.dto.RecommendResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecommendServiceImpl implements RecommendService {

    private final AiService aiService;
    private final DocumentRepository documentRepository;

    @Override
    public RecommendResponse recommend(RecommendRequest request) {
        ParsedQueryResult parsed = aiService.parseAndEmbed(request.getQuery());

        int topK = request.getTopK() != null ? request.getTopK() : 5;
        Double threshold = request.getThreshold();

        List<DocumentResponse> results = documentRepository.searchByVector(
                parsed.getEmbedding(), topK, threshold);

        return RecommendResponse.builder()
                .originalQuery(request.getQuery())
                .refinedQuery(parsed.getRefinedQuery())
                .keywords(parsed.getKeywords())
                .results(results)
                .totalCount(results.size())
                .build();
    }
}

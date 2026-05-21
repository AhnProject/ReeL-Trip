package com.reeltrip.api.recommend.controller;

import com.reeltrip.api.common.response.ApiResponse;
import com.reeltrip.api.recommend.dto.RecommendRequest;
import com.reeltrip.api.recommend.dto.RecommendResponse;
import com.reeltrip.api.recommend.service.RecommendService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Tag(name = "Recommend", description = "AI 기반 여행지 추천")
@RestController
@RequestMapping("/recommend")
@RequiredArgsConstructor
public class RecommendController {

    private final RecommendService recommendService;

    @Operation(summary = "헬스 체크")
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, String>>> health() {
        return ResponseEntity.ok(ApiResponse.success(Map.of("status", "ok")));
    }

    @Operation(summary = "여행지 추천", description = "자연어 쿼리를 분석해 관련 여행지를 벡터 유사도 기반으로 추천합니다")
    @PostMapping
    public ResponseEntity<ApiResponse<RecommendResponse>> recommend(
            @Valid @RequestBody RecommendRequest request) {
        return ResponseEntity.ok(ApiResponse.success(recommendService.recommend(request)));
    }
}

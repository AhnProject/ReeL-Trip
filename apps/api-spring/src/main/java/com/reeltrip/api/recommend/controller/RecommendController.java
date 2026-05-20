package com.reeltrip.api.recommend.controller;

import com.reeltrip.api.common.response.ApiResponse;
import com.reeltrip.api.recommend.dto.RecommendRequest;
import com.reeltrip.api.recommend.dto.RecommendResponse;
import com.reeltrip.api.recommend.service.RecommendService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/recommend")
@RequiredArgsConstructor
public class RecommendController {

    private final RecommendService recommendService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, String>>> health() {
        return ResponseEntity.ok(ApiResponse.success(Map.of("status", "ok")));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RecommendResponse>> recommend(
            @Valid @RequestBody RecommendRequest request) {
        return ResponseEntity.ok(ApiResponse.success(recommendService.recommend(request)));
    }
}

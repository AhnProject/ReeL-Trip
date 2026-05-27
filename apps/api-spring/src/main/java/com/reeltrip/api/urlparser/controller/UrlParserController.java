
package com.reeltrip.api.urlparser.controller;

import com.reeltrip.api.common.response.ApiResponse;
import com.reeltrip.api.urlparser.dto.ParseUrlRequest;
import com.reeltrip.api.urlparser.service.UrlParserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Tag(name = "URL Parser", description = "Instagram Reels / YouTube Shorts URL 콘텐츠 수집")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/url-parser")
@RequiredArgsConstructor
public class UrlParserController {

    private final UrlParserService urlParserService;

    @Operation(summary = "URL 파싱", description = "Instagram Reels 또는 YouTube Shorts URL을 받아 제목, 자막, 해시태그 등을 추출합니다")
    @PostMapping("/parse")
    public ResponseEntity<ApiResponse<Map<String, Object>>> parse(
            @Valid @RequestBody ParseUrlRequest request) {
        return ResponseEntity.ok(ApiResponse.success(urlParserService.parse(request.getUrl())));
    }
}

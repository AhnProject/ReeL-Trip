package com.reeltrip.api.urlparser.controller;

import com.reeltrip.api.common.response.ApiResponse;
import com.reeltrip.api.urlparser.dto.ParseUrlRequest;
import com.reeltrip.api.urlparser.service.UrlParserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/url-parser")
@RequiredArgsConstructor
public class UrlParserController {

    private final UrlParserService urlParserService;

    @PostMapping("/parse")
    public ResponseEntity<ApiResponse<Map<String, Object>>> parse(
            @Valid @RequestBody ParseUrlRequest request) {
        return ResponseEntity.ok(ApiResponse.success(urlParserService.parse(request.getUrl())));
    }
}

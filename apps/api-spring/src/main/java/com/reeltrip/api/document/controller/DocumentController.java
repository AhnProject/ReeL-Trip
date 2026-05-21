package com.reeltrip.api.document.controller;

import com.reeltrip.api.common.response.ApiResponse;
import com.reeltrip.api.document.dto.CreateDocumentRequest;
import com.reeltrip.api.document.dto.DocumentResponse;
import com.reeltrip.api.document.dto.SearchDocumentRequest;
import com.reeltrip.api.document.dto.UpdateDocumentRequest;
import com.reeltrip.api.document.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@Tag(name = "Documents", description = "여행 문서 CRUD 및 벡터 유사도 검색")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @Operation(summary = "헬스 체크", security = {})
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, String>>> health() {
        return ResponseEntity.ok(ApiResponse.success(Map.of("status", "ok")));
    }

    @Operation(summary = "전체 문서 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> findAll() {
        return ResponseEntity.ok(ApiResponse.success(documentService.findAll()));
    }

    @Operation(summary = "문서 생성", description = "제목, 내용, 임베딩 벡터(1536차원)를 저장합니다")
    @PostMapping
    public ResponseEntity<ApiResponse<DocumentResponse>> create(
            @Valid @RequestBody CreateDocumentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(documentService.create(request)));
    }

    @Operation(summary = "벡터 유사도 검색", description = "임베딩 벡터 기반 코사인 유사도로 관련 문서를 검색합니다")
    @PostMapping("/search")
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> search(
            @Valid @RequestBody SearchDocumentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(documentService.search(request)));
    }

    @Operation(summary = "문서 단건 조회")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DocumentResponse>> findById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(documentService.findById(id)));
    }

    @Operation(summary = "문서 수정")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DocumentResponse>> update(
            @PathVariable String id,
            @Valid @RequestBody UpdateDocumentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(documentService.update(id, request)));
    }

    @Operation(summary = "문서 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        documentService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

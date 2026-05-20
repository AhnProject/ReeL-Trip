package com.reeltrip.api.document.controller;

import com.reeltrip.api.common.response.ApiResponse;
import com.reeltrip.api.document.dto.CreateDocumentRequest;
import com.reeltrip.api.document.dto.DocumentResponse;
import com.reeltrip.api.document.dto.SearchDocumentRequest;
import com.reeltrip.api.document.dto.UpdateDocumentRequest;
import com.reeltrip.api.document.service.DocumentService;
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

@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, String>>> health() {
        return ResponseEntity.ok(ApiResponse.success(Map.of("status", "ok")));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> findAll() {
        return ResponseEntity.ok(ApiResponse.success(documentService.findAll()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DocumentResponse>> create(
            @Valid @RequestBody CreateDocumentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(documentService.create(request)));
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> search(
            @Valid @RequestBody SearchDocumentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(documentService.search(request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DocumentResponse>> findById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(documentService.findById(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DocumentResponse>> update(
            @PathVariable String id,
            @Valid @RequestBody UpdateDocumentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(documentService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        documentService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

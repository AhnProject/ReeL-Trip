package com.reeltrip.api.document.service;

import com.reeltrip.api.ai.service.AiService;
import com.reeltrip.api.common.exception.AppException;
import com.reeltrip.api.common.exception.ErrorCode;
import com.reeltrip.api.document.dto.CreateDocumentRequest;
import com.reeltrip.api.document.dto.DocumentResponse;
import com.reeltrip.api.document.dto.SearchDocumentRequest;
import com.reeltrip.api.document.dto.UpdateDocumentRequest;
import com.reeltrip.api.document.mapper.DocumentInsertParam;
import com.reeltrip.api.document.mapper.DocumentMapper;
import com.reeltrip.api.document.mapper.DocumentUpdateParam;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {

    private final DocumentMapper documentMapper;
    private final AiService aiService;

    @Value("${openai.vector-dim:1536}")
    private int vectorDim;

    @Override
    public DocumentResponse create(CreateDocumentRequest request) {
        List<Double> embedding = request.getEmbedding();
        if (embedding == null) {
            embedding = aiService.createEmbedding(request.getContent());
        }
        validateEmbeddingDimension(embedding);

        DocumentInsertParam param = DocumentInsertParam.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .embedding(toVectorString(embedding))
                .build();

        documentMapper.insert(param);

        return documentMapper.findById(param.getId())
                .orElseThrow(() -> new AppException(ErrorCode.DOCUMENT_NOT_FOUND));
    }

    @Override
    public List<DocumentResponse> findAll() {
        return documentMapper.findAll();
    }

    @Override
    public DocumentResponse findById(String id) {
        return documentMapper.findById(Long.valueOf(id))
                .orElseThrow(() -> new AppException(ErrorCode.DOCUMENT_NOT_FOUND));
    }

    @Override
    public DocumentResponse update(String id, UpdateDocumentRequest request) {
        documentMapper.findById(Long.valueOf(id))
                .orElseThrow(() -> new AppException(ErrorCode.DOCUMENT_NOT_FOUND));

        List<Double> embedding = request.getEmbedding();
        if (embedding != null) {
            validateEmbeddingDimension(embedding);
        }

        DocumentUpdateParam param = DocumentUpdateParam.builder()
                .id(Long.valueOf(id))
                .title(request.getTitle())
                .content(request.getContent())
                .embedding(toVectorString(embedding))
                .build();

        documentMapper.update(param);

        return documentMapper.findById(Long.valueOf(id))
                .orElseThrow(() -> new AppException(ErrorCode.DOCUMENT_NOT_FOUND));
    }

    @Override
    public void delete(String id) {
        if (documentMapper.delete(Long.valueOf(id)) == 0) {
            throw new AppException(ErrorCode.DOCUMENT_NOT_FOUND);
        }
    }

    @Override
    public List<DocumentResponse> search(SearchDocumentRequest request) {
        validateEmbeddingDimension(request.getEmbedding());
        int limit = request.getLimit() != null ? request.getLimit() : 10;
        String embeddingStr = toVectorString(request.getEmbedding());

        if (request.getThreshold() != null) {
            return documentMapper.searchByVectorWithThreshold(embeddingStr, limit, request.getThreshold());
        }
        return documentMapper.searchByVector(embeddingStr, limit);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private void validateEmbeddingDimension(List<Double> embedding) {
        if (embedding != null && embedding.size() != vectorDim) {
            throw new AppException(ErrorCode.INVALID_VECTOR_DIMENSION,
                    "Embedding must have " + vectorDim + " dimensions, got " + embedding.size());
        }
    }

    private String toVectorString(List<Double> embedding) {
        if (embedding == null) return null;
        return "[" + embedding.stream()
                .map(Object::toString)
                .collect(Collectors.joining(",")) + "]";
    }
}

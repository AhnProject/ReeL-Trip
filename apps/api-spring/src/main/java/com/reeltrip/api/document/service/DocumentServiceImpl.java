package com.reeltrip.api.document.service;

import com.reeltrip.api.ai.service.AiService;
import com.reeltrip.api.common.exception.AppException;
import com.reeltrip.api.common.exception.ErrorCode;
import com.reeltrip.api.document.dto.CreateDocumentRequest;
import com.reeltrip.api.document.dto.DocumentResponse;
import com.reeltrip.api.document.dto.SearchDocumentRequest;
import com.reeltrip.api.document.dto.UpdateDocumentRequest;
import com.reeltrip.api.document.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {

    private final DocumentRepository documentRepository;
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
        return documentRepository.create(request.getTitle(), request.getContent(), embedding);
    }

    @Override
    public List<DocumentResponse> findAll() {
        return documentRepository.findAll();
    }

    @Override
    public DocumentResponse findById(String id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DOCUMENT_NOT_FOUND));
    }

    @Override
    public DocumentResponse update(String id, UpdateDocumentRequest request) {
        documentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DOCUMENT_NOT_FOUND));

        List<Double> embedding = request.getEmbedding();
        if (embedding != null) {
            validateEmbeddingDimension(embedding);
        }
        return documentRepository.update(id, request.getTitle(), request.getContent(), embedding)
                .orElseThrow(() -> new AppException(ErrorCode.DOCUMENT_NOT_FOUND));
    }

    @Override
    public void delete(String id) {
        if (!documentRepository.delete(id)) {
            throw new AppException(ErrorCode.DOCUMENT_NOT_FOUND);
        }
    }

    @Override
    public List<DocumentResponse> search(SearchDocumentRequest request) {
        validateEmbeddingDimension(request.getEmbedding());
        int limit = request.getLimit() != null ? request.getLimit() : 10;
        return documentRepository.searchByVector(request.getEmbedding(), limit, request.getThreshold());
    }

    private void validateEmbeddingDimension(List<Double> embedding) {
        if (embedding != null && embedding.size() != vectorDim) {
            throw new AppException(ErrorCode.INVALID_VECTOR_DIMENSION,
                    "Embedding must have " + vectorDim + " dimensions, got " + embedding.size());
        }
    }
}

package com.reeltrip.api.document.service;

import com.reeltrip.api.document.dto.CreateDocumentRequest;
import com.reeltrip.api.document.dto.DocumentResponse;
import com.reeltrip.api.document.dto.SearchDocumentRequest;
import com.reeltrip.api.document.dto.UpdateDocumentRequest;

import java.util.List;

public interface DocumentService {

    DocumentResponse create(CreateDocumentRequest request);

    List<DocumentResponse> findAll();

    DocumentResponse findById(String id);

    DocumentResponse update(String id, UpdateDocumentRequest request);

    void delete(String id);

    List<DocumentResponse> search(SearchDocumentRequest request);
}

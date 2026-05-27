package com.reeltrip.api.document.mapper;

import com.reeltrip.api.document.dto.DocumentResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface DocumentMapper {

    void insert(DocumentInsertParam param);

    Optional<DocumentResponse> findById(@Param("id") Long id);

    List<DocumentResponse> findAll();

    int update(DocumentUpdateParam param);

    int delete(@Param("id") Long id);

    List<DocumentResponse> searchByVector(
            @Param("embedding") String embedding,
            @Param("limit") int limit);

    List<DocumentResponse> searchByVectorWithThreshold(
            @Param("embedding") String embedding,
            @Param("limit") int limit,
            @Param("threshold") double threshold);
}

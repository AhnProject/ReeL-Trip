package com.reeltrip.api.document.repository;

import com.reeltrip.api.document.dto.DocumentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * pgvector 타입은 JPA로 직접 매핑이 어렵기 때문에
 * JdbcTemplate을 사용한 네이티브 SQL로 모든 CRUD와 벡터 검색을 처리합니다.
 */
@Repository
@RequiredArgsConstructor
public class DocumentRepository {

    private final JdbcTemplate jdbcTemplate;

    public DocumentResponse create(String title, String content, List<Double> embedding) {
        String sql = """
                INSERT INTO documents (title, content, embedding, created_at, updated_at)
                VALUES (?, ?, ?::vector, NOW(), NOW())
                RETURNING id, title, content, created_at, updated_at
                """;
        return jdbcTemplate.queryForObject(sql, this::mapRow,
                title, content, toVectorString(embedding));
    }

    public Optional<DocumentResponse> findById(String id) {
        String sql = """
                SELECT id, title, content, created_at, updated_at
                FROM documents WHERE id = ?
                """;
        List<DocumentResponse> results = jdbcTemplate.query(sql, this::mapRow, Long.valueOf(id));
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    public List<DocumentResponse> findAll() {
        String sql = """
                SELECT id, title, content, created_at, updated_at
                FROM documents ORDER BY created_at DESC
                """;
        return jdbcTemplate.query(sql, this::mapRow);
    }

    public Optional<DocumentResponse> update(String id, String title, String content, List<Double> embedding) {
        String sql = """
                UPDATE documents
                SET title = ?, content = ?, embedding = ?::vector, updated_at = NOW()
                WHERE id = ?
                RETURNING id, title, content, created_at, updated_at
                """;
        List<DocumentResponse> results = jdbcTemplate.query(sql, this::mapRow,
                title, content, toVectorString(embedding), Long.valueOf(id));
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    public boolean delete(String id) {
        return jdbcTemplate.update("DELETE FROM documents WHERE id = ?", Long.valueOf(id)) > 0;
    }

    /**
     * 코사인 거리(<=>) 기반 벡터 유사도 검색.
     * similarity = 1 - cosine_distance (소수점 4자리)
     */
    public List<DocumentResponse> searchByVector(List<Double> embedding, int limit, Double threshold) {
        String vectorStr = toVectorString(embedding);

        if (threshold != null) {
            String sql = """
                    SELECT id, title, content, created_at, updated_at,
                           ROUND(CAST(1 - (embedding <=> ?::vector) AS NUMERIC), 4) AS similarity
                    FROM documents
                    WHERE embedding IS NOT NULL
                      AND 1 - (embedding <=> ?::vector) >= ?
                    ORDER BY embedding <=> ?::vector
                    LIMIT ?
                    """;
            return jdbcTemplate.query(sql, this::mapRowWithSimilarity,
                    vectorStr, vectorStr, threshold, vectorStr, limit);
        } else {
            String sql = """
                    SELECT id, title, content, created_at, updated_at,
                           ROUND(CAST(1 - (embedding <=> ?::vector) AS NUMERIC), 4) AS similarity
                    FROM documents
                    WHERE embedding IS NOT NULL
                    ORDER BY embedding <=> ?::vector
                    LIMIT ?
                    """;
            return jdbcTemplate.query(sql, this::mapRowWithSimilarity,
                    vectorStr, vectorStr, limit);
        }
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private DocumentResponse mapRow(ResultSet rs, int rowNum) throws SQLException {
        return DocumentResponse.builder()
                .id(String.valueOf(rs.getLong("id")))
                .title(rs.getString("title"))
                .content(rs.getString("content"))
                .createdAt(rs.getTimestamp("created_at").toLocalDateTime())
                .updatedAt(rs.getTimestamp("updated_at") != null
                        ? rs.getTimestamp("updated_at").toLocalDateTime() : null)
                .build();
    }

    private DocumentResponse mapRowWithSimilarity(ResultSet rs, int rowNum) throws SQLException {
        DocumentResponse doc = mapRow(rs, rowNum);
        doc.setSimilarity(rs.getDouble("similarity"));
        return doc;
    }

    private String toVectorString(List<Double> embedding) {
        if (embedding == null) return null;
        return "[" + embedding.stream()
                .map(Object::toString)
                .collect(Collectors.joining(",")) + "]";
    }
}

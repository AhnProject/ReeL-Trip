package com.reeltrip.api.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.reeltrip.api.ai.dto.ParsedQueryResult;
import com.reeltrip.api.common.exception.AppException;
import com.reeltrip.api.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiServiceImpl implements AiService {

    private final ObjectMapper objectMapper;

    @Value("${openai.api-key}")
    private String openaiApiKey;

    @Value("${openai.embedding-model:text-embedding-3-small}")
    private String embeddingModel;

    @Value("${openai.vector-dim:1536}")
    private int vectorDim;

    @Value("${anthropic.api-key}")
    private String anthropicApiKey;

    @Value("${anthropic.model:claude-opus-4-6}")
    private String anthropicModel;

    // -------------------------------------------------------------------------
    // OpenAI Embeddings
    // -------------------------------------------------------------------------

    @Override
    public List<Double> createEmbedding(String text) {
        if (openaiApiKey == null || openaiApiKey.isBlank()) {
            throw new AppException(ErrorCode.OPENAI_API_KEY_MISSING);
        }

        Map<String, Object> body = Map.of(
                "model", embeddingModel,
                "input", text,
                "dimensions", vectorDim
        );

        try {
            String response = openaiClient().post()
                    .uri("/v1/embeddings")
                    .body(body)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(response);
            JsonNode embeddingArray = root.path("data").get(0).path("embedding");

            List<Double> embedding = new ArrayList<>();
            for (JsonNode val : embeddingArray) {
                embedding.add(val.asDouble());
            }
            return embedding;
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("OpenAI embedding error", e);
            throw new AppException(ErrorCode.AI_RESPONSE_PARSE_ERROR,
                    "Failed to generate embedding: " + e.getMessage());
        }
    }

    // -------------------------------------------------------------------------
    // OpenAI Chat — query parsing
    // -------------------------------------------------------------------------

    @Override
    public ParsedQueryResult parseAndEmbed(String userInput) {
        if (openaiApiKey == null || openaiApiKey.isBlank()) {
            throw new AppException(ErrorCode.OPENAI_API_KEY_MISSING);
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", "gpt-4o");
        body.put("temperature", 0.2);
        body.put("response_format", Map.of("type", "json_object"));
        body.put("messages", List.of(
                Map.of("role", "system",
                        "content", "Extract keywords and return JSON with keys: "
                                + "keywords (array of strings), refinedQuery (string)"),
                Map.of("role", "user", "content", userInput)
        ));

        try {
            String response = openaiClient().post()
                    .uri("/v1/chat/completions")
                    .body(body)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(response);
            String content = root.path("choices").get(0).path("message").path("content").asText();
            JsonNode parsed = objectMapper.readTree(content);

            String refinedQuery = parsed.path("refinedQuery").asText(userInput);
            List<String> keywords = new ArrayList<>();
            for (JsonNode kw : parsed.path("keywords")) {
                keywords.add(kw.asText());
            }

            List<Double> embedding = createEmbedding(refinedQuery);
            return new ParsedQueryResult(userInput, keywords, refinedQuery, embedding);
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("OpenAI parse error", e);
            throw new AppException(ErrorCode.AI_RESPONSE_PARSE_ERROR,
                    "Failed to parse query: " + e.getMessage());
        }
    }

    // -------------------------------------------------------------------------
    // Anthropic Claude — travel info extraction
    // -------------------------------------------------------------------------

    @Override
    public Map<String, Object> extractTravelInfo(Map<String, Object> rawContent) {
        if (anthropicApiKey == null || anthropicApiKey.isBlank()) {
            throw new AppException(ErrorCode.ANTHROPIC_API_KEY_MISSING);
        }

        String systemPrompt = """
                당신은 여행 정보 추출 전문가입니다. 주어진 소셜 미디어 콘텐츠에서 여행/관광 정보를 추출하세요.
                반드시 아래 JSON 형식으로만 응답하세요:
                {
                  "name": "장소 또는 식당 이름 (없으면 null)",
                  "category": "restaurant|cafe|attraction|accommodation|other|null",
                  "location": {
                    "address": "주소 (없으면 null)",
                    "region": "도시/도 (없으면 null)",
                    "country": "국가 (없으면 null)"
                  },
                  "price": {
                    "description": "가격 설명 (없으면 null)",
                    "min": null,
                    "max": null,
                    "currency": "KRW|USD|JPY|EUR|null"
                  },
                  "hours": "영업시간 (없으면 null)",
                  "menu": [],
                  "tags": [],
                  "description": "한 줄 요약 (없으면 null)",
                  "confidence": "high|medium|low"
                }
                """;

        String userContent = "다음 콘텐츠에서 여행 정보를 추출하세요:\n" + formatRawContent(rawContent);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", anthropicModel);
        body.put("max_tokens", 1024);
        body.put("system", systemPrompt);
        body.put("messages", List.of(Map.of("role", "user", "content", userContent)));

        try {
            String response = anthropicClient().post()
                    .uri("/v1/messages")
                    .body(body)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(response);
            String text = root.path("content").get(0).path("text").asText();
            String jsonStr = extractJson(text);

            return objectMapper.readValue(jsonStr, Map.class);
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Anthropic extraction error", e);
            throw new AppException(ErrorCode.AI_RESPONSE_PARSE_ERROR,
                    "Failed to extract travel info: " + e.getMessage());
        }
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private RestClient openaiClient() {
        return RestClient.builder()
                .baseUrl("https://api.openai.com")
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + openaiApiKey)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    private RestClient anthropicClient() {
        return RestClient.builder()
                .baseUrl("https://api.anthropic.com")
                .defaultHeader("x-api-key", anthropicApiKey)
                .defaultHeader("anthropic-version", "2023-06-01")
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    private String formatRawContent(Map<String, Object> raw) {
        StringBuilder sb = new StringBuilder();
        appendIfPresent(sb, "제목", raw.get("title"));
        appendIfPresent(sb, "캡션", raw.get("caption"));
        appendIfPresent(sb, "자막", raw.get("transcript"));
        appendIfPresent(sb, "위치", raw.get("locationName"));
        appendIfPresent(sb, "해시태그", raw.get("hashtags"));
        return sb.toString();
    }

    private void appendIfPresent(StringBuilder sb, String label, Object value) {
        if (value != null) {
            sb.append(label).append(": ").append(value).append("\n");
        }
    }

    /** 마크다운 코드블록이 있을 경우 JSON 부분만 추출합니다. */
    private String extractJson(String text) {
        if (text.contains("```json")) {
            int start = text.indexOf("```json") + 7;
            int end = text.indexOf("```", start);
            return text.substring(start, end).trim();
        } else if (text.contains("```")) {
            int start = text.indexOf("```") + 3;
            int end = text.indexOf("```", start);
            return text.substring(start, end).trim();
        }
        return text.trim();
    }
}

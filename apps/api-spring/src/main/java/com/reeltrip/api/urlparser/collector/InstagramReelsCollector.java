package com.reeltrip.api.urlparser.collector;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.reeltrip.api.common.exception.AppException;
import com.reeltrip.api.common.exception.ErrorCode;
import com.reeltrip.api.urlparser.dto.RawCollectedContent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Component
@RequiredArgsConstructor
public class InstagramReelsCollector implements ContentCollector {

    private final ObjectMapper objectMapper;

    @Value("${apify.api-token:}")
    private String apifyToken;

    @Value("${apify.actor-id:apify~instagram-reel-scraper}")
    private String actorId;

    @Override
    public RawCollectedContent collect(String reelId, String normalizedUrl) {
        if (apifyToken == null || apifyToken.isBlank()) {
            throw new AppException(ErrorCode.APIFY_NOT_CONFIGURED);
        }

        try {
            String endpoint = "/v2/acts/" + actorId
                    + "/run-sync-get-dataset-items?token=" + apifyToken;

            Map<String, Object> body = Map.of(
                    "directUrls", List.of(normalizedUrl),
                    "resultsType", "posts"
            );

            String response = RestClient.builder()
                    .baseUrl("https://api.apify.com")
                    .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .build()
                    .post()
                    .uri(endpoint)
                    .body(body)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, res) -> {
                        throw new AppException(ErrorCode.APIFY_ERROR,
                                "Apify API 오류: " + res.getStatusCode());
                    })
                    .body(String.class);

            JsonNode items = objectMapper.readTree(response);
            if (!items.isArray() || items.isEmpty()) {
                throw new AppException(ErrorCode.PRIVATE_CONTENT,
                        "콘텐츠를 가져올 수 없습니다. 비공개 계정일 수 있습니다.");
            }

            JsonNode item = items.get(0);
            String caption = item.path("caption").asText("");
            String title = caption.isEmpty() ? "" : caption.split("\n")[0];

            List<String> hashtags = extractHashtags(caption);

            String locationName = item.has("locationName")
                    ? item.path("locationName").asText(null) : null;

            String thumbnailUrl = null;
            if (item.has("displayUrl")) {
                thumbnailUrl = item.path("displayUrl").asText(null);
            } else if (item.has("thumbnailUrl")) {
                thumbnailUrl = item.path("thumbnailUrl").asText(null);
            }

            return RawCollectedContent.builder()
                    .title(title)
                    .caption(caption)
                    .transcript(null)
                    .hashtags(hashtags)
                    .locationName(locationName)
                    .thumbnailUrl(thumbnailUrl)
                    .build();

        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Instagram collector error for reelId={}", reelId, e);
            throw new AppException(ErrorCode.APIFY_ERROR,
                    "Instagram 콘텐츠를 가져오는데 실패했습니다: " + e.getMessage());
        }
    }

    private List<String> extractHashtags(String text) {
        List<String> hashtags = new ArrayList<>();
        Matcher matcher = Pattern.compile("#(\\w+)").matcher(text);
        while (matcher.find()) {
            hashtags.add(matcher.group(1));
        }
        return hashtags;
    }
}

package com.reeltrip.api.urlparser.collector;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.reeltrip.api.common.exception.AppException;
import com.reeltrip.api.common.exception.ErrorCode;
import com.reeltrip.api.urlparser.dto.RawCollectedContent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Component
@RequiredArgsConstructor
public class YoutubeShortCollector implements ContentCollector {

    private final ObjectMapper objectMapper;

    @Override
    public RawCollectedContent collect(String videoId, String normalizedUrl) {
        try {
            String encodedUrl = URLEncoder.encode(normalizedUrl, StandardCharsets.UTF_8);
            String oEmbedJson = RestClient.create()
                    .get()
                    .uri(URI.create("https://www.youtube.com/oembed?url=" + encodedUrl + "&format=json"))
                    .retrieve()
                    .body(String.class);

            JsonNode oEmbed = objectMapper.readTree(oEmbedJson);
            String title = oEmbed.path("title").asText("");
            String thumbnailUrl = oEmbed.path("thumbnail_url").asText(null);

            List<String> hashtags = extractHashtags(title);

            String transcript = null;
            try {
                transcript = fetchTranscript(videoId);
            } catch (Exception e) {
                log.warn("Transcript unavailable for video {}: {}", videoId, e.getMessage());
            }

            return RawCollectedContent.builder()
                    .title(title)
                    .caption(title)
                    .transcript(transcript)
                    .hashtags(hashtags)
                    .locationName(null)
                    .thumbnailUrl(thumbnailUrl)
                    .build();

        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("YouTube collector error for videoId={}", videoId, e);
            throw new AppException(ErrorCode.EXTRACTION_FAILED,
                    "YouTube 콘텐츠를 가져오는데 실패했습니다: " + e.getMessage());
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

    /**
     * YouTube 내부 자막 API를 통해 transcript를 가져옵니다.
     * youtube-transcript npm 패키지와 동일한 방식으로 동작합니다.
     */
    private String fetchTranscript(String videoId) throws Exception {
        String html = RestClient.create()
                .get()
                .uri(URI.create("https://www.youtube.com/watch?v=" + videoId))
                .header("User-Agent",
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                .header("Accept-Language", "ko-KR,ko;q=0.9,en;q=0.8")
                .retrieve()
                .body(String.class);

        if (html == null) return null;

        Matcher captionMatcher = Pattern.compile(
                "\"captionTracks\":\\[\\{\"baseUrl\":\"(.*?)\"").matcher(html);
        if (!captionMatcher.find()) return null;

        String captionUrl = captionMatcher.group(1)
                .replace("\\u0026", "&")
                .replace("\\/", "/");

        String xml = RestClient.create()
                .get()
                .uri(URI.create(captionUrl))
                .retrieve()
                .body(String.class);

        if (xml == null) return null;

        StringBuilder transcript = new StringBuilder();
        Matcher textMatcher = Pattern.compile("<text[^>]*>(.*?)</text>").matcher(xml);
        while (textMatcher.find()) {
            String segment = textMatcher.group(1)
                    .replace("&amp;", "&")
                    .replace("&lt;", "<")
                    .replace("&gt;", ">")
                    .replace("&quot;", "\"")
                    .replace("&#39;", "'")
                    .replaceAll("<[^>]+>", "")
                    .trim();
            if (!segment.isBlank()) {
                transcript.append(segment).append(" ");
            }
        }

        String result = transcript.toString().trim();
        return result.isEmpty() ? null : result;
    }
}

package com.reeltrip.api.urlparser.service;

import com.reeltrip.api.ai.service.AiService;
import com.reeltrip.api.urlparser.collector.InstagramReelsCollector;
import com.reeltrip.api.urlparser.collector.YoutubeShortCollector;
import com.reeltrip.api.urlparser.dto.RawCollectedContent;
import com.reeltrip.api.urlparser.util.UrlDetector;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UrlParserServiceImpl implements UrlParserService {

    private final UrlDetector urlDetector;
    private final YoutubeShortCollector youtubeCollector;
    private final InstagramReelsCollector instagramCollector;
    private final AiService aiService;

    @Override
    public Map<String, Object> parse(String url) {
        UrlDetector.DetectedUrl detected = urlDetector.detect(url);

        RawCollectedContent raw = switch (detected.getPlatform()) {
            case "youtube_shorts" ->
                    youtubeCollector.collect(detected.getId(), detected.getNormalizedUrl());
            case "instagram_reels" ->
                    instagramCollector.collect(detected.getId(), detected.getNormalizedUrl());
            default -> throw new IllegalStateException("Unknown platform: " + detected.getPlatform());
        };

        Map<String, Object> rawMap = new HashMap<>();
        rawMap.put("title", raw.getTitle());
        rawMap.put("caption", raw.getCaption());
        rawMap.put("transcript", raw.getTranscript());
        rawMap.put("hashtags", raw.getHashtags());
        rawMap.put("locationName", raw.getLocationName());

        Map<String, Object> travelInfo = aiService.extractTravelInfo(rawMap);

        Map<String, Object> result = new HashMap<>(travelInfo);
        result.put("sourceUrl", detected.getNormalizedUrl());
        result.put("sourcePlatform", detected.getPlatform());
        result.put("thumbnailUrl", raw.getThumbnailUrl());
        result.put("rawContent", rawMap);

        return result;
    }
}

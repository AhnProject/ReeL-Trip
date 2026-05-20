package com.reeltrip.api.urlparser.util;

import com.reeltrip.api.common.exception.AppException;
import com.reeltrip.api.common.exception.ErrorCode;
import lombok.Value;
import org.springframework.stereotype.Component;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class UrlDetector {

    private static final Pattern YOUTUBE_SHORTS =
            Pattern.compile("youtube\\.com/shorts/([a-zA-Z0-9_-]+)");

    private static final Pattern INSTAGRAM_REELS =
            Pattern.compile("instagram\\.com/(?:reel|reels)/([a-zA-Z0-9_-]+)");

    public DetectedUrl detect(String url) {
        Matcher ytMatcher = YOUTUBE_SHORTS.matcher(url);
        if (ytMatcher.find()) {
            String id = ytMatcher.group(1);
            return new DetectedUrl("youtube_shorts", id,
                    "https://www.youtube.com/shorts/" + id);
        }

        Matcher igMatcher = INSTAGRAM_REELS.matcher(url);
        if (igMatcher.find()) {
            String id = igMatcher.group(1);
            return new DetectedUrl("instagram_reels", id,
                    "https://www.instagram.com/reel/" + id + "/");
        }

        throw new AppException(ErrorCode.UNSUPPORTED_URL,
                "지원하지 않는 URL입니다. YouTube Shorts 또는 Instagram Reels URL을 입력해주세요.");
    }

    @Value
    public static class DetectedUrl {
        String platform;
        String id;
        String normalizedUrl;
    }
}

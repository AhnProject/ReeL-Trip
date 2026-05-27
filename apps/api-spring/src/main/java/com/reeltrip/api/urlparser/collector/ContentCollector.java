package com.reeltrip.api.urlparser.collector;

import com.reeltrip.api.urlparser.dto.RawCollectedContent;

/**
 * 플랫폼별 콘텐츠 수집기 인터페이스.
 * YouTube Shorts / Instagram Reels 등 각 플랫폼의 구현체가 이 인터페이스를 구현합니다.
 */
public interface ContentCollector {

    /**
     * @param contentId     플랫폼별 고유 콘텐츠 ID
     * @param normalizedUrl 정규화된 URL
     * @return 수집된 raw 콘텐츠
     */
    RawCollectedContent collect(String contentId, String normalizedUrl);
}

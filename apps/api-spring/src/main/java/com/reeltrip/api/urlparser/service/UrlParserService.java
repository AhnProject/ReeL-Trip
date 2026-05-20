package com.reeltrip.api.urlparser.service;

import java.util.Map;

public interface UrlParserService {

    /**
     * URL을 파싱하여 여행 정보를 추출합니다.
     *
     * @param url YouTube Shorts 또는 Instagram Reels URL
     * @return AI가 추출한 여행 정보 + 소스 메타데이터
     */
    Map<String, Object> parse(String url);
}

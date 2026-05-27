package com.reeltrip.api.document.mapper;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DocumentUpdateParam {
    private Long id;
    private String title;
    private String content;
    private String embedding; // null 이면 embedding 유지
}

package com.reeltrip.api.document.mapper;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class DocumentInsertParam {
    private Long id;          // useGeneratedKeys 로 채워짐
    private String title;
    private String content;
    private String embedding; // "[1.0,2.0,...]" 형식 문자열
}

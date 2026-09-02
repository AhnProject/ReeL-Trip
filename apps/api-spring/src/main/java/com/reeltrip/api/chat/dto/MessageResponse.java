package com.reeltrip.api.chat.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class MessageResponse {
    private Long id;
    private Long spaceId;
    private String authorUsername;
    private String content;
    private LocalDateTime sentAt;
}

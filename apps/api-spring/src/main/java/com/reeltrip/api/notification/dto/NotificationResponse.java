package com.reeltrip.api.notification.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class NotificationResponse {
    private Long id;
    private String message;
    private String type;
    private Long relatedSpaceId;
    private boolean isRead;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
}

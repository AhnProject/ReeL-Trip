package com.reeltrip.api.notification.model;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
    private Long id;
    private Long userId;
    private String message;
    private String type;
    private Long relatedSpaceId;
    private boolean isRead;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
}

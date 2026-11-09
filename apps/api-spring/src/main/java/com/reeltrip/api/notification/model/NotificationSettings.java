package com.reeltrip.api.notification.model;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationSettings {
    private Long userId;
    private boolean newPlace;
    private boolean scheduleChange;
    private boolean memberJoin;
    private boolean aiRecommend;
    private boolean chat;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

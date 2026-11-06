package com.reeltrip.api.notification.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class NotificationSettingsResponse {
    private boolean newPlace;
    private boolean scheduleChange;
    private boolean memberJoin;
    private boolean aiRecommend;
    private boolean chat;
}

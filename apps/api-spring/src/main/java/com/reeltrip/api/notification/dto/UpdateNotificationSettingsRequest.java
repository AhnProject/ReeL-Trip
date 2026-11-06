package com.reeltrip.api.notification.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateNotificationSettingsRequest {

    @NotNull
    private Boolean newPlace;

    @NotNull
    private Boolean scheduleChange;

    @NotNull
    private Boolean memberJoin;

    @NotNull
    private Boolean aiRecommend;
}

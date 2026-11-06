package com.reeltrip.api.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateAvatarRequest {

    @NotBlank
    private String avatar;
}

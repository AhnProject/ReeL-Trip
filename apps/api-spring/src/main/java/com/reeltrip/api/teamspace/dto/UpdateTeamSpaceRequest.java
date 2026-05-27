package com.reeltrip.api.teamspace.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateTeamSpaceRequest {

    @NotBlank
    @Size(max = 100)
    private String name;

    @Size(max = 10)
    private String emoji;

    @Size(max = 7)
    private String bgColor;
}

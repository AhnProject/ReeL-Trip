package com.reeltrip.api.teamspace.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InviteMemberRequest {

    @NotBlank
    private String username;
}

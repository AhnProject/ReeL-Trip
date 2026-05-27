package com.reeltrip.api.teamspace.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class MemberResponse {
    private Long userId;
    private String username;
    private String role;
    private LocalDateTime joinedAt;
}

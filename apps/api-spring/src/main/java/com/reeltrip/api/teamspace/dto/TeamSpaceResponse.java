package com.reeltrip.api.teamspace.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class TeamSpaceResponse {
    private Long id;
    private String name;
    private String emoji;
    private String bgColor;
    private Long ownerId;
    private List<MemberResponse> members;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

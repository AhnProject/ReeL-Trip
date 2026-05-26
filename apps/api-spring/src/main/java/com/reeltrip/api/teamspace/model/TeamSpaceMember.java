package com.reeltrip.api.teamspace.model;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamSpaceMember {
    private Long id;
    private Long spaceId;
    private Long userId;
    private String username;
    private String role;
    private LocalDateTime joinedAt;
}

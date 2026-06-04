package com.reeltrip.api.auth.model;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken {

    private Long          id;
    private Long          userId;
    private String        token;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
}

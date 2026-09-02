package com.reeltrip.api.chat.model;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {
    private Long id;
    private Long spaceId;
    private Long userId;
    private String content;
    private LocalDateTime sentAt;
}

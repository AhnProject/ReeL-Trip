package com.reeltrip.api.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class SendMessageRequest {

    @NotNull
    private Long spaceId;

    @NotBlank
    @Size(max = 2000)
    private String content;
}

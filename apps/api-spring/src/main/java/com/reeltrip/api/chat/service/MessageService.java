package com.reeltrip.api.chat.service;

import com.reeltrip.api.chat.dto.MessageResponse;
import com.reeltrip.api.chat.dto.SendMessageRequest;

import java.util.List;

public interface MessageService {
    List<MessageResponse> findBySpaceId(Long spaceId, String username);
    MessageResponse send(SendMessageRequest request, String username);
}

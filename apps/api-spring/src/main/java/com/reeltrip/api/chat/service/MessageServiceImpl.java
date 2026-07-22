package com.reeltrip.api.chat.service;

import com.reeltrip.api.auth.mapper.UserMapper;
import com.reeltrip.api.auth.model.User;
import com.reeltrip.api.chat.dto.MessageResponse;
import com.reeltrip.api.chat.dto.SendMessageRequest;
import com.reeltrip.api.chat.mapper.MessageMapper;
import com.reeltrip.api.chat.model.Message;
import com.reeltrip.api.common.exception.AppException;
import com.reeltrip.api.common.exception.ErrorCode;
import com.reeltrip.api.teamspace.mapper.TeamSpaceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final MessageMapper messageMapper;
    private final UserMapper userMapper;
    private final TeamSpaceMapper teamSpaceMapper;

    @Override
    public List<MessageResponse> findBySpaceId(Long spaceId, String username) {
        User user = getUser(username);
        checkMembership(spaceId, user.getId());

        // 메시지 목록 + 작성자 username 조회
        List<Message> messages = messageMapper.findBySpaceId(spaceId);

        // userId → username 매핑 (중복 조회 방지)
        List<Long> userIds = messages.stream()
                .map(Message::getUserId)
                .distinct()
                .toList();

        Map<Long, String> usernameMap = userIds.stream()
                .collect(Collectors.toMap(
                        id -> id,
                        id -> userMapper.findById(id)
                                .map(User::getUsername)
                                .orElse("알 수 없음")
                ));

        return messages.stream()
                .map(m -> toResponse(m, usernameMap.get(m.getUserId())))
                .toList();
    }

    @Override
    public MessageResponse send(SendMessageRequest request, String username) {
        User user = getUser(username);
        checkMembership(request.getSpaceId(), user.getId());

        Message message = Message.builder()
                .spaceId(request.getSpaceId())
                .userId(user.getId())
                .content(request.getContent())
                .build();

        messageMapper.insert(message);
        return toResponse(message, user.getUsername());
    }

    /* ── private helpers ── */

    private User getUser(String username) {
        return userMapper.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    private void checkMembership(Long spaceId, Long userId) {
        if (!teamSpaceMapper.existsMember(spaceId, userId)) {
            throw new AppException(ErrorCode.TEAM_SPACE_ACCESS_DENIED);
        }
    }

    private MessageResponse toResponse(Message m, String authorUsername) {
        return MessageResponse.builder()
                .id(m.getId())
                .spaceId(m.getSpaceId())
                .authorUsername(authorUsername)
                .content(m.getContent())
                .sentAt(m.getSentAt())
                .build();
    }
}

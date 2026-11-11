package com.reeltrip.api.chat.service;

import com.reeltrip.api.auth.mapper.UserMapper;
import com.reeltrip.api.auth.model.User;
import com.reeltrip.api.chat.dto.MessageResponse;
import com.reeltrip.api.chat.dto.SendMessageRequest;
import com.reeltrip.api.chat.mapper.MessageMapper;
import com.reeltrip.api.chat.model.Message;
import com.reeltrip.api.common.exception.AppException;
import com.reeltrip.api.common.exception.ErrorCode;
import com.reeltrip.api.notification.service.NotificationService;
import com.reeltrip.api.teamspace.mapper.TeamSpaceMapper;
import com.reeltrip.api.teamspace.model.TeamSpaceMember;
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
    private final NotificationService notificationService;

    @Override
    public List<MessageResponse> findBySpaceId(Long spaceId, String username) {
        User user = getUser(username);
        checkMembership(spaceId, user.getId());

        // 메시지 목록 + 작성자 username 조회
        List<Message> messages = messageMapper.findBySpaceId(spaceId);

        // userId → username 매핑 (IN 절 배치 조회로 N+1 방지)
        List<Long> userIds = messages.stream()
                .map(Message::getUserId)
                .distinct()
                .toList();

        Map<Long, String> usernameMap = userIds.isEmpty()
                ? Map.of()
                : userMapper.findByIds(userIds).stream()
                        .collect(Collectors.toMap(User::getId, User::getUsername));

        return messages.stream()
                .map(m -> toResponse(m, usernameMap.getOrDefault(m.getUserId(), "알 수 없음")))
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

        String preview = request.getContent().length() > 30
                ? request.getContent().substring(0, 30) + "…"
                : request.getContent();
        String notifyMessage = String.format("%s님: %s", user.getUsername(), preview);
        List<TeamSpaceMember> members = teamSpaceMapper.findMembersBySpaceId(request.getSpaceId());
        members.stream()
                .filter(m -> !m.getUserId().equals(user.getId()))
                .forEach(m -> notificationService.create(m.getUserId(), notifyMessage, "chat", request.getSpaceId()));

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

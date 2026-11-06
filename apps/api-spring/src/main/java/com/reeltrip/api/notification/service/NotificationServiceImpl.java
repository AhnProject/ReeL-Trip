package com.reeltrip.api.notification.service;

import com.reeltrip.api.auth.mapper.UserMapper;
import com.reeltrip.api.auth.model.User;
import com.reeltrip.api.common.exception.AppException;
import com.reeltrip.api.common.exception.ErrorCode;
import com.reeltrip.api.notification.dto.NotificationResponse;
import com.reeltrip.api.notification.mapper.NotificationMapper;
import com.reeltrip.api.notification.model.Notification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationMapper notificationMapper;
    private final UserMapper userMapper;

    @Override
    public List<NotificationResponse> findAll(String username) {
        User user = getUser(username);
        return notificationMapper.findByUserId(user.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public NotificationResponse findById(Long id, String username) {
        User user = getUser(username);
        Notification notification = getNotification(id, user.getId());
        return toResponse(notification);
    }

    @Override
    public NotificationResponse markAsRead(Long id, String username) {
        User user = getUser(username);
        Notification notification = getNotification(id, user.getId());
        notificationMapper.markAsRead(notification.getId());
        return toResponse(notificationMapper.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND)));
    }

    @Override
    public void delete(Long id, String username) {
        User user = getUser(username);
        getNotification(id, user.getId());
        if (notificationMapper.delete(id) == 0) {
            throw new AppException(ErrorCode.NOTIFICATION_NOT_FOUND);
        }
    }

    @Override
    public void create(Long userId, String message, String type, Long relatedSpaceId) {
        try {
            Notification notification = Notification.builder()
                    .userId(userId)
                    .message(message)
                    .type(type)
                    .relatedSpaceId(relatedSpaceId)
                    .isRead(false)
                    .build();
            notificationMapper.insert(notification);
        } catch (Exception e) {
            // 알림 생성은 best-effort — 실패해도 호출자의 본 작업(초대/일정/장소/채팅 등)에
            // 영향을 주면 안 되므로 예외를 전파하지 않고 로그만 남긴다.
            log.error("알림 생성 실패 (userId={}, type={}, relatedSpaceId={})", userId, type, relatedSpaceId, e);
        }
    }

    /* ── private helpers ── */

    private User getUser(String username) {
        return userMapper.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    private Notification getNotification(Long id, Long userId) {
        Notification notification = notificationMapper.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));
        if (!notification.getUserId().equals(userId)) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
        return notification;
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .message(n.getMessage())
                .type(n.getType())
                .relatedSpaceId(n.getRelatedSpaceId())
                .isRead(n.isRead())
                .createdAt(n.getCreatedAt())
                .readAt(n.getReadAt())
                .build();
    }
}

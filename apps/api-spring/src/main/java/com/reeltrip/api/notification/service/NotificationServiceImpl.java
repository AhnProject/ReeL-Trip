package com.reeltrip.api.notification.service;

import com.reeltrip.api.auth.mapper.UserMapper;
import com.reeltrip.api.auth.model.User;
import com.reeltrip.api.common.exception.AppException;
import com.reeltrip.api.common.exception.ErrorCode;
import com.reeltrip.api.notification.dto.NotificationResponse;
import com.reeltrip.api.notification.dto.NotificationSettingsResponse;
import com.reeltrip.api.notification.dto.UpdateNotificationSettingsRequest;
import com.reeltrip.api.notification.mapper.NotificationMapper;
import com.reeltrip.api.notification.mapper.NotificationSettingsMapper;
import com.reeltrip.api.notification.model.Notification;
import com.reeltrip.api.notification.model.NotificationSettings;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationMapper notificationMapper;
    private final NotificationSettingsMapper notificationSettingsMapper;
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
            if (isSuppressedByUserSettings(userId, type)) {
                return;
            }
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

    /**
     * member/schedule/place 알림은 사용자의 알림 설정(memberJoin/scheduleChange/newPlace)이
     * false면 생성을 건너뛴다. chat은 설정 화면에 토글이 없어 항상 생성하고,
     * aiRecommend는 애초에 알림을 만들지 않는 기존 설계이므로 여기서 다루지 않는다.
     */
    private boolean isSuppressedByUserSettings(Long userId, String type) {
        if (!"member".equals(type) && !"schedule".equals(type) && !"place".equals(type)) {
            return false;
        }
        NotificationSettings settings = notificationSettingsMapper.findByUserId(userId).orElse(null);
        if (settings == null) {
            return false; // 설정 행이 없으면 기본값(true)과 동일하게 생성
        }
        return switch (type) {
            case "member" -> !settings.isMemberJoin();
            case "schedule" -> !settings.isScheduleChange();
            case "place" -> !settings.isNewPlace();
            default -> false;
        };
    }

    @Override
    public NotificationSettingsResponse getSettings(String username) {
        User user = getUser(username);
        NotificationSettings settings = notificationSettingsMapper.findByUserId(user.getId())
                .orElseGet(() -> NotificationSettings.builder()
                        .userId(user.getId())
                        .newPlace(true)
                        .scheduleChange(true)
                        .memberJoin(true)
                        .aiRecommend(false)
                        .build());
        return toSettingsResponse(settings);
    }

    @Override
    public NotificationSettingsResponse updateSettings(String username, UpdateNotificationSettingsRequest request) {
        User user = getUser(username);
        NotificationSettings settings = NotificationSettings.builder()
                .userId(user.getId())
                .newPlace(request.getNewPlace())
                .scheduleChange(request.getScheduleChange())
                .memberJoin(request.getMemberJoin())
                .aiRecommend(request.getAiRecommend())
                .build();
        notificationSettingsMapper.upsert(settings);
        return toSettingsResponse(settings);
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

    private NotificationSettingsResponse toSettingsResponse(NotificationSettings s) {
        return NotificationSettingsResponse.builder()
                .newPlace(s.isNewPlace())
                .scheduleChange(s.isScheduleChange())
                .memberJoin(s.isMemberJoin())
                .aiRecommend(s.isAiRecommend())
                .build();
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

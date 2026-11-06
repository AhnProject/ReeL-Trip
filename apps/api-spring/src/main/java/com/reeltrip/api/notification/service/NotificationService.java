package com.reeltrip.api.notification.service;

import com.reeltrip.api.notification.dto.NotificationResponse;
import com.reeltrip.api.notification.dto.NotificationSettingsResponse;
import com.reeltrip.api.notification.dto.UpdateNotificationSettingsRequest;

import java.util.List;

public interface NotificationService {
    List<NotificationResponse> findAll(String username);
    NotificationResponse findById(Long id, String username);
    NotificationResponse markAsRead(Long id, String username);
    void delete(Long id, String username);
    void create(Long userId, String message, String type, Long relatedSpaceId);
    NotificationSettingsResponse getSettings(String username);
    NotificationSettingsResponse updateSettings(String username, UpdateNotificationSettingsRequest request);
}

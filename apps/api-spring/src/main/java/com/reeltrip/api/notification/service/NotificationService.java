package com.reeltrip.api.notification.service;

import com.reeltrip.api.notification.dto.NotificationResponse;

import java.util.List;

public interface NotificationService {
    List<NotificationResponse> findAll(String username);
    NotificationResponse findById(Long id, String username);
    NotificationResponse markAsRead(Long id, String username);
    void delete(Long id, String username);
}

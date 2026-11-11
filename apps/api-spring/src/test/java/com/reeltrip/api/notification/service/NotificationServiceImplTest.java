package com.reeltrip.api.notification.service;

import com.reeltrip.api.auth.mapper.UserMapper;
import com.reeltrip.api.auth.model.User;
import com.reeltrip.api.notification.dto.NotificationSettingsResponse;
import com.reeltrip.api.notification.mapper.NotificationMapper;
import com.reeltrip.api.notification.mapper.NotificationSettingsMapper;
import com.reeltrip.api.notification.model.Notification;
import com.reeltrip.api.notification.model.NotificationSettings;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceImplTest {

    @Mock private NotificationMapper notificationMapper;
    @Mock private NotificationSettingsMapper notificationSettingsMapper;
    @Mock private UserMapper userMapper;

    private NotificationServiceImpl notificationService;

    private static final Long USER_ID = 10L;

    @BeforeEach
    void setUp() {
        notificationService = new NotificationServiceImpl(notificationMapper, notificationSettingsMapper, userMapper);
    }

    @Test
    void create_typeNotCoveredBySettings_alwaysInserts() {
        // "other"/미지정 타입은 isSuppressedByUserSettings 대상이 아니므로 설정 조회 없이 바로 생성
        notificationService.create(USER_ID, "메시지", "other", 1L);

        verify(notificationMapper).insert(any(Notification.class));
        verify(notificationSettingsMapper, never()).findByUserId(any());
    }

    @Test
    void create_memberType_noSettingsRow_defaultsToNotSuppressed() {
        when(notificationSettingsMapper.findByUserId(USER_ID)).thenReturn(Optional.empty());

        notificationService.create(USER_ID, "메시지", "member", 1L);

        verify(notificationMapper).insert(any(Notification.class));
    }

    @Test
    void create_memberType_suppressedWhenSettingIsFalse() {
        NotificationSettings settings = NotificationSettings.builder()
                .userId(USER_ID).memberJoin(false).scheduleChange(true).newPlace(true).chat(true).build();
        when(notificationSettingsMapper.findByUserId(USER_ID)).thenReturn(Optional.of(settings));

        notificationService.create(USER_ID, "메시지", "member", 1L);

        verify(notificationMapper, never()).insert(any());
    }

    @Test
    void create_chatType_allowedWhenSettingIsTrue() {
        NotificationSettings settings = NotificationSettings.builder()
                .userId(USER_ID).chat(true).memberJoin(true).scheduleChange(true).newPlace(true).build();
        when(notificationSettingsMapper.findByUserId(USER_ID)).thenReturn(Optional.of(settings));

        notificationService.create(USER_ID, "메시지", "chat", 1L);

        verify(notificationMapper).insert(any(Notification.class));
    }

    @Test
    void create_isBestEffort_doesNotPropagateExceptions() {
        when(notificationSettingsMapper.findByUserId(USER_ID)).thenReturn(Optional.empty());
        doThrow(new RuntimeException("DB down")).when(notificationMapper).insert(any());

        assertThatCode(() -> notificationService.create(USER_ID, "메시지", "member", 1L))
                .doesNotThrowAnyException();
    }

    @Test
    void getSettings_noExistingRow_returnsDefaults() {
        User user = User.builder().id(USER_ID).username("alice").build();
        when(userMapper.findByUsername("alice")).thenReturn(Optional.of(user));
        when(notificationSettingsMapper.findByUserId(USER_ID)).thenReturn(Optional.empty());

        NotificationSettingsResponse response = notificationService.getSettings("alice");

        assertThat(response.isNewPlace()).isTrue();
        assertThat(response.isScheduleChange()).isTrue();
        assertThat(response.isMemberJoin()).isTrue();
        assertThat(response.isChat()).isTrue();
        assertThat(response.isAiRecommend()).isFalse();
    }
}

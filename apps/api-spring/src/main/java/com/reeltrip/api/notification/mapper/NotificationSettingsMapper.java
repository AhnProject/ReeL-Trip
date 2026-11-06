package com.reeltrip.api.notification.mapper;

import com.reeltrip.api.notification.model.NotificationSettings;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Optional;

@Mapper
public interface NotificationSettingsMapper {

    Optional<NotificationSettings> findByUserId(@Param("userId") Long userId);

    void upsert(NotificationSettings settings);
}

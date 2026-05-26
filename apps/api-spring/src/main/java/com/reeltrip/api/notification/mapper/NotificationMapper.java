package com.reeltrip.api.notification.mapper;

import com.reeltrip.api.notification.model.Notification;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface NotificationMapper {

    List<Notification> findByUserId(@Param("userId") Long userId);

    Optional<Notification> findById(@Param("id") Long id);

    void markAsRead(@Param("id") Long id);

    int delete(@Param("id") Long id);
}

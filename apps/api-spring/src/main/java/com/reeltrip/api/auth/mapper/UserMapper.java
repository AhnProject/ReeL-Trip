package com.reeltrip.api.auth.mapper;

import com.reeltrip.api.auth.model.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Mapper
public interface UserMapper {

    void insert(User user);

    Optional<User> findById(@Param("id") Long id);

    List<User> findByIds(@Param("ids") List<Long> ids);

    Optional<User> findByUsername(@Param("username") String username);

    boolean existsByUsername(@Param("username") String username);

    boolean existsByEmail(@Param("email") String email);

    void updateEmail(@Param("id") Long id, @Param("email") String email);

    Optional<String> findAvatarByUserId(@Param("id") Long id);

    void updateAvatar(@Param("id") Long id, @Param("avatar") String avatar);

    void markAsDeleted(@Param("id") Long id);

    void incrementFailedLoginCount(@Param("id") Long id);

    void lockAccount(@Param("id") Long id, @Param("lockedUntil") LocalDateTime lockedUntil);

    void resetFailedLoginCount(@Param("id") Long id);
}

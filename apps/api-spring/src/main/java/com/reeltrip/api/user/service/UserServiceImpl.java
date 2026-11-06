package com.reeltrip.api.user.service;

import com.reeltrip.api.auth.mapper.UserMapper;
import com.reeltrip.api.auth.model.User;
import com.reeltrip.api.common.exception.AppException;
import com.reeltrip.api.common.exception.ErrorCode;
import com.reeltrip.api.user.dto.UpdateAvatarRequest;
import com.reeltrip.api.user.dto.UpdateProfileRequest;
import com.reeltrip.api.user.dto.UserProfileResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Base64;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    /** base64로 인코딩되기 전 원본 이미지 기준 최대 용량 (2MB) */
    private static final int MAX_AVATAR_BYTES = 2 * 1024 * 1024;

    private final UserMapper userMapper;

    @Override
    public UserProfileResponse getProfile(String username) {
        User user = userMapper.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        String avatar = userMapper.findAvatarByUserId(user.getId()).orElse(null);
        return toResponse(user, avatar);
    }

    @Override
    public UserProfileResponse updateProfile(String username, UpdateProfileRequest request) {
        User user = userMapper.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userMapper.existsByEmail(request.getEmail())) {
                throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
            }
            userMapper.updateEmail(user.getId(), request.getEmail());
            user.setEmail(request.getEmail());
        }

        String avatar = userMapper.findAvatarByUserId(user.getId()).orElse(null);
        return toResponse(user, avatar);
    }

    @Override
    public UserProfileResponse updateAvatar(String username, UpdateAvatarRequest request) {
        User user = userMapper.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        String avatar = request.getAvatar();
        String base64Part = avatar.contains(",") ? avatar.substring(avatar.indexOf(',') + 1) : avatar;
        byte[] decoded;
        try {
            decoded = Base64.getDecoder().decode(base64Part);
        } catch (IllegalArgumentException e) {
            throw new AppException(ErrorCode.INVALID_AVATAR_FORMAT);
        }
        if (decoded.length > MAX_AVATAR_BYTES) {
            throw new AppException(ErrorCode.AVATAR_TOO_LARGE);
        }

        userMapper.updateAvatar(user.getId(), avatar);
        return toResponse(user, avatar);
    }

    private UserProfileResponse toResponse(User user, String avatar) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .plan("FREE")
                .avatar(avatar)
                .createdAt(user.getCreatedAt())
                .build();
    }
}

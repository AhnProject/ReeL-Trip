package com.reeltrip.api.user.service;

import com.reeltrip.api.auth.mapper.RefreshTokenMapper;
import com.reeltrip.api.auth.mapper.UserMapper;
import com.reeltrip.api.auth.model.User;
import com.reeltrip.api.common.exception.AppException;
import com.reeltrip.api.common.exception.ErrorCode;
import com.reeltrip.api.user.dto.AvatarResponse;
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
    private final RefreshTokenMapper refreshTokenMapper;

    @Override
    public UserProfileResponse getProfile(String username) {
        User user = userMapper.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return toResponse(user);
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

        return toResponse(user);
    }

    @Override
    public AvatarResponse getAvatar(String username) {
        User user = userMapper.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        String avatar = userMapper.findAvatarByUserId(user.getId()).orElse(null);
        return AvatarResponse.builder().avatar(avatar).build();
    }

    @Override
    public AvatarResponse updateAvatar(String username, UpdateAvatarRequest request) {
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
        if (!isValidImage(decoded)) {
            throw new AppException(ErrorCode.INVALID_AVATAR_FORMAT);
        }

        userMapper.updateAvatar(user.getId(), avatar);
        return AvatarResponse.builder().avatar(avatar).build();
    }

    @Override
    public void deleteAccount(String username) {
        User user = userMapper.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        userMapper.markAsDeleted(user.getId());
        refreshTokenMapper.deleteByUserId(user.getId());
    }

    /** JPEG/PNG/WebP 매직 바이트로 실제 이미지 파일인지 확인 (임의 바이너리 업로드 방지) */
    private boolean isValidImage(byte[] data) {
        if (data.length >= 3
                && (data[0] & 0xFF) == 0xFF && (data[1] & 0xFF) == 0xD8 && (data[2] & 0xFF) == 0xFF) {
            return true; // JPEG
        }
        if (data.length >= 8
                && (data[0] & 0xFF) == 0x89 && data[1] == 0x50 && data[2] == 0x4E && data[3] == 0x47
                && data[4] == 0x0D && data[5] == 0x0A && data[6] == 0x1A && data[7] == 0x0A) {
            return true; // PNG
        }
        if (data.length >= 12
                && data[0] == 'R' && data[1] == 'I' && data[2] == 'F' && data[3] == 'F'
                && data[8] == 'W' && data[9] == 'E' && data[10] == 'B' && data[11] == 'P') {
            return true; // WebP
        }
        return false;
    }

    private UserProfileResponse toResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .plan("FREE")
                .createdAt(user.getCreatedAt())
                .build();
    }
}

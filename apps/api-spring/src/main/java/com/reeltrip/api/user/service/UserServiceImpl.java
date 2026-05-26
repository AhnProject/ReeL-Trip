package com.reeltrip.api.user.service;

import com.reeltrip.api.auth.mapper.UserMapper;
import com.reeltrip.api.auth.model.User;
import com.reeltrip.api.common.exception.AppException;
import com.reeltrip.api.common.exception.ErrorCode;
import com.reeltrip.api.user.dto.UpdateProfileRequest;
import com.reeltrip.api.user.dto.UserProfileResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;

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

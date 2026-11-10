package com.reeltrip.api.user.service;

import com.reeltrip.api.user.dto.AvatarResponse;
import com.reeltrip.api.user.dto.UpdateAvatarRequest;
import com.reeltrip.api.user.dto.UpdateProfileRequest;
import com.reeltrip.api.user.dto.UserProfileResponse;

public interface UserService {
    UserProfileResponse getProfile(String username);
    UserProfileResponse updateProfile(String username, UpdateProfileRequest request);
    AvatarResponse getAvatar(String username);
    AvatarResponse updateAvatar(String username, UpdateAvatarRequest request);
    void deleteAccount(String username);
}

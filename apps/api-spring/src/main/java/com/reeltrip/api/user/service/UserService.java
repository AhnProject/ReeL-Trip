package com.reeltrip.api.user.service;

import com.reeltrip.api.user.dto.UpdateProfileRequest;
import com.reeltrip.api.user.dto.UserProfileResponse;

public interface UserService {
    UserProfileResponse getProfile(String username);
    UserProfileResponse updateProfile(String username, UpdateProfileRequest request);
}

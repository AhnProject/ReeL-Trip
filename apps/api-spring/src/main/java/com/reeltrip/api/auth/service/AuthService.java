package com.reeltrip.api.auth.service;

import com.reeltrip.api.auth.dto.AuthResponse;
import com.reeltrip.api.auth.dto.LoginRequest;
import com.reeltrip.api.auth.dto.SignupRequest;

public interface AuthService {

    AuthResponse signup(SignupRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refresh(String refreshToken);

    void logout(String refreshToken);
}

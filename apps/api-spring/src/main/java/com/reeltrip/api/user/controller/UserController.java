package com.reeltrip.api.user.controller;

import com.reeltrip.api.common.response.ApiResponse;
import com.reeltrip.api.user.dto.UpdateAvatarRequest;
import com.reeltrip.api.user.dto.UpdateProfileRequest;
import com.reeltrip.api.user.dto.UserProfileResponse;
import com.reeltrip.api.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@Tag(name = "User", description = "사용자 프로필")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Operation(summary = "내 프로필 조회")
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(Principal principal) {
        return ResponseEntity.ok(ApiResponse.success(userService.getProfile(principal.getName())));
    }

    @Operation(summary = "내 프로필 수정")
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            Principal principal,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.success(userService.updateProfile(principal.getName(), request)));
    }

    @Operation(summary = "프로필 사진 변경", description = "base64로 인코딩된 이미지(데이터 URL 형식 가능)를 받아 저장합니다. 원본 이미지 기준 2MB를 초과하면 실패합니다.")
    @PutMapping("/avatar")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateAvatar(
            Principal principal,
            @Valid @RequestBody UpdateAvatarRequest request) {
        return ResponseEntity.ok(ApiResponse.success(userService.updateAvatar(principal.getName(), request)));
    }
}

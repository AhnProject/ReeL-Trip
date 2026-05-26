package com.reeltrip.api.notification.controller;

import com.reeltrip.api.common.response.ApiResponse;
import com.reeltrip.api.notification.dto.NotificationResponse;
import com.reeltrip.api.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@Tag(name = "Notifications", description = "알림 관리")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @Operation(summary = "내 알림 목록 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> findAll(Principal principal) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.findAll(principal.getName())));
    }

    @Operation(summary = "알림 단건 조회")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NotificationResponse>> findById(
            @PathVariable Long id,
            Principal principal) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.findById(id, principal.getName())));
    }

    @Operation(summary = "알림 읽음 처리")
    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(
            @PathVariable Long id,
            Principal principal) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.markAsRead(id, principal.getName())));
    }

    @Operation(summary = "알림 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            Principal principal) {
        notificationService.delete(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

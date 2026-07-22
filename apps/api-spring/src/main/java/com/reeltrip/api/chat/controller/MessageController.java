package com.reeltrip.api.chat.controller;

import com.reeltrip.api.chat.dto.MessageResponse;
import com.reeltrip.api.chat.dto.SendMessageRequest;
import com.reeltrip.api.chat.service.MessageService;
import com.reeltrip.api.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@Tag(name = "Messages", description = "채팅 메시지 관리")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @Operation(summary = "채팅 메시지 목록 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<List<MessageResponse>>> findBySpaceId(
            @RequestParam Long spaceId,
            Principal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                messageService.findBySpaceId(spaceId, principal.getName())));
    }

    @Operation(summary = "메시지 전송")
    @PostMapping
    public ResponseEntity<ApiResponse<MessageResponse>> send(
            @Valid @RequestBody SendMessageRequest request,
            Principal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                messageService.send(request, principal.getName())));
    }
}

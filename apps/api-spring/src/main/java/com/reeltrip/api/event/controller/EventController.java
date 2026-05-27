package com.reeltrip.api.event.controller;

import com.reeltrip.api.common.response.ApiResponse;
import com.reeltrip.api.event.dto.CreateEventRequest;
import com.reeltrip.api.event.dto.EventResponse;
import com.reeltrip.api.event.dto.UpdateEventRequest;
import com.reeltrip.api.event.service.EventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@Tag(name = "Events", description = "팀스페이스 일정 관리")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @Operation(summary = "일정 생성")
    @PostMapping
    public ResponseEntity<ApiResponse<EventResponse>> create(
            @Valid @RequestBody CreateEventRequest request,
            Principal principal) {
        return ResponseEntity.ok(ApiResponse.success(eventService.create(request, principal.getName())));
    }

    @Operation(summary = "스페이스 일정 목록 조회", description = "month=YYYY-MM 파라미터로 월별 필터링")
    @GetMapping
    public ResponseEntity<ApiResponse<List<EventResponse>>> findBySpace(
            @RequestParam Long spaceId,
            @RequestParam(required = false) String month,
            Principal principal) {
        return ResponseEntity.ok(ApiResponse.success(eventService.findBySpace(spaceId, month, principal.getName())));
    }

    @Operation(summary = "일정 단건 조회")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EventResponse>> findById(
            @PathVariable Long id,
            Principal principal) {
        return ResponseEntity.ok(ApiResponse.success(eventService.findById(id, principal.getName())));
    }

    @Operation(summary = "일정 수정")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EventResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateEventRequest request,
            Principal principal) {
        return ResponseEntity.ok(ApiResponse.success(eventService.update(id, request, principal.getName())));
    }

    @Operation(summary = "일정 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            Principal principal) {
        eventService.delete(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

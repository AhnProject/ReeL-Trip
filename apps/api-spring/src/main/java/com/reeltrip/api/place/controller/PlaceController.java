package com.reeltrip.api.place.controller;

import com.reeltrip.api.common.response.ApiResponse;
import com.reeltrip.api.place.dto.AddPlaceRequest;
import com.reeltrip.api.place.dto.PlaceResponse;
import com.reeltrip.api.place.service.PlaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@Tag(name = "Places", description = "팀스페이스 장소 관리")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/places")
@RequiredArgsConstructor
public class PlaceController {

    private final PlaceService placeService;

    @Operation(summary = "장소 추가")
    @PostMapping
    public ResponseEntity<ApiResponse<PlaceResponse>> add(
            @Valid @RequestBody AddPlaceRequest request,
            Principal principal) {
        return ResponseEntity.ok(ApiResponse.success(placeService.add(request, principal.getName())));
    }

    @Operation(summary = "스페이스 장소 목록 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<List<PlaceResponse>>> findBySpace(
            @RequestParam Long spaceId,
            Principal principal) {
        return ResponseEntity.ok(ApiResponse.success(placeService.findBySpace(spaceId, principal.getName())));
    }

    @Operation(summary = "장소 단건 조회")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PlaceResponse>> findById(
            @PathVariable Long id,
            Principal principal) {
        return ResponseEntity.ok(ApiResponse.success(placeService.findById(id, principal.getName())));
    }

    @Operation(summary = "장소 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            Principal principal) {
        placeService.delete(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

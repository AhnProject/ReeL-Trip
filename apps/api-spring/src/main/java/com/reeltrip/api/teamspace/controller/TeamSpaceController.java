package com.reeltrip.api.teamspace.controller;

import com.reeltrip.api.common.response.ApiResponse;
import com.reeltrip.api.teamspace.dto.*;
import com.reeltrip.api.teamspace.service.TeamSpaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@Tag(name = "TeamSpaces", description = "팀스페이스 관리")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/teamspaces")
@RequiredArgsConstructor
public class TeamSpaceController {

    private final TeamSpaceService teamSpaceService;

    @Operation(summary = "팀스페이스 생성")
    @PostMapping
    public ResponseEntity<ApiResponse<TeamSpaceResponse>> create(
            @Valid @RequestBody CreateTeamSpaceRequest request,
            Principal principal) {
        return ResponseEntity.ok(ApiResponse.success(teamSpaceService.create(request, principal.getName())));
    }

    @Operation(summary = "내 팀스페이스 목록 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<List<TeamSpaceResponse>>> findAll(Principal principal) {
        return ResponseEntity.ok(ApiResponse.success(teamSpaceService.findAll(principal.getName())));
    }

    @Operation(summary = "팀스페이스 단건 조회")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TeamSpaceResponse>> findById(
            @PathVariable Long id,
            Principal principal) {
        return ResponseEntity.ok(ApiResponse.success(teamSpaceService.findById(id, principal.getName())));
    }

    @Operation(summary = "팀스페이스 수정")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TeamSpaceResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTeamSpaceRequest request,
            Principal principal) {
        return ResponseEntity.ok(ApiResponse.success(teamSpaceService.update(id, request, principal.getName())));
    }

    @Operation(summary = "팀스페이스 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            Principal principal) {
        teamSpaceService.delete(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "멤버 초대")
    @PostMapping("/{id}/members")
    public ResponseEntity<ApiResponse<MemberResponse>> inviteMember(
            @PathVariable Long id,
            @Valid @RequestBody InviteMemberRequest request,
            Principal principal) {
        return ResponseEntity.ok(ApiResponse.success(teamSpaceService.inviteMember(id, request, principal.getName())));
    }

    @Operation(summary = "멤버 목록 조회")
    @GetMapping("/{id}/members")
    public ResponseEntity<ApiResponse<List<MemberResponse>>> findMembers(
            @PathVariable Long id,
            Principal principal) {
        return ResponseEntity.ok(ApiResponse.success(teamSpaceService.findMembers(id, principal.getName())));
    }

    @Operation(summary = "멤버 제거")
    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable Long id,
            @PathVariable Long userId,
            Principal principal) {
        teamSpaceService.removeMember(id, userId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

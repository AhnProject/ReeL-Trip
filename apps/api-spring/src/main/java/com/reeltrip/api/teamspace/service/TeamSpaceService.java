package com.reeltrip.api.teamspace.service;

import com.reeltrip.api.teamspace.dto.*;

import java.util.List;

public interface TeamSpaceService {
    TeamSpaceResponse create(CreateTeamSpaceRequest request, String username);
    List<TeamSpaceResponse> findAll(String username);
    TeamSpaceResponse findById(Long id, String username);
    TeamSpaceResponse update(Long id, UpdateTeamSpaceRequest request, String username);
    void delete(Long id, String username);
    MemberResponse inviteMember(Long spaceId, InviteMemberRequest request, String username);
    List<MemberResponse> findMembers(Long spaceId, String username);
    void removeMember(Long spaceId, Long userId, String username);
}

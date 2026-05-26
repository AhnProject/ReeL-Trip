package com.reeltrip.api.teamspace.service;

import com.reeltrip.api.auth.mapper.UserMapper;
import com.reeltrip.api.auth.model.User;
import com.reeltrip.api.common.exception.AppException;
import com.reeltrip.api.common.exception.ErrorCode;
import com.reeltrip.api.teamspace.dto.*;
import com.reeltrip.api.teamspace.mapper.TeamSpaceMapper;
import com.reeltrip.api.teamspace.model.TeamSpace;
import com.reeltrip.api.teamspace.model.TeamSpaceMember;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamSpaceServiceImpl implements TeamSpaceService {

    private final TeamSpaceMapper teamSpaceMapper;
    private final UserMapper userMapper;

    @Override
    public TeamSpaceResponse create(CreateTeamSpaceRequest request, String username) {
        User owner = getUser(username);

        TeamSpace space = TeamSpace.builder()
                .name(request.getName())
                .emoji(request.getEmoji())
                .bgColor(request.getBgColor())
                .ownerId(owner.getId())
                .build();

        teamSpaceMapper.insert(space);

        // 생성자를 owner로 멤버 추가
        TeamSpaceMember member = TeamSpaceMember.builder()
                .spaceId(space.getId())
                .userId(owner.getId())
                .username(owner.getUsername())
                .role("owner")
                .build();
        teamSpaceMapper.insertMember(member);

        return toResponse(space, teamSpaceMapper.findMembersBySpaceId(space.getId()));
    }

    @Override
    public List<TeamSpaceResponse> findAll(String username) {
        User user = getUser(username);
        return teamSpaceMapper.findByUserId(user.getId()).stream()
                .map(space -> toResponse(space, teamSpaceMapper.findMembersBySpaceId(space.getId())))
                .toList();
    }

    @Override
    public TeamSpaceResponse findById(Long id, String username) {
        User user = getUser(username);
        TeamSpace space = getSpace(id);
        checkMember(space.getId(), user.getId());
        return toResponse(space, teamSpaceMapper.findMembersBySpaceId(id));
    }

    @Override
    public TeamSpaceResponse update(Long id, UpdateTeamSpaceRequest request, String username) {
        User user = getUser(username);
        TeamSpace space = getSpace(id);
        checkOwner(space, user.getId());

        space.setName(request.getName());
        space.setEmoji(request.getEmoji());
        space.setBgColor(request.getBgColor());
        teamSpaceMapper.update(space);

        return toResponse(space, teamSpaceMapper.findMembersBySpaceId(id));
    }

    @Override
    public void delete(Long id, String username) {
        User user = getUser(username);
        TeamSpace space = getSpace(id);
        checkOwner(space, user.getId());
        teamSpaceMapper.delete(id);
    }

    @Override
    public MemberResponse inviteMember(Long spaceId, InviteMemberRequest request, String username) {
        User requester = getUser(username);
        TeamSpace space = getSpace(spaceId);
        checkMember(space.getId(), requester.getId());

        User invitee = userMapper.findByUsername(request.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (teamSpaceMapper.existsMember(spaceId, invitee.getId())) {
            throw new AppException(ErrorCode.ALREADY_MEMBER);
        }

        TeamSpaceMember member = TeamSpaceMember.builder()
                .spaceId(spaceId)
                .userId(invitee.getId())
                .username(invitee.getUsername())
                .role("member")
                .build();
        teamSpaceMapper.insertMember(member);

        return toMemberResponse(member);
    }

    @Override
    public List<MemberResponse> findMembers(Long spaceId, String username) {
        User user = getUser(username);
        getSpace(spaceId);
        checkMember(spaceId, user.getId());
        return teamSpaceMapper.findMembersBySpaceId(spaceId).stream()
                .map(this::toMemberResponse)
                .toList();
    }

    @Override
    public void removeMember(Long spaceId, Long userId, String username) {
        User requester = getUser(username);
        TeamSpace space = getSpace(spaceId);
        checkOwner(space, requester.getId());

        if (!teamSpaceMapper.existsMember(spaceId, userId)) {
            throw new AppException(ErrorCode.MEMBER_NOT_FOUND);
        }
        teamSpaceMapper.deleteMember(spaceId, userId);
    }

    /* ── private helpers ── */

    private User getUser(String username) {
        return userMapper.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    private TeamSpace getSpace(Long id) {
        return teamSpaceMapper.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TEAM_SPACE_NOT_FOUND));
    }

    private void checkOwner(TeamSpace space, Long userId) {
        if (!space.getOwnerId().equals(userId)) {
            throw new AppException(ErrorCode.TEAM_SPACE_ACCESS_DENIED);
        }
    }

    private void checkMember(Long spaceId, Long userId) {
        if (!teamSpaceMapper.existsMember(spaceId, userId)) {
            throw new AppException(ErrorCode.TEAM_SPACE_ACCESS_DENIED);
        }
    }

    private TeamSpaceResponse toResponse(TeamSpace space, List<TeamSpaceMember> members) {
        return TeamSpaceResponse.builder()
                .id(space.getId())
                .name(space.getName())
                .emoji(space.getEmoji())
                .bgColor(space.getBgColor())
                .ownerId(space.getOwnerId())
                .members(members.stream().map(this::toMemberResponse).toList())
                .createdAt(space.getCreatedAt())
                .updatedAt(space.getUpdatedAt())
                .build();
    }

    private MemberResponse toMemberResponse(TeamSpaceMember m) {
        return MemberResponse.builder()
                .userId(m.getUserId())
                .username(m.getUsername())
                .role(m.getRole())
                .joinedAt(m.getJoinedAt())
                .build();
    }
}

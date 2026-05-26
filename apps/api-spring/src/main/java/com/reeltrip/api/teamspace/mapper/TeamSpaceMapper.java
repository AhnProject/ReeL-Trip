package com.reeltrip.api.teamspace.mapper;

import com.reeltrip.api.teamspace.model.TeamSpace;
import com.reeltrip.api.teamspace.model.TeamSpaceMember;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface TeamSpaceMapper {

    void insert(TeamSpace teamSpace);

    Optional<TeamSpace> findById(@Param("id") Long id);

    List<TeamSpace> findByUserId(@Param("userId") Long userId);

    void update(TeamSpace teamSpace);

    void delete(@Param("id") Long id);

    // 멤버
    void insertMember(TeamSpaceMember member);

    List<TeamSpaceMember> findMembersBySpaceId(@Param("spaceId") Long spaceId);

    Optional<TeamSpaceMember> findMember(@Param("spaceId") Long spaceId, @Param("userId") Long userId);

    boolean existsMember(@Param("spaceId") Long spaceId, @Param("userId") Long userId);

    void deleteMember(@Param("spaceId") Long spaceId, @Param("userId") Long userId);
}

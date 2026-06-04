package com.reeltrip.api.auth.mapper;

import com.reeltrip.api.auth.model.RefreshToken;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Optional;

@Mapper
public interface RefreshTokenMapper {

    void insert(RefreshToken refreshToken);

    Optional<RefreshToken> findByToken(@Param("token") String token);

    void deleteByUserId(@Param("userId") Long userId);

    void deleteByToken(@Param("token") String token);
}

package com.reeltrip.api.auth.service;

import com.reeltrip.api.auth.dto.LoginRequest;
import com.reeltrip.api.auth.mapper.RefreshTokenMapper;
import com.reeltrip.api.auth.mapper.UserMapper;
import com.reeltrip.api.auth.model.RefreshToken;
import com.reeltrip.api.auth.model.User;
import com.reeltrip.api.common.exception.AppException;
import com.reeltrip.api.common.exception.ErrorCode;
import com.reeltrip.api.common.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock private UserMapper userMapper;
    @Mock private RefreshTokenMapper refreshTokenMapper;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtil jwtUtil;

    private AuthServiceImpl authService;

    @BeforeEach
    void setUp() {
        authService = new AuthServiceImpl(userMapper, refreshTokenMapper, passwordEncoder, jwtUtil);
        ReflectionTestUtils.setField(authService, "refreshExpiresInMs", 2592000000L);
        ReflectionTestUtils.setField(authService, "maxFailedAttempts", 5);
        ReflectionTestUtils.setField(authService, "lockoutDurationMinutes", 15L);
    }

    private User activeUser() {
        return User.builder()
                .id(1L)
                .username("alice")
                .password("hashed")
                .email("alice@example.com")
                .role("USER")
                .isDeleted(false)
                .failedLoginCount(0)
                .build();
    }

    @Test
    void login_success_resetsFailedCountAndIssuesTokens() {
        User user = activeUser();
        LoginRequest request = new LoginRequest();
        request.setUsername("alice");
        request.setPassword("correct");

        when(userMapper.findByUsername("alice")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("correct", "hashed")).thenReturn(true);
        when(jwtUtil.generateToken("alice", "USER")).thenReturn("access-token");

        var response = authService.login(request);

        assertThat(response.getAccessToken()).isEqualTo("access-token");
        assertThat(response.getUsername()).isEqualTo("alice");
        verify(userMapper).resetFailedLoginCount(1L);
        verify(refreshTokenMapper).deleteByUserId(1L);
        verify(refreshTokenMapper).insert(any(RefreshToken.class));
    }

    @Test
    void login_unknownUsername_throwsInvalidCredentials() {
        LoginRequest request = new LoginRequest();
        request.setUsername("ghost");
        request.setPassword("whatever");

        when(userMapper.findByUsername("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(AppException.class)
                .extracting(e -> ((AppException) e).getErrorCode())
                .isEqualTo(ErrorCode.INVALID_CREDENTIALS);
    }

    @Test
    void login_wrongPassword_incrementsCountButDoesNotLockBelowThreshold() {
        User user = activeUser();
        user.setFailedLoginCount(0);
        LoginRequest request = new LoginRequest();
        request.setUsername("alice");
        request.setPassword("wrong");

        when(userMapper.findByUsername("alice")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(AppException.class)
                .extracting(e -> ((AppException) e).getErrorCode())
                .isEqualTo(ErrorCode.INVALID_CREDENTIALS);

        verify(userMapper).incrementFailedLoginCount(1L);
        verify(userMapper, never()).lockAccount(anyLong(), any());
    }

    @Test
    void login_wrongPassword_reachingThresholdLocksAccount() {
        User user = activeUser();
        user.setFailedLoginCount(4); // 다음 실패(5번째)로 임계값(5) 도달
        LoginRequest request = new LoginRequest();
        request.setUsername("alice");
        request.setPassword("wrong");

        when(userMapper.findByUsername("alice")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request)).isInstanceOf(AppException.class);

        verify(userMapper).incrementFailedLoginCount(1L);
        verify(userMapper).lockAccount(eq(1L), any(LocalDateTime.class));
    }

    @Test
    void login_accountLocked_rejectsBeforeCheckingPassword() {
        User user = activeUser();
        user.setLockedUntil(LocalDateTime.now().plusMinutes(10));
        LoginRequest request = new LoginRequest();
        request.setUsername("alice");
        request.setPassword("whatever");

        when(userMapper.findByUsername("alice")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(AppException.class)
                .extracting(e -> ((AppException) e).getErrorCode())
                .isEqualTo(ErrorCode.ACCOUNT_LOCKED);

        verify(passwordEncoder, never()).matches(any(), any());
    }

    @Test
    void login_deletedAccount_rejectsAfterPasswordMatches() {
        User user = activeUser();
        user.setDeleted(true);
        LoginRequest request = new LoginRequest();
        request.setUsername("alice");
        request.setPassword("correct");

        when(userMapper.findByUsername("alice")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("correct", "hashed")).thenReturn(true);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(AppException.class)
                .extracting(e -> ((AppException) e).getErrorCode())
                .isEqualTo(ErrorCode.ACCOUNT_DELETED);
    }

    @Test
    void refresh_success_issuesNewTokens() {
        RefreshToken rt = RefreshToken.builder()
                .id(10L).userId(1L).token("rt-token")
                .expiresAt(LocalDateTime.now().plusDays(1))
                .build();
        User user = activeUser();

        when(refreshTokenMapper.findByToken("rt-token")).thenReturn(Optional.of(rt));
        when(userMapper.findById(1L)).thenReturn(Optional.of(user));
        when(jwtUtil.generateToken("alice", "USER")).thenReturn("access-token-2");

        var response = authService.refresh("rt-token");

        assertThat(response.getAccessToken()).isEqualTo("access-token-2");
    }

    @Test
    void refresh_expiredToken_deletesAndThrows() {
        RefreshToken rt = RefreshToken.builder()
                .id(10L).userId(1L).token("rt-token")
                .expiresAt(LocalDateTime.now().minusMinutes(1))
                .build();

        when(refreshTokenMapper.findByToken("rt-token")).thenReturn(Optional.of(rt));

        assertThatThrownBy(() -> authService.refresh("rt-token"))
                .isInstanceOf(AppException.class)
                .extracting(e -> ((AppException) e).getErrorCode())
                .isEqualTo(ErrorCode.REFRESH_TOKEN_EXPIRED);

        verify(refreshTokenMapper).deleteByToken("rt-token");
    }

    @Test
    void refresh_deletedAccount_rejects() {
        // 묶음 B의 TOCTOU 보강(커밋 ff2f1f6) 검증 — refresh()도 login()과 동일하게 탈퇴 계정을 거부해야 함
        RefreshToken rt = RefreshToken.builder()
                .id(10L).userId(1L).token("rt-token")
                .expiresAt(LocalDateTime.now().plusDays(1))
                .build();
        User user = activeUser();
        user.setDeleted(true);

        when(refreshTokenMapper.findByToken("rt-token")).thenReturn(Optional.of(rt));
        when(userMapper.findById(1L)).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.refresh("rt-token"))
                .isInstanceOf(AppException.class)
                .extracting(e -> ((AppException) e).getErrorCode())
                .isEqualTo(ErrorCode.ACCOUNT_DELETED);
    }
}

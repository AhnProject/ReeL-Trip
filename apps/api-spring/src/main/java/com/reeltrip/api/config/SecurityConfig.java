package com.reeltrip.api.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.reeltrip.api.common.response.ApiResponse;
import com.reeltrip.api.common.security.JwtAuthenticationFilter;
import com.reeltrip.api.common.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtUtil, objectMapper);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:3000"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // 루트 및 문서
                .requestMatchers("/", "/doc", "/docs", "/docs/**").permitAll()
                .requestMatchers("/v3/api-docs/**", "/v3/api-docs").permitAll()
                // 인증 불필요 엔드포인트
                .requestMatchers("/api/auth/signup", "/api/auth/login").permitAll()
                .requestMatchers("/api/documents/health").permitAll()
                .requestMatchers("/api/recommend", "/api/recommend/**").permitAll()
                // 인증 필요 엔드포인트
                .requestMatchers("/api/user/**").authenticated()
                .requestMatchers("/api/teamspaces/**").authenticated()
                .requestMatchers("/api/events/**").authenticated()
                .requestMatchers("/api/places/**").authenticated()
                .requestMatchers("/api/notifications/**").authenticated()
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, e) -> {
                    response.setStatus(401);
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.setCharacterEncoding("UTF-8");
                    response.getWriter().write(
                        objectMapper.writeValueAsString(
                            ApiResponse.error("Unauthorized", "UNAUTHORIZED"))
                    );
                })
                .accessDeniedHandler((request, response, e) -> {
                    response.setStatus(403);
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.setCharacterEncoding("UTF-8");
                    response.getWriter().write(
                        objectMapper.writeValueAsString(
                            ApiResponse.error("Access denied", "ACCESS_DENIED"))
                    );
                })
            )
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

package com.reeltrip.api.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // Auth
    USERNAME_ALREADY_EXISTS(HttpStatus.BAD_REQUEST, "Username already exists"),
    EMAIL_ALREADY_EXISTS(HttpStatus.BAD_REQUEST, "Email already exists"),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "Invalid credentials"),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "User not found"),
    TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "Token has expired"),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "Invalid token"),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "Unauthorized"),
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "Access denied"),

    // Document
    DOCUMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "Document not found"),
    INVALID_VECTOR_DIMENSION(HttpStatus.BAD_REQUEST, "Invalid vector dimension"),
    DATABASE_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Database error"),
    INVALID_INPUT(HttpStatus.BAD_REQUEST, "Invalid input"),

    // URL Parser
    UNSUPPORTED_URL(HttpStatus.BAD_REQUEST, "Unsupported URL type"),
    PRIVATE_CONTENT(HttpStatus.UNPROCESSABLE_ENTITY, "Content is private or unavailable"),
    EXTRACTION_FAILED(HttpStatus.UNPROCESSABLE_ENTITY, "Failed to extract travel information"),
    APIFY_ERROR(HttpStatus.BAD_GATEWAY, "Apify API error"),
    APIFY_NOT_CONFIGURED(HttpStatus.INTERNAL_SERVER_ERROR, "Apify API token not configured"),

    // AI
    OPENAI_API_KEY_MISSING(HttpStatus.INTERNAL_SERVER_ERROR, "OpenAI API key is not configured"),
    ANTHROPIC_API_KEY_MISSING(HttpStatus.INTERNAL_SERVER_ERROR, "Anthropic API key is not configured"),
    AI_RESPONSE_PARSE_ERROR(HttpStatus.BAD_GATEWAY, "Failed to parse AI response"),

    // TeamSpace
    TEAM_SPACE_NOT_FOUND(HttpStatus.NOT_FOUND, "Team space not found"),
    TEAM_SPACE_ACCESS_DENIED(HttpStatus.FORBIDDEN, "No access to this team space"),
    ALREADY_MEMBER(HttpStatus.BAD_REQUEST, "User is already a member"),
    MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "Member not found"),

    // Event
    EVENT_NOT_FOUND(HttpStatus.NOT_FOUND, "Event not found"),
    EVENT_ACCESS_DENIED(HttpStatus.FORBIDDEN, "No access to this event"),

    // Place
    PLACE_NOT_FOUND(HttpStatus.NOT_FOUND, "Place not found"),
    PLACE_ACCESS_DENIED(HttpStatus.FORBIDDEN, "No access to this place"),

    // Notification
    NOTIFICATION_NOT_FOUND(HttpStatus.NOT_FOUND, "Notification not found"),

    // Validation
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "Validation failed"),

    // Generic
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error");

    private final HttpStatus httpStatus;
    private final String defaultMessage;
}

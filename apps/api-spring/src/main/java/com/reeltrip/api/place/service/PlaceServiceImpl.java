package com.reeltrip.api.place.service;

import com.reeltrip.api.ai.service.AiService;
import com.reeltrip.api.auth.mapper.UserMapper;
import com.reeltrip.api.auth.model.User;
import com.reeltrip.api.common.exception.AppException;
import com.reeltrip.api.common.exception.ErrorCode;
import com.reeltrip.api.place.dto.AddPlaceRequest;
import com.reeltrip.api.place.dto.PlaceResponse;
import com.reeltrip.api.place.dto.SimilarPlaceResponse;
import com.reeltrip.api.place.dto.UpdatePlaceRequest;
import com.reeltrip.api.notification.service.NotificationService;
import com.reeltrip.api.place.mapper.PlaceMapper;
import com.reeltrip.api.place.model.Place;
import com.reeltrip.api.teamspace.mapper.TeamSpaceMapper;
import com.reeltrip.api.teamspace.model.TeamSpaceMember;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PlaceServiceImpl implements PlaceService {

    /** "비슷한 장소" 추천 개수 기본값 */
    private static final int SIMILAR_PLACES_LIMIT = 10;

    private final PlaceMapper placeMapper;
    private final TeamSpaceMapper teamSpaceMapper;
    private final UserMapper userMapper;
    private final NotificationService notificationService;
    private final AiService aiService;

    @Override
    public PlaceResponse add(AddPlaceRequest request, String username) {
        User user = getUser(username);
        checkSpaceMember(request.getSpaceId(), user.getId());

        Place place = Place.builder()
                .spaceId(request.getSpaceId())
                .name(request.getName())
                .category(request.getCategory())
                .address(request.getAddress())
                .region(request.getRegion())
                .country(request.getCountry())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .priceDesc(request.getPriceDesc())
                .priceMin(request.getPriceMin())
                .priceMax(request.getPriceMax())
                .currency(request.getCurrency())
                .hours(request.getHours())
                .thumbnailUrl(request.getThumbnailUrl())
                .sourceUrl(request.getSourceUrl())
                .sourcePlatform(request.getSourcePlatform())
                .tags(request.getTags())
                .menu(request.getMenu())
                .confidence(request.getConfidence())
                .createdBy(user.getId())
                .build();

        placeMapper.insert(place);
        generateEmbeddingBestEffort(place);

        String addMessage = String.format("%s님이 '%s'을 추가했습니다.", user.getUsername(), place.getName());
        notifyOtherMembers(request.getSpaceId(), user.getId(), addMessage);

        return toResponse(placeMapper.findById(place.getId())
                .orElseThrow(() -> new AppException(ErrorCode.PLACE_NOT_FOUND)));
    }

    @Override
    public List<PlaceResponse> findBySpace(Long spaceId, String username) {
        User user = getUser(username);
        checkSpaceMember(spaceId, user.getId());
        return placeMapper.findBySpaceId(spaceId).stream().map(this::toResponse).toList();
    }

    @Override
    public PlaceResponse findById(Long id, String username) {
        User user = getUser(username);
        Place place = getPlace(id);
        checkSpaceMember(place.getSpaceId(), user.getId());
        return toResponse(place);
    }

    @Override
    public PlaceResponse update(Long id, UpdatePlaceRequest request, String username) {
        User user = getUser(username);
        Place place = getPlace(id);
        checkSpaceMember(place.getSpaceId(), user.getId());

        if (request.getName() != null) place.setName(request.getName());
        if (request.getCategory() != null) place.setCategory(request.getCategory());
        if (request.getAddress() != null) place.setAddress(request.getAddress());
        if (request.getRegion() != null) place.setRegion(request.getRegion());
        if (request.getCountry() != null) place.setCountry(request.getCountry());
        if (request.getLatitude() != null) place.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) place.setLongitude(request.getLongitude());
        if (request.getPriceDesc() != null) place.setPriceDesc(request.getPriceDesc());
        if (request.getPriceMin() != null) place.setPriceMin(request.getPriceMin());
        if (request.getPriceMax() != null) place.setPriceMax(request.getPriceMax());
        if (request.getCurrency() != null) place.setCurrency(request.getCurrency());
        if (request.getHours() != null) place.setHours(request.getHours());
        if (request.getThumbnailUrl() != null) place.setThumbnailUrl(request.getThumbnailUrl());
        if (request.getSourceUrl() != null) place.setSourceUrl(request.getSourceUrl());
        if (request.getSourcePlatform() != null) place.setSourcePlatform(request.getSourcePlatform());
        if (request.getTags() != null) place.setTags(request.getTags());
        if (request.getMenu() != null) place.setMenu(request.getMenu());
        if (request.getConfidence() != null) place.setConfidence(request.getConfidence());
        if (request.getConsentGiven() != null) {
            place.setConsentGiven(request.getConsentGiven());
            place.setConsentAt(request.getConsentGiven() ? LocalDateTime.now() : null);
        }

        placeMapper.update(place);
        generateEmbeddingBestEffort(place);

        String updateMessage = String.format("%s님이 '%s' 장소를 확정했습니다.", user.getUsername(), place.getName());
        notifyOtherMembers(place.getSpaceId(), user.getId(), updateMessage);

        return toResponse(placeMapper.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PLACE_NOT_FOUND)));
    }

    @Override
    public void delete(Long id, String username) {
        User user = getUser(username);
        Place place = getPlace(id);
        checkSpaceMember(place.getSpaceId(), user.getId());
        if (placeMapper.delete(id) == 0) {
            throw new AppException(ErrorCode.PLACE_NOT_FOUND);
        }
    }

    @Override
    public List<SimilarPlaceResponse> findSimilar(Long id, String username) {
        User user = getUser(username);
        Place place = getPlace(id);
        checkSpaceMember(place.getSpaceId(), user.getId());

        // 공개동의 안 한 장소는 추천 기능 자체를 쓸 수 없음(묶음 C 공개동의 의미와
        // 대칭 — "내 장소가 추천에 쓰이는 데 동의해야 비슷한 장소도 볼 수 있다")
        if (!place.isConsentGiven()) {
            throw new AppException(ErrorCode.PLACE_CONSENT_REQUIRED);
        }

        return placeMapper.findSimilarPlaces(id, SIMILAR_PLACES_LIMIT);
    }

    /* ── private helpers ── */

    private User getUser(String username) {
        return userMapper.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    private Place getPlace(Long id) {
        return placeMapper.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PLACE_NOT_FOUND));
    }

    private void checkSpaceMember(Long spaceId, Long userId) {
        if (!teamSpaceMapper.existsMember(spaceId, userId)) {
            throw new AppException(ErrorCode.PLACE_ACCESS_DENIED);
        }
    }

    /** "비슷한 장소" 추천용 임베딩 생성 — 실패해도 장소 저장 자체는 영향받지 않는 best-effort 처리 */
    private void generateEmbeddingBestEffort(Place place) {
        try {
            String text = buildEmbeddingText(place);
            if (text.isBlank()) return;

            List<Double> embedding = aiService.createEmbedding(text);
            String embeddingStr = "[" + embedding.stream()
                    .map(Object::toString)
                    .collect(Collectors.joining(",")) + "]";
            placeMapper.updateEmbedding(place.getId(), embeddingStr);
        } catch (Exception e) {
            log.warn("Failed to generate embedding for place {}: {}", place.getId(), e.getMessage());
        }
    }

    private String buildEmbeddingText(Place place) {
        StringBuilder sb = new StringBuilder();
        if (place.getName() != null) sb.append(place.getName()).append(" ");
        if (place.getCategory() != null) sb.append(place.getCategory()).append(" ");
        if (place.getRegion() != null) sb.append(place.getRegion()).append(" ");
        if (place.getCountry() != null) sb.append(place.getCountry()).append(" ");
        if (place.getTags() != null && !place.getTags().isEmpty()) sb.append(String.join(" ", place.getTags()));
        return sb.toString().trim();
    }

    private void notifyOtherMembers(Long spaceId, Long actorId, String message) {
        List<TeamSpaceMember> members = teamSpaceMapper.findMembersBySpaceId(spaceId);
        members.stream()
                .filter(m -> !m.getUserId().equals(actorId))
                .forEach(m -> notificationService.create(m.getUserId(), message, "place", spaceId));
    }

    private PlaceResponse toResponse(Place p) {
        return PlaceResponse.builder()
                .id(p.getId())
                .spaceId(p.getSpaceId())
                .name(p.getName())
                .category(p.getCategory())
                .address(p.getAddress())
                .region(p.getRegion())
                .country(p.getCountry())
                .latitude(p.getLatitude())
                .longitude(p.getLongitude())
                .priceDesc(p.getPriceDesc())
                .priceMin(p.getPriceMin())
                .priceMax(p.getPriceMax())
                .currency(p.getCurrency())
                .hours(p.getHours())
                .thumbnailUrl(p.getThumbnailUrl())
                .sourceUrl(p.getSourceUrl())
                .sourcePlatform(p.getSourcePlatform())
                .tags(p.getTags())
                .menu(p.getMenu())
                .confidence(p.getConfidence())
                .createdBy(p.getCreatedBy())
                .consentGiven(p.isConsentGiven())
                .consentAt(p.getConsentAt())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}

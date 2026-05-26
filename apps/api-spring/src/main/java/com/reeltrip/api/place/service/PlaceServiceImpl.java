package com.reeltrip.api.place.service;

import com.reeltrip.api.auth.mapper.UserMapper;
import com.reeltrip.api.auth.model.User;
import com.reeltrip.api.common.exception.AppException;
import com.reeltrip.api.common.exception.ErrorCode;
import com.reeltrip.api.place.dto.AddPlaceRequest;
import com.reeltrip.api.place.dto.PlaceResponse;
import com.reeltrip.api.place.mapper.PlaceMapper;
import com.reeltrip.api.place.model.Place;
import com.reeltrip.api.teamspace.mapper.TeamSpaceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PlaceServiceImpl implements PlaceService {

    private final PlaceMapper placeMapper;
    private final TeamSpaceMapper teamSpaceMapper;
    private final UserMapper userMapper;

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
    public void delete(Long id, String username) {
        User user = getUser(username);
        Place place = getPlace(id);
        checkSpaceMember(place.getSpaceId(), user.getId());
        if (placeMapper.delete(id) == 0) {
            throw new AppException(ErrorCode.PLACE_NOT_FOUND);
        }
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
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}

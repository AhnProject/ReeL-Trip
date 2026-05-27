package com.reeltrip.api.place.service;

import com.reeltrip.api.place.dto.AddPlaceRequest;
import com.reeltrip.api.place.dto.PlaceResponse;

import java.util.List;

public interface PlaceService {
    PlaceResponse add(AddPlaceRequest request, String username);
    List<PlaceResponse> findBySpace(Long spaceId, String username);
    PlaceResponse findById(Long id, String username);
    void delete(Long id, String username);
}

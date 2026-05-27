package com.reeltrip.api.event.service;

import com.reeltrip.api.event.dto.CreateEventRequest;
import com.reeltrip.api.event.dto.EventResponse;
import com.reeltrip.api.event.dto.UpdateEventRequest;

import java.util.List;

public interface EventService {
    EventResponse create(CreateEventRequest request, String username);
    List<EventResponse> findBySpace(Long spaceId, String month, String username);
    EventResponse findById(Long id, String username);
    EventResponse update(Long id, UpdateEventRequest request, String username);
    void delete(Long id, String username);
}

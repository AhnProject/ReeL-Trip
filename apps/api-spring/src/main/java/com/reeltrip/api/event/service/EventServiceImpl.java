package com.reeltrip.api.event.service;

import com.reeltrip.api.auth.mapper.UserMapper;
import com.reeltrip.api.auth.model.User;
import com.reeltrip.api.common.exception.AppException;
import com.reeltrip.api.common.exception.ErrorCode;
import com.reeltrip.api.event.dto.CreateEventRequest;
import com.reeltrip.api.event.dto.EventResponse;
import com.reeltrip.api.event.dto.UpdateEventRequest;
import com.reeltrip.api.event.mapper.EventMapper;
import com.reeltrip.api.event.model.Event;
import com.reeltrip.api.teamspace.mapper.TeamSpaceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final EventMapper eventMapper;
    private final TeamSpaceMapper teamSpaceMapper;
    private final UserMapper userMapper;

    @Override
    public EventResponse create(CreateEventRequest request, String username) {
        User user = getUser(username);
        checkSpaceMember(request.getSpaceId(), user.getId());

        Event event = Event.builder()
                .spaceId(request.getSpaceId())
                .title(request.getTitle())
                .description(request.getDescription())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .location(request.getLocation())
                .price(request.getPrice())
                .color(request.getColor() != null ? request.getColor() : "#4A6CF7")
                .status(request.getStatus() != null ? request.getStatus() : "pending")
                .createdBy(user.getId())
                .build();

        eventMapper.insert(event);
        return toResponse(eventMapper.findById(event.getId())
                .orElseThrow(() -> new AppException(ErrorCode.EVENT_NOT_FOUND)));
    }

    @Override
    public List<EventResponse> findBySpace(Long spaceId, String month, String username) {
        User user = getUser(username);
        checkSpaceMember(spaceId, user.getId());

        List<Event> events = (month != null && !month.isBlank())
                ? eventMapper.findBySpaceIdAndMonth(spaceId, month)
                : eventMapper.findBySpaceId(spaceId);

        return events.stream().map(this::toResponse).toList();
    }

    @Override
    public EventResponse findById(Long id, String username) {
        User user = getUser(username);
        Event event = getEvent(id);
        checkSpaceMember(event.getSpaceId(), user.getId());
        return toResponse(event);
    }

    @Override
    public EventResponse update(Long id, UpdateEventRequest request, String username) {
        User user = getUser(username);
        Event event = getEvent(id);
        checkSpaceMember(event.getSpaceId(), user.getId());

        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setStartDate(request.getStartDate());
        event.setEndDate(request.getEndDate());
        event.setLocation(request.getLocation());
        event.setPrice(request.getPrice());
        if (request.getColor() != null) event.setColor(request.getColor());
        if (request.getStatus() != null) event.setStatus(request.getStatus());

        eventMapper.update(event);
        return toResponse(eventMapper.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.EVENT_NOT_FOUND)));
    }

    @Override
    public void delete(Long id, String username) {
        User user = getUser(username);
        Event event = getEvent(id);
        checkSpaceMember(event.getSpaceId(), user.getId());
        if (eventMapper.delete(id) == 0) {
            throw new AppException(ErrorCode.EVENT_NOT_FOUND);
        }
    }

    /* ── private helpers ── */

    private User getUser(String username) {
        return userMapper.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    private Event getEvent(Long id) {
        return eventMapper.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.EVENT_NOT_FOUND));
    }

    private void checkSpaceMember(Long spaceId, Long userId) {
        if (!teamSpaceMapper.existsMember(spaceId, userId)) {
            throw new AppException(ErrorCode.EVENT_ACCESS_DENIED);
        }
    }

    private EventResponse toResponse(Event e) {
        return EventResponse.builder()
                .id(e.getId())
                .spaceId(e.getSpaceId())
                .title(e.getTitle())
                .description(e.getDescription())
                .startDate(e.getStartDate())
                .endDate(e.getEndDate())
                .location(e.getLocation())
                .price(e.getPrice())
                .color(e.getColor())
                .status(e.getStatus())
                .createdBy(e.getCreatedBy())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }
}

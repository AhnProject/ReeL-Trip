package com.reeltrip.api.event.service;

import com.reeltrip.api.auth.mapper.UserMapper;
import com.reeltrip.api.auth.model.User;
import com.reeltrip.api.common.exception.AppException;
import com.reeltrip.api.common.exception.ErrorCode;
import com.reeltrip.api.event.dto.CreateEventRequest;
import com.reeltrip.api.event.dto.EventPlaceSummary;
import com.reeltrip.api.event.dto.EventResponse;
import com.reeltrip.api.event.dto.UpdateEventRequest;
import com.reeltrip.api.event.mapper.EventMapper;
import com.reeltrip.api.event.model.Event;
import com.reeltrip.api.notification.service.NotificationService;
import com.reeltrip.api.place.mapper.PlaceMapper;
import com.reeltrip.api.place.model.Place;
import com.reeltrip.api.teamspace.mapper.TeamSpaceMapper;
import com.reeltrip.api.teamspace.model.TeamSpaceMember;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.List;
import java.util.Objects;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final EventMapper eventMapper;
    private final TeamSpaceMapper teamSpaceMapper;
    private final UserMapper userMapper;
    private final NotificationService notificationService;
    private final PlaceMapper placeMapper;

    @Override
    public EventResponse create(CreateEventRequest request, String username) {
        User user = getUser(username);
        checkSpaceMember(request.getSpaceId(), user.getId());
        validateTimeRange(request.getStartTime(), request.getEndTime());
        Place place = resolvePlace(request.getPlaceId(), request.getSpaceId());

        Event event = Event.builder()
                .spaceId(request.getSpaceId())
                .title(request.getTitle())
                .description(request.getDescription())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .placeId(request.getPlaceId())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .location(request.getLocation())
                .price(request.getPrice())
                .color(request.getColor() != null ? request.getColor() : "#4A6CF7")
                .status(request.getStatus() != null ? request.getStatus() : "pending")
                .createdBy(user.getId())
                .build();

        eventMapper.insert(event);

        String message = String.format("%s님이 '%s' 일정을 추가했습니다.", user.getUsername(), event.getTitle());
        notifyOtherMembers(request.getSpaceId(), user.getId(), message);

        return toResponse(eventMapper.findById(event.getId())
                .orElseThrow(() -> new AppException(ErrorCode.EVENT_NOT_FOUND)), place);
    }

    @Override
    public List<EventResponse> findBySpace(Long spaceId, String month, String username) {
        User user = getUser(username);
        checkSpaceMember(spaceId, user.getId());

        List<Event> events = (month != null && !month.isBlank())
                ? eventMapper.findBySpaceIdAndMonth(spaceId, month)
                : eventMapper.findBySpaceId(spaceId);

        List<Long> placeIds = events.stream().map(Event::getPlaceId).filter(Objects::nonNull).distinct().toList();
        Map<Long, Place> placesById = placeIds.isEmpty()
                ? Map.of()
                : placeMapper.findByIds(placeIds).stream().collect(Collectors.toMap(Place::getId, p -> p));

        return events.stream().map(e -> toResponse(e, placesById.get(e.getPlaceId()))).toList();
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
        validateTimeRange(request.getStartTime(), request.getEndTime());
        Place place = resolvePlace(request.getPlaceId(), event.getSpaceId());

        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setStartDate(request.getStartDate());
        event.setEndDate(request.getEndDate());
        event.setPlaceId(request.getPlaceId());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        event.setLocation(request.getLocation());
        event.setPrice(request.getPrice());
        if (request.getColor() != null) event.setColor(request.getColor());
        if (request.getStatus() != null) event.setStatus(request.getStatus());

        eventMapper.update(event);

        String message = String.format("%s님이 '%s' 일정을 수정했습니다.", user.getUsername(), event.getTitle());
        notifyOtherMembers(event.getSpaceId(), user.getId(), message);

        return toResponse(eventMapper.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.EVENT_NOT_FOUND)), place);
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

    private void notifyOtherMembers(Long spaceId, Long actorId, String message) {
        List<TeamSpaceMember> members = teamSpaceMapper.findMembersBySpaceId(spaceId);
        members.stream()
                .filter(m -> !m.getUserId().equals(actorId))
                .forEach(m -> notificationService.create(m.getUserId(), message, "schedule", spaceId));
    }

    /** endTime은 startTime보다 늦어야 함 — 둘 다 있을 때만 검사(둘 중 하나라도 없으면 비교 불가해 통과) */
    private void validateTimeRange(LocalTime startTime, LocalTime endTime) {
        if (startTime != null && endTime != null && !endTime.isAfter(startTime)) {
            throw new AppException(ErrorCode.INVALID_EVENT_TIME_RANGE);
        }
    }

    /** placeId로 장소를 조회하고, 이 일정이 속한 스페이스의 장소인지 확인(다른 스페이스 장소 선택 방지) */
    private Place resolvePlace(Long placeId, Long spaceId) {
        if (placeId == null) return null;
        Place place = placeMapper.findById(placeId)
                .orElseThrow(() -> new AppException(ErrorCode.PLACE_NOT_FOUND));
        if (!place.getSpaceId().equals(spaceId)) {
            throw new AppException(ErrorCode.PLACE_ACCESS_DENIED);
        }
        return place;
    }

    private EventResponse toResponse(Event e) {
        Place place = e.getPlaceId() != null ? placeMapper.findById(e.getPlaceId()).orElse(null) : null;
        return toResponse(e, place);
    }

    private EventResponse toResponse(Event e, Place place) {
        return EventResponse.builder()
                .id(e.getId())
                .spaceId(e.getSpaceId())
                .title(e.getTitle())
                .description(e.getDescription())
                .startDate(e.getStartDate())
                .endDate(e.getEndDate())
                .placeId(e.getPlaceId())
                .startTime(e.getStartTime())
                .endTime(e.getEndTime())
                .place(place != null ? EventPlaceSummary.builder()
                        .id(place.getId())
                        .name(place.getName())
                        .hours(place.getHours())
                        .hoursStructured(place.getHoursStructured())
                        .build() : null)
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

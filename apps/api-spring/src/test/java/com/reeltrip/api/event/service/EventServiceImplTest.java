package com.reeltrip.api.event.service;

import com.reeltrip.api.auth.mapper.UserMapper;
import com.reeltrip.api.auth.model.User;
import com.reeltrip.api.common.exception.AppException;
import com.reeltrip.api.common.exception.ErrorCode;
import com.reeltrip.api.event.dto.CreateEventRequest;
import com.reeltrip.api.event.dto.UpdateEventRequest;
import com.reeltrip.api.event.mapper.EventMapper;
import com.reeltrip.api.event.model.Event;
import com.reeltrip.api.notification.service.NotificationService;
import com.reeltrip.api.place.mapper.PlaceMapper;
import com.reeltrip.api.place.model.Place;
import com.reeltrip.api.place.model.PlaceHours;
import com.reeltrip.api.teamspace.mapper.TeamSpaceMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventServiceImplTest {

    @Mock private EventMapper eventMapper;
    @Mock private TeamSpaceMapper teamSpaceMapper;
    @Mock private UserMapper userMapper;
    @Mock private NotificationService notificationService;
    @Mock private PlaceMapper placeMapper;

    private EventServiceImpl eventService;

    private static final Long SPACE_ID = 1L;
    private static final Long USER_ID = 10L;

    @BeforeEach
    void setUp() {
        eventService = new EventServiceImpl(eventMapper, teamSpaceMapper, userMapper, notificationService, placeMapper);
    }

    private User member() {
        return User.builder().id(USER_ID).username("alice").role("USER").build();
    }

    private CreateEventRequest baseRequest() {
        CreateEventRequest request = new CreateEventRequest();
        request.setSpaceId(SPACE_ID);
        request.setTitle("저녁 식사");
        request.setStartDate(LocalDate.of(2026, 1, 1));
        request.setEndDate(LocalDate.of(2026, 1, 1));
        return request;
    }

    @Test
    void create_withInvalidTimeRange_isRejected() {
        when(userMapper.findByUsername("alice")).thenReturn(Optional.of(member()));
        when(teamSpaceMapper.existsMember(SPACE_ID, USER_ID)).thenReturn(true);

        CreateEventRequest request = baseRequest();
        request.setStartTime(LocalTime.of(19, 0));
        request.setEndTime(LocalTime.of(18, 0)); // 종료가 시작보다 빠름

        assertThatThrownBy(() -> eventService.create(request, "alice"))
                .isInstanceOf(AppException.class)
                .extracting(e -> ((AppException) e).getErrorCode())
                .isEqualTo(ErrorCode.INVALID_EVENT_TIME_RANGE);

        verify(eventMapper, never()).insert(any());
    }

    @Test
    void create_withPlaceFromDifferentSpace_isRejected() {
        when(userMapper.findByUsername("alice")).thenReturn(Optional.of(member()));
        when(teamSpaceMapper.existsMember(SPACE_ID, USER_ID)).thenReturn(true);
        when(placeMapper.findById(99L)).thenReturn(Optional.of(
                Place.builder().id(99L).spaceId(999L).name("다른 스페이스 장소").build()));

        CreateEventRequest request = baseRequest();
        request.setPlaceId(99L);

        assertThatThrownBy(() -> eventService.create(request, "alice"))
                .isInstanceOf(AppException.class)
                .extracting(e -> ((AppException) e).getErrorCode())
                .isEqualTo(ErrorCode.PLACE_ACCESS_DENIED);

        verify(eventMapper, never()).insert(any());
    }

    @Test
    void create_withValidPlace_includesPlaceSummaryInResponse() {
        when(userMapper.findByUsername("alice")).thenReturn(Optional.of(member()));
        when(teamSpaceMapper.existsMember(SPACE_ID, USER_ID)).thenReturn(true);
        when(teamSpaceMapper.findMembersBySpaceId(SPACE_ID)).thenReturn(List.of());

        Place place = Place.builder().id(99L).spaceId(SPACE_ID).name("스시야")
                .hours("11:00~22:00")
                .hoursStructured(List.of(new PlaceHours("MON", "11:00", "22:00")))
                .build();
        when(placeMapper.findById(99L)).thenReturn(Optional.of(place));

        doAnswer(invocation -> {
            Event e = invocation.getArgument(0);
            e.setId(1L);
            return null;
        }).when(eventMapper).insert(any(Event.class));
        when(eventMapper.findById(1L)).thenAnswer(invocation -> Optional.of(
                Event.builder().id(1L).spaceId(SPACE_ID).title("저녁 식사")
                        .startDate(LocalDate.of(2026, 1, 1)).endDate(LocalDate.of(2026, 1, 1))
                        .placeId(99L).startTime(LocalTime.of(19, 0)).endTime(LocalTime.of(20, 0))
                        .createdBy(USER_ID).build()));

        CreateEventRequest request = baseRequest();
        request.setPlaceId(99L);
        request.setStartTime(LocalTime.of(19, 0));
        request.setEndTime(LocalTime.of(20, 0));

        var response = eventService.create(request, "alice");

        assertThat(response.getPlace()).isNotNull();
        assertThat(response.getPlace().getName()).isEqualTo("스시야");
        assertThat(response.getPlace().getHoursStructured()).hasSize(1);
    }

    @Test
    void update_withInvalidTimeRange_isRejected() {
        Event existing = Event.builder().id(1L).spaceId(SPACE_ID).title("기존 일정")
                .startDate(LocalDate.of(2026, 1, 1)).endDate(LocalDate.of(2026, 1, 1)).build();

        when(userMapper.findByUsername("alice")).thenReturn(Optional.of(member()));
        when(eventMapper.findById(1L)).thenReturn(Optional.of(existing));
        when(teamSpaceMapper.existsMember(SPACE_ID, USER_ID)).thenReturn(true);

        UpdateEventRequest request = new UpdateEventRequest();
        request.setTitle("수정된 일정");
        request.setStartDate(LocalDate.of(2026, 1, 1));
        request.setEndDate(LocalDate.of(2026, 1, 1));
        request.setStartTime(LocalTime.of(10, 0));
        request.setEndTime(LocalTime.of(10, 0)); // 같은 시각 — 종료가 시작보다 늦지 않음

        assertThatThrownBy(() -> eventService.update(1L, request, "alice"))
                .isInstanceOf(AppException.class)
                .extracting(e -> ((AppException) e).getErrorCode())
                .isEqualTo(ErrorCode.INVALID_EVENT_TIME_RANGE);

        verify(eventMapper, never()).update(any());
    }
}

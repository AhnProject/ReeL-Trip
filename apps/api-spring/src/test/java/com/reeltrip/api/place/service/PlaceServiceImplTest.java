package com.reeltrip.api.place.service;

import com.reeltrip.api.ai.service.AiService;
import com.reeltrip.api.auth.mapper.UserMapper;
import com.reeltrip.api.auth.model.User;
import com.reeltrip.api.common.exception.AppException;
import com.reeltrip.api.common.exception.ErrorCode;
import com.reeltrip.api.notification.service.NotificationService;
import com.reeltrip.api.place.dto.AddPlaceRequest;
import com.reeltrip.api.place.dto.SimilarPlaceResponse;
import com.reeltrip.api.place.mapper.PlaceMapper;
import com.reeltrip.api.place.model.Place;
import com.reeltrip.api.teamspace.mapper.TeamSpaceMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PlaceServiceImplTest {

    @Mock private PlaceMapper placeMapper;
    @Mock private TeamSpaceMapper teamSpaceMapper;
    @Mock private UserMapper userMapper;
    @Mock private NotificationService notificationService;
    @Mock private AiService aiService;

    private PlaceServiceImpl placeService;

    private static final Long SPACE_ID = 1L;
    private static final Long USER_ID = 10L;

    @BeforeEach
    void setUp() {
        placeService = new PlaceServiceImpl(placeMapper, teamSpaceMapper, userMapper, notificationService, aiService);
    }

    private User member() {
        return User.builder().id(USER_ID).username("alice").role("USER").build();
    }

    @Test
    void add_memberCanAddPlace() {
        when(userMapper.findByUsername("alice")).thenReturn(Optional.of(member()));
        when(teamSpaceMapper.existsMember(SPACE_ID, USER_ID)).thenReturn(true);
        when(teamSpaceMapper.findMembersBySpaceId(SPACE_ID)).thenReturn(List.of());
        when(aiService.createEmbedding(any())).thenReturn(List.of(0.1, 0.2));

        doAnswer(invocation -> {
            Place p = invocation.getArgument(0);
            p.setId(99L);
            return null;
        }).when(placeMapper).insert(any(Place.class));
        when(placeMapper.findById(99L)).thenAnswer(invocation ->
                Optional.of(Place.builder().id(99L).spaceId(SPACE_ID).name("스시야").createdBy(USER_ID).build()));

        AddPlaceRequest request = new AddPlaceRequest();
        request.setSpaceId(SPACE_ID);
        request.setName("스시야");

        var response = placeService.add(request, "alice");

        assertThat(response.getId()).isEqualTo(99L);
        verify(placeMapper).insert(any(Place.class));
    }

    @Test
    void add_nonMemberCannotAddPlace() {
        when(userMapper.findByUsername("alice")).thenReturn(Optional.of(member()));
        when(teamSpaceMapper.existsMember(SPACE_ID, USER_ID)).thenReturn(false);

        AddPlaceRequest request = new AddPlaceRequest();
        request.setSpaceId(SPACE_ID);
        request.setName("스시야");

        assertThatThrownBy(() -> placeService.add(request, "alice"))
                .isInstanceOf(AppException.class)
                .extracting(e -> ((AppException) e).getErrorCode())
                .isEqualTo(ErrorCode.PLACE_ACCESS_DENIED);

        verify(placeMapper, never()).insert(any());
    }

    @Test
    void findById_nonMemberIsDenied() {
        Place place = Place.builder().id(5L).spaceId(SPACE_ID).name("카페").build();
        when(userMapper.findByUsername("alice")).thenReturn(Optional.of(member()));
        when(placeMapper.findById(5L)).thenReturn(Optional.of(place));
        when(teamSpaceMapper.existsMember(SPACE_ID, USER_ID)).thenReturn(false);

        assertThatThrownBy(() -> placeService.findById(5L, "alice"))
                .isInstanceOf(AppException.class)
                .extracting(e -> ((AppException) e).getErrorCode())
                .isEqualTo(ErrorCode.PLACE_ACCESS_DENIED);
    }

    @Test
    void findSimilar_withoutConsent_isRejected() {
        Place place = Place.builder().id(5L).spaceId(SPACE_ID).name("카페").consentGiven(false).build();
        when(userMapper.findByUsername("alice")).thenReturn(Optional.of(member()));
        when(placeMapper.findById(5L)).thenReturn(Optional.of(place));
        when(teamSpaceMapper.existsMember(SPACE_ID, USER_ID)).thenReturn(true);

        assertThatThrownBy(() -> placeService.findSimilar(5L, "alice"))
                .isInstanceOf(AppException.class)
                .extracting(e -> ((AppException) e).getErrorCode())
                .isEqualTo(ErrorCode.PLACE_CONSENT_REQUIRED);

        verify(placeMapper, never()).findSimilarPlaces(anyLong(), anyInt());
    }

    @Test
    void findSimilar_withConsentAndMembership_returnsResults() {
        Place place = Place.builder().id(5L).spaceId(SPACE_ID).name("카페").consentGiven(true).build();
        List<SimilarPlaceResponse> similar = List.of(
                SimilarPlaceResponse.builder().id(6L).name("비슷한카페").matchScore(0.9).build());

        when(userMapper.findByUsername("alice")).thenReturn(Optional.of(member()));
        when(placeMapper.findById(5L)).thenReturn(Optional.of(place));
        when(teamSpaceMapper.existsMember(SPACE_ID, USER_ID)).thenReturn(true);
        when(placeMapper.findSimilarPlaces(5L, 10)).thenReturn(similar);

        var result = placeService.findSimilar(5L, "alice");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("비슷한카페");
    }

    @Test
    void delete_nonMemberIsDenied() {
        Place place = Place.builder().id(5L).spaceId(SPACE_ID).name("카페").build();
        when(userMapper.findByUsername("alice")).thenReturn(Optional.of(member()));
        when(placeMapper.findById(5L)).thenReturn(Optional.of(place));
        when(teamSpaceMapper.existsMember(SPACE_ID, USER_ID)).thenReturn(false);

        assertThatThrownBy(() -> placeService.delete(5L, "alice"))
                .isInstanceOf(AppException.class)
                .extracting(e -> ((AppException) e).getErrorCode())
                .isEqualTo(ErrorCode.PLACE_ACCESS_DENIED);

        verify(placeMapper, never()).delete(anyLong());
    }
}

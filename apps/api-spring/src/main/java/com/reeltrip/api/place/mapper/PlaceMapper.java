package com.reeltrip.api.place.mapper;

import com.reeltrip.api.place.dto.SimilarPlaceResponse;
import com.reeltrip.api.place.model.Place;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Mapper
public interface PlaceMapper {

    void insert(Place place);

    Optional<Place> findById(@Param("id") Long id);

    List<Place> findByIds(@Param("ids") List<Long> ids);

    List<Place> findBySpaceId(@Param("spaceId") Long spaceId);

    int update(Place place);

    int delete(@Param("id") Long id);

    void updateEmbedding(@Param("id") Long id, @Param("embedding") String embedding);

    List<SimilarPlaceResponse> findSimilarPlaces(@Param("placeId") Long placeId, @Param("limit") int limit);

    /** 좌표가 없고 주소는 있는 장소 — A4 소급 지오코딩 배치 대상 */
    List<Place> findWithoutCoordinates();

    void updateCoordinates(@Param("id") Long id, @Param("latitude") BigDecimal latitude, @Param("longitude") BigDecimal longitude);
}

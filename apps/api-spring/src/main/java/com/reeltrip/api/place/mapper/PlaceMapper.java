package com.reeltrip.api.place.mapper;

import com.reeltrip.api.place.model.Place;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface PlaceMapper {

    void insert(Place place);

    Optional<Place> findById(@Param("id") Long id);

    List<Place> findBySpaceId(@Param("spaceId") Long spaceId);

    int delete(@Param("id") Long id);
}

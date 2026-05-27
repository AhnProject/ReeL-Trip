package com.reeltrip.api.event.mapper;

import com.reeltrip.api.event.model.Event;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface EventMapper {

    void insert(Event event);

    Optional<Event> findById(@Param("id") Long id);

    List<Event> findBySpaceId(@Param("spaceId") Long spaceId);

    List<Event> findBySpaceIdAndMonth(@Param("spaceId") Long spaceId, @Param("month") String month);

    void update(Event event);

    int delete(@Param("id") Long id);
}

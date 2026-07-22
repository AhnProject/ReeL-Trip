package com.reeltrip.api.todo.mapper;

import com.reeltrip.api.todo.model.Todo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface TodoMapper {

    void insert(Todo todo);

    Optional<Todo> findById(@Param("id") Long id);

    List<Todo> findBySpaceId(@Param("spaceId") Long spaceId);

    void update(Todo todo);

    int delete(@Param("id") Long id);
}

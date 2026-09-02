package com.reeltrip.api.chat.mapper;

import com.reeltrip.api.chat.model.Message;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MessageMapper {

    List<Message> findBySpaceId(@Param("spaceId") Long spaceId);

    void insert(Message message);
}

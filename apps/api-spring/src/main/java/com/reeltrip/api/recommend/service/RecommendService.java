package com.reeltrip.api.recommend.service;

import com.reeltrip.api.recommend.dto.RecommendRequest;
import com.reeltrip.api.recommend.dto.RecommendResponse;

public interface RecommendService {

    RecommendResponse recommend(RecommendRequest request);
}

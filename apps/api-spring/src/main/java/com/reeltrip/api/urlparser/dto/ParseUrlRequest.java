package com.reeltrip.api.urlparser.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.validator.constraints.URL;

@Getter
@Setter
public class ParseUrlRequest {

    @NotBlank(message = "유효한 URL을 입력하세요")
    @URL(message = "유효한 URL을 입력하세요")
    private String url;
}

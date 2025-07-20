package com.thirdparty.user.request.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Builder
@AllArgsConstructor
@Data
public class RequestInitiateDto1 {
    private String title;
    private String name;
    private String description;
    private List<String> dynamicFields;
    private String requestedBy;
}

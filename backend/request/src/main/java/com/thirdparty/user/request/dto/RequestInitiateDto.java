package com.thirdparty.user.request.dto;

import lombok.Data;
import java.util.Map;

@Data
public class RequestInitiateDto {
    private String title;
    private String description;
    private Map<String, Object> dynamicFields;
    private String requestedBy;
    private String role;
}

package com.thirdparty.user.request.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Builder
@Data
@AllArgsConstructor
public class UserConsentDto {
    private List<String> approvedFields;
    private String consentType;
    private Instant consentTime;
}

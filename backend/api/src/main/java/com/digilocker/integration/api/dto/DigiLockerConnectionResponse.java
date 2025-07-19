package com.digilocker.integration.api.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DigiLockerConnectionResponse {
    private boolean success;
    private String message;
    private String username;
    private String authorizationUrl;
    private Boolean connected;
    private String error;
} 
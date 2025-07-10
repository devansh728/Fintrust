package com.digilocker.integration.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RefreshTokenRequest {

    private String grantType = "refresh_token";
    private String refreshToken;
}

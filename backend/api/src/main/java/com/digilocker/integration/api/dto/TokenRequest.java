package com.digilocker.integration.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TokenRequest {

    private String code;
    private String grantType = "authorization_code";
    private String clientId;
    private String clientSecret;
    private String redirectUri;
    private String codeVerifier;
}

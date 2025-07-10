package com.digilocker.integration.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TokenResponse {

    private String accessToken;
    private int expiresIn;
    private String tokenType;
    private String scope;
    private String refreshToken;
    private String digiLockerId;
    private String name;
    private String dob;
    private String gender;
    private String eaadhaar;
    private String newAccount;
    private String referenceKey;
}

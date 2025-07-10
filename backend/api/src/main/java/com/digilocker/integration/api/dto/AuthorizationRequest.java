package com.digilocker.integration.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthorizationRequest {

    private String responseType = "code";
    private String clientId;
    private String redirectUri;
    private String state;
    private String codeChallenge;
    private String codeChallengeMethod = "S256";
    private String dlFlow;
    private String verifiedMobile;
}

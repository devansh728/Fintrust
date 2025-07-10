package com.digilocker.integration.api.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Document(collection = "digilocker_auth")
public class DigiLockerAuth {

    @Id
    private Long id;
    private String userId; // Links to your user system
    private String digiLockerId;
    private String accessToken;
    private String refreshToken;
    private Instant expiresAt;
    private String scope;
    private String tokenType;
    private String referenceKey;
    private String name;
    private String dob;
    private String gender;
    private String eaadhaar;

    private String codeVerifierEntityId;

}

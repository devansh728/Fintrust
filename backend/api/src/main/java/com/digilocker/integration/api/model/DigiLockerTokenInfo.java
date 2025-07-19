package com.digilocker.integration.api.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "digilocker_token_info")
public class DigiLockerTokenInfo {

    @Id
    private String id;
    
    // User identification
    private String username;
    private String userId;
    
    // OAuth2 tokens (encrypted)
    private String encryptedAccessToken;
    private String encryptedRefreshToken;
    
    // Token metadata
    private String tokenType;
    private String scope;
    private Instant expiresAt;
    private Instant createdAt;
    private Instant updatedAt;
    
    // DigiLocker user info
    private String digiLockerId;
    private String name;
    private String dob;
    private String gender;
    private String eaadhaar;
    private String referenceKey;
    
    // Connection status
    private boolean active;
    private String lastError;
    
    // PKCE support
    private String codeVerifier;
    private String state;
} 
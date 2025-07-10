package com.digilocker.integration.api.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

@Data
@Document(collection = "digilocker_integration")
public class DigiLockerIntegration {
    @Id
    private String userId;
    private String digilockerId;
    private String accessTokenEnc;
    private String refreshTokenEnc;
    private Instant expiresAt;
    private Instant lastSync;
}

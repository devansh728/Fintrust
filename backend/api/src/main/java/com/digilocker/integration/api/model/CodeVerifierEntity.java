package com.digilocker.integration.api.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Document(collection = "code_verifiers")
public class CodeVerifierEntity {
    @Id
    private String id;
    private String state;
    private String userId;
    private String codeVerifier;
    private Instant createdAt = Instant.now();
}

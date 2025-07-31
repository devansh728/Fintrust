package com.fintrust.Consent.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "tpp_registrations")
public class TppRegistration {
    @Id
    private String tppId;

    private String name;
    private String jurisdiction;

    @Field("kyc_hashes")
    private List<String> kycHashes;

    private String status; // PENDING_KYC, APPROVED, REJECTED
    private String txHash;

    @Field("expiry_date")
    private LocalDateTime expiryDate;

    @Field("requested_scopes")
    private List<String> requestedScopes;
}
package com.fintrust.Consent.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "user_consents")
public class UserConsent {
    @Id
    private String id;
    private String userId;
    private String thirdPartyRequestId;
    private String status; // APPROVED/REJECTED
    private Instant decisionDate;
    private String requestId; // Unique identifier for the consent, can be used for tracking
}

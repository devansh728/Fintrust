package com.fintrust.Consent.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "third_party_requests")
public class ThirdPartyRequest {
    @Id
    private String id;
    private String userId;
    private String thirdPartyName;
    private String purpose;
    private String officialEmail;
    private String organization;
    private String useCase;
    private String description;
    private List<DynamicFormField> dynamicFields;
    private String status; // PENDING/APPROVED/REJECTED
    private Instant createdAt;
    private String requestId; // Unique identifier for the request, can be used for tracking
}

package com.fintrust.Consent.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "form_data_submissions")
public class FormDataSubmission {
    @Id
    private String id;
    private String thirdPartyRequestId;
    private String userId;
    private Map<String, Object> submittedFields;
    private double privacyLevel;
    private Map<String, Object> maskedData;
    private String formId;
    private Instant createdAt;
    private boolean forwarded;
    private Instant forwardedAt;
}

package com.thirdparty.user.request.domain;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "requests")
public class Request {
    @Id
    private String id;
    private String title;
    private String description;
    private Map<String, Object> dynamicFields;
    private String requestedBy;
    private String role;
    private List<Consent> fullConsent;
    private Map<String,Consent> consents;
    private List<DocumentMeta> documents;
    private String blockchainTxId;
    private String status;
    private Instant createdAt;
    private Instant updatedAt;
}

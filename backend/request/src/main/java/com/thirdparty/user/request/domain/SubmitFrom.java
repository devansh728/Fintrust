package com.thirdparty.user.request.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "submitted")
public class SubmitFrom {
    @Id
    private String id;
    private String requestId;
    private String userId;
    private List<FieldEntry> fieldEntries;
    private List<DocumentEntry> documentEntries;
    private Instant createdAt;
    private Instant updatedAt;
}

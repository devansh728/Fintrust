package com.thirdparty.user.request.dto;

import com.thirdparty.user.request.domain.DocumentEntry;
import com.thirdparty.user.request.domain.FieldEntry;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class SubmitForm {
    private String id;
    private String requestId;
    private String userId;
    private List<FieldEntry> fieldEntries;
    private List<DocumentEntry> documentEntries;
    private Instant createdAt;
    private Instant updatedAt;

}

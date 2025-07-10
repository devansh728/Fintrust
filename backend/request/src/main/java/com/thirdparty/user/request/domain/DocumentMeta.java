package com.thirdparty.user.request.domain;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentMeta {
    private String documentId;
    private String fileName;
    private String digilockerToken;
    private String uploadedBy;
    private String status;
}

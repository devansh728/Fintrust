package com.thirdparty.user.request.dto;

import lombok.Data;

@Data
public class AttachDocumentDto {
    private String documentId;
    private String digilockerToken;
    private String fileName;
}

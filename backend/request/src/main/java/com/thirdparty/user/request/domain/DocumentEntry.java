package com.thirdparty.user.request.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentEntry {

    private String documentName;
    private byte[] file;
    private String contentType;
    private String uploadedBy;
    private String status;

}

package com.thirdparty.user.request.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.http.MediaType;

@AllArgsConstructor
@Data
public class DocumentDownloadResponse {
    byte[] content;
    MediaType contentType;
    String uri;
}


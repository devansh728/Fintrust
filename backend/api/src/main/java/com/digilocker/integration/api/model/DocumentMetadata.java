package com.digilocker.integration.api.model;

import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document
public class DocumentMetadata {
    private String uri;
    private String name;
    private String type;
    private long size;
    private String hmac;
}

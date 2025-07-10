package com.digilocker.integration.api.dto;

import lombok.AllArgsConstructor;

import java.util.List;

@AllArgsConstructor
public class DocumentListResponse {
    String directory;
    List<DocumentItem> items;
}

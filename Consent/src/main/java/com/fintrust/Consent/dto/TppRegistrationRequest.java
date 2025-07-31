package com.fintrust.Consent.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class TppRegistrationRequest {
    @NotBlank(message = "TPP ID is required")
    private String tppId;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Jurisdiction is required")
    private String jurisdiction;

    @NotNull(message = "KYC documents are required")
    private List<String> kycDocs; // IPFS hashes

    @NotNull(message = "Scopes are required")
    private List<String> requestedScopes;
}
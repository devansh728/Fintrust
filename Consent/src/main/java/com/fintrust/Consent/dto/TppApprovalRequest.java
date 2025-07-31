package com.fintrust.Consent.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TppApprovalRequest {
    @NotBlank(message = "TPP ID is required")
    private String tppId;

    private String adminId = "admin@123";

    private boolean approved = true; // not hardcoded

    private int expiryDays = 365; // Default 1 year
}

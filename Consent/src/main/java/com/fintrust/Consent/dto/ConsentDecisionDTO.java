package com.fintrust.Consent.dto;

import lombok.Data;

@Data
public class ConsentDecisionDTO {
    private String userId;
    private String thirdPartyRequestId;
    private String status; // APPROVED/REJECTED
}

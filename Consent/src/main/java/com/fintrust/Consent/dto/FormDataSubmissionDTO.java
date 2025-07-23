package com.fintrust.Consent.dto;

import lombok.Data;
import java.util.Map;

@Data
public class FormDataSubmissionDTO {
    private String formId;
    private String thirdPartyRequestId;
    private String userId;
    private Map<String, Object> submittedFields;
    private double privacyLevel;
}

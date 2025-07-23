package com.fintrust.Consent.dto;

import lombok.Data;
import java.util.List;

@Data
public class ThirdPartyRequestDTO {
    private String userId;
    private String thirdPartyName;
    private String purpose;
    private String officialEmail;
    private String organization;
    private String useCase;
    private String description;
    private List<DynamicFormFieldDTO> dynamicFields;
}

package com.thirdparty.user.request.dto;

import feign.form.FormData;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Builder
@AllArgsConstructor
@Data
public class ConsentPayload {
    private String useCase;
    private RequestInitiateDto1 thirdParty;
    private UserConsentDto userConsent;
    private formData formData;
}

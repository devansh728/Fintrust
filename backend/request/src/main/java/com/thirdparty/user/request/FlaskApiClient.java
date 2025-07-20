package com.thirdparty.user.request;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.thirdparty.user.request.domain.DocumentEntry;
import com.thirdparty.user.request.domain.FieldEntry;
import com.thirdparty.user.request.dto.ConsentPayload;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import jakarta.servlet.http.HttpServletRequest;

import java.util.HashMap;
import java.util.Map;

public class FlaskApiClient {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String flaskApiUrl;

    public FlaskApiClient(RestTemplate restTemplate, ObjectMapper objectMapper, String flaskApiUrl) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.flaskApiUrl = flaskApiUrl;
    }

    public String submitToFlaskApi(String requestId, ConsentPayload payload) throws Exception {
        // 1. Convert payload to JSON string with proper field names
        String payloadJson = objectMapper.writeValueAsString(convertToApiFormat(payload));

        // 2. Create multipart request
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("payload", payloadJson);

        // 3. Add file attachments
        if (payload.getFormData() != null && payload.getFormData().getFileUploads() != null) {
            for (DocumentEntry document : payload.getFormData().getFileUploads()) {
                ByteArrayResource fileResource = new ByteArrayResource(document.getFile()) {
                    @Override
                    public String getFilename() {
                        return document.getDocumentName();
                    }
                };
                body.add(document.getDocumentName(), fileResource);
            }
        }

        // 4. Create headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA); ///////////////////saare headers daalne hai idhar

        // Retrieve and add all user behavior and authentication headers
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs != null) {
            HttpServletRequest req = attrs.getRequest();
            Object attr = req.getAttribute("behaviorHeaders");
            if (attr instanceof Map) {
                Map<String, String> behaviorHeaders = (Map<String, String>) attr;
                behaviorHeaders.forEach((key, value) -> {
                    if (value != null) headers.set(key, value);
                });
            }
        }
        // 5. Make the request
        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(
                flaskApiUrl + "/api/requests/" + requestId + "/submitForm",
                requestEntity,
                String.class
        );

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Flask API request failed: " + response.getBody());
        }

        return response.getBody();
    }

    private Map<String, Object> convertToApiFormat(ConsentPayload payload) {
        Map<String, Object> apiPayload = new HashMap<>();

        // Convert useCase to snake_case
        apiPayload.put("use_case", payload.getUseCase());

        // Convert thirdParty
        if (payload.getThirdParty() != null) {
            Map<String, Object> thirdPartyMap = new HashMap<>();
            thirdPartyMap.put("name", payload.getThirdParty().getName());
            thirdPartyMap.put("purpose", payload.getThirdParty().getDescription());
            thirdPartyMap.put("requested_fields", payload.getThirdParty().getDynamicFields());
            apiPayload.put("third_party", thirdPartyMap);
        }

        // Convert userConsent
        if (payload.getUserConsent() != null) {
            Map<String, Object> consentMap = new HashMap<>();
            consentMap.put("approved_fields", payload.getUserConsent().getApprovedFields());
            consentMap.put("consent_type", payload.getUserConsent().getConsentType());
            consentMap.put("consent_time", payload.getUserConsent().getConsentTime().toString());
            apiPayload.put("user_consent", consentMap);
        }

        // Convert formData
        if (payload.getFormData() != null) {
            Map<String, Object> formDataMap = new HashMap<>();

            // Convert text fields to Map
            Map<String, String> textFieldsMap = new HashMap<>();
            if (payload.getFormData().getTextFields() != null) {
                for (FieldEntry field : payload.getFormData().getTextFields()) {
                    textFieldsMap.put(field.getFieldName(), field.getFieldValue());
                }
            }
            formDataMap.put("text_fields", textFieldsMap);

            // File uploads will be handled separately in multipart
            formDataMap.put("file_uploads", new HashMap<>());

            apiPayload.put("form_data", formDataMap);
        }

        return apiPayload;
    }
}
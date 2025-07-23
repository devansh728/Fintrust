package com.fintrust.Consent.service.impl;

import com.fintrust.Consent.dto.FormDataSubmissionDTO;
import com.fintrust.Consent.repository.FormDataSubmissionRepository;
import com.fintrust.Consent.repository.ThirdPartyRequestRepository;
import com.fintrust.Consent.service.FormDataService;
import com.fintrust.Consent.model.FormDataSubmission;
import com.fintrust.Consent.model.ThirdPartyRequest;
import com.fintrust.Consent.util.MaskingUtil;
import com.fintrust.Consent.util.DifferentialPrivacyUtil;
import java.time.Instant;
import java.util.HashMap;
import java.util.concurrent.CompletableFuture;
import org.springframework.scheduling.annotation.Async;
import org.springframework.web.client.RestTemplate;
import com.fintrust.Consent.util.AuditLogger;
import lombok.RequiredArgsConstructor;
import java.util.Map;
import java.util.ArrayList;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FormDataServiceImpl implements FormDataService {
    private final FormDataSubmissionRepository formDataSubmissionRepository;
    private final MaskingUtil maskingUtil;
    private final DifferentialPrivacyUtil differentialPrivacyUtil;
    private final AuditLogger auditLogger;
    private final ThirdPartyRequestRepository thirdPartyRequestRepository;

    @Override
    public Object submitForm(FormDataSubmissionDTO dto) {
        // Mask and apply differential privacy to sensitive fields
        HashMap<String, Object> maskedData = new HashMap<>();
        dto.getSubmittedFields().forEach((k, v) -> {
            if (k.toLowerCase().contains("aadhar")) maskedData.put(k, maskingUtil.maskAadhar(v.toString()));
            else if (k.toLowerCase().contains("pan")) maskedData.put(k, maskingUtil.maskPan(v.toString()));
            else if (k.toLowerCase().contains("phone")) maskedData.put(k, maskingUtil.maskPhone(v.toString()));
            else if (k.toLowerCase().contains("account")) maskedData.put(k, maskingUtil.maskAccount(v.toString()));
            else if (v instanceof Number num) maskedData.put(k, differentialPrivacyUtil.addNoise(num.doubleValue(), dto.getPrivacyLevel()));
            else maskedData.put(k, v);
        });
        FormDataSubmission submission = FormDataSubmission.builder()
                .thirdPartyRequestId(dto.getThirdPartyRequestId())
                .userId(dto.getUserId())
                .submittedFields(dto.getSubmittedFields())
                .privacyLevel(dto.getPrivacyLevel())
                .formId(dto.getFormId())
                .createdAt(Instant.now())
                .maskedData(maskedData)
                .forwarded(false)
                .forwardedAt(null)
                .build();
        ThirdPartyRequest thirdPartyRequest = thirdPartyRequestRepository.findByRequestId(dto.getFormId());
        thirdPartyRequest.setStatus("SUBMITTED");
        thirdPartyRequestRepository.save(thirdPartyRequest);
        submission = formDataSubmissionRepository.save(submission);
        auditLogger.log("FORM_SUBMIT", dto.getUserId(), "Form submitted for requestId=" + dto.getThirdPartyRequestId());
        asyncForwardFormData(submission);
        return submission;
    }

    @Async
    public CompletableFuture<Void> asyncForwardFormData(FormDataSubmission submission) {
        auditLogger.log("FORM_FORWARD_START", submission.getUserId(), "Forwarding form for requestId=" + submission.getThirdPartyRequestId());
        String formId = submission.getFormId(); 
        ThirdPartyRequest request = thirdPartyRequestRepository.findByRequestId(formId);
        if (request == null) {
            auditLogger.log("FORM_FORWARD_FAIL", submission.getUserId(), "No request found for formId=" + formId);
            return CompletableFuture.completedFuture(null);
        }

        // Build third-party info
        HashMap<String, Object> thirdParty = new HashMap<>();
        thirdParty.put("name", request.getThirdPartyName());
        thirdParty.put("purpose", request.getPurpose());
        thirdParty.put("description", request.getDescription());

        // Build data object with only the masked field keys (values can be empty or null)
        HashMap<String, Object> data = new HashMap<>();
        for (String key : submission.getMaskedData().keySet()) {
            data.put(key, "");
        }

        // Build payload
        HashMap<String, Object> payload = new HashMap<>();
        payload.put("Third-Party", thirdParty);
        payload.put("data", data);

        try {
            RestTemplate restTemplate = new RestTemplate();
            String externalApiUrl = "http://localhost:5000/api/minimize-fields";
            // Send request and capture response
            ResponseEntity<Map> response = restTemplate.postForEntity(externalApiUrl, payload, Map.class);
            List<String> minimizedFields = new ArrayList<>();
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null && response.getBody().get("fields") instanceof List) {
                for (Object field : (List<?>) response.getBody().get("fields")) {
                    if (field instanceof String) minimizedFields.add((String) field);
                }
            }

            // Build a DTO (Map) with only minimized fields and their values from maskedData
            HashMap<String, Object> minimizedFieldValues = new HashMap<>();
            for (String field : minimizedFields) {
                if (submission.getMaskedData().containsKey(field)) {
                    minimizedFieldValues.put(field, submission.getMaskedData().get(field));
                }
            }
            // minimizedFieldValues now contains only the fields approved by AI, ready to send to another external API

            // Example: log or forward minimizedFieldValues as needed
            auditLogger.log("FORM_MINIMIZED_DTO", submission.getUserId(), "Minimized DTO: " + minimizedFieldValues);

            // Call blockchain sender if AI response is 200 OK
            sendToBlockchain(minimizedFieldValues, submission, request, minimizedFields, response);

            submission.setForwarded(true);
            submission.setForwardedAt(Instant.now());
            formDataSubmissionRepository.save(submission);
            auditLogger.log("FORM_FORWARDED", submission.getUserId(), "Form forwarded for requestId=" + submission.getThirdPartyRequestId() + ", Minimized fields: " + minimizedFields);
        } catch (Exception e) {
            auditLogger.log("FORM_FORWARD_FAIL", submission.getUserId(), "Failed to forward form: " + e.getMessage());
        }
        return CompletableFuture.completedFuture(null);
    }
    @Async
    public CompletableFuture<Void> sendToBlockchain(Map<String, Object> minimizedFieldValues, FormDataSubmission submission, ThirdPartyRequest request, List<String> minimizedFields, ResponseEntity<Map> aiResponse) {
            // Only proceed if AI response is 200 OK
            if (aiResponse == null || !aiResponse.getStatusCode().is2xxSuccessful()) {
                auditLogger.log("BLOCKCHAIN_SKIP", submission.getUserId(), "AI minimization failed, skipping blockchain send.");
                return CompletableFuture.completedFuture(null);
            }

            // Build the input JSON as per the provided structure
            Map<String, Object> payload = new HashMap<>();

            // Metadata
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("version", "1.0.0");
            metadata.put("timestamp", java.time.Instant.now().toString());
            metadata.put("processType", "complete_workflow");
            metadata.put("requestId", request.getRequestId());
            payload.put("metadata", metadata);

            // User
            Map<String, Object> user = new HashMap<>();
            user.put("userAddress", "0xUSERWALLET123"); // Hardcoded or fetch from user profile
            user.put("customerId", submission.getUserId());
            user.put("name", submission.getMaskedData().getOrDefault("name", "John Doe"));
            user.put("accountNumber", submission.getMaskedData().getOrDefault("accountNumber", "1234567890"));
            user.put("kycStatus", "Verified");
            payload.put("user", user);

            // Data (minimized fields)
            payload.put("data", minimizedFieldValues);

            // Privacy
            Map<String, Object> privacy = new HashMap<>();
            privacy.put("regulation", "DPDP");
            privacy.put("region", "India");
            privacy.put("useCase", request.getPurpose());
            privacy.put("thirdPartyId", request.getThirdPartyName());
            privacy.put("dataType", "financial_data");
            privacy.put("duration", 10); // Example: 10 days
            privacy.put("privacyLevel", 0.8);
            privacy.put("epsilon", 1.0);
            privacy.put("delta", 0.0001);
            privacy.put("dataFields", minimizedFields);
            privacy.put("purpose", request.getDescription());
            payload.put("privacy", privacy);

            // Blockchain
            Map<String, Object> blockchain = new HashMap<>();
            blockchain.put("dataHash", "0x" + java.util.UUID.randomUUID().toString().replace("-", ""));
            blockchain.put("token", "0xtoken" + java.util.UUID.randomUUID().toString().replace("-", ""));
            blockchain.put("encryptionKeyHash", "0xkey" + java.util.UUID.randomUUID().toString().replace("-", ""));
            blockchain.put("encryptionMethod", "AES-256-GCM");
            blockchain.put("tokenizationMethod", "Hash-based");
            blockchain.put("network", "sepolia");
            Map<String, Object> contractAddresses = new HashMap<>();
            contractAddresses.put("privacyFramework", "auto_filled");
            contractAddresses.put("dataTokenization", "auto_filled");
            contractAddresses.put("complianceManager", "auto_filled");
            blockchain.put("contractAddresses", contractAddresses);
            payload.put("blockchain", blockchain);

            // Compliance
            Map<String, Object> compliance = new HashMap<>();
            compliance.put("complianceType", "data_processing");
            compliance.put("isCompliant", true);
            compliance.put("details", "Data processed with privacy protection and blockchain verification");
            compliance.put("auditTrail", "Blockchain-verified compliance record");
            compliance.put("retentionPolicy", "1_year");
            compliance.put("dataResidency", "India");
            payload.put("compliance", compliance);

            // AI
            Map<String, Object> ai = new HashMap<>();
            ai.put("processingRequired", true);
            ai.put("models", java.util.Arrays.asList("differential-privacy", "anomaly-detection", "data-minimization"));
            Map<String, Object> anomalyDetection = new HashMap<>();
            anomalyDetection.put("enabled", true);
            anomalyDetection.put("threshold", 0.8);
            ai.put("anomalyDetection", anomalyDetection);
            Map<String, Object> differentialPrivacy = new HashMap<>();
            differentialPrivacy.put("enabled", true);
            differentialPrivacy.put("noiseType", "laplace");
            differentialPrivacy.put("sensitivity", 1.0);
            ai.put("differentialPrivacy", differentialPrivacy);
            payload.put("ai", ai);

            // Access
            Map<String, Object> access = new HashMap<>();
            access.put("ipAddress", "192.168.1.100");
            access.put("deviceFingerprint", "device_xyz_123");
            access.put("userAgent", "Mozilla/5.0...");
            access.put("sessionId", "session_123456");
            payload.put("access", access);

            // Response
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            Map<String, Object> workflow = new HashMap<>();
            workflow.put("dataHash", null);
            Map<String, Object> tokenization = new HashMap<>();
            tokenization.put("success", false);
            tokenization.put("token", null);
            workflow.put("tokenization", tokenization);
            Map<String, Object> consent = new HashMap<>();
            consent.put("success", false);
            consent.put("useCase", null);
            workflow.put("consent", consent);
            Map<String, Object> complianceResp = new HashMap<>();
            complianceResp.put("success", false);
            complianceResp.put("regulation", null);
            workflow.put("compliance", complianceResp);
            response.put("workflow", workflow);
            response.put("message", null);
            response.put("transactionHash", null);
            response.put("processingTime", null);
            payload.put("response", response);

            // Send to blockchain URL
            try {
                RestTemplate restTemplate = new RestTemplate();
                String blockchainUrl = "http://localhost:3001/api/blockchain/process-data";
                restTemplate.postForEntity(blockchainUrl, payload, String.class);
                auditLogger.log("BLOCKCHAIN_SENT", submission.getUserId(), "Blockchain payload sent for requestId=" + request.getRequestId());
            } catch (Exception e) {
                auditLogger.log("BLOCKCHAIN_FAIL", submission.getUserId(), "Failed to send to blockchain: " + e.getMessage());
            }
            return CompletableFuture.completedFuture(null);
        }
    }


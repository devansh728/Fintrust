package com.fintech.fintrust.authentication.model;

import lombok.*;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SmartContractRequest {
    private String id;
    private String userId;
    private String sessionId;
    private LocalDateTime timestamp;
    
    // Contract Information
    private String contractAddress;
    private String contractFunction;
    private String contractMethod;
    private Map<String, Object> contractParameters;
    
    // Execution Control
    private Boolean anomalyDetected;
    private Double anomalyScore;
    private String riskLevel;
    private Boolean executionAllowed;
    
    // Transaction Details
    private String transactionHash;
    private String blockNumber;
    private String gasUsed;
    private String gasPrice;
    private String status; // PENDING, SUCCESS, FAILED, REVERTED
    
    // Security Context
    private String securityLevel; // LOW, MEDIUM, HIGH, CRITICAL
    private Boolean requiresMultiSignature;
    private Boolean requiresTimeLock;
    private LocalDateTime timeLockUntil;
    
    // Data Privacy
    private Boolean dataEncrypted;
    private String encryptionMethod;
    private Boolean dataAnonymized;
    private String privacyLevel; // PUBLIC, PRIVATE, CONFIDENTIAL
    
    // Compliance
    private String regulatoryFramework; // GDPR, DPDP, etc.
    private Boolean compliantWithRegulations;
    private String auditTrail;
    
    // Response
    private String executionResult;
    private String errorMessage;
    private Map<String, Object> responseData;
} 
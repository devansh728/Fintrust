package com.thirdparty.user.request.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnomalyDetectionResult {
    private String id;
    private String userId;
    private String sessionId;
    private LocalDateTime timestamp;
    
    // Detection Results
    private Double overallAnomalyScore;
    private Boolean isAnomaly;
    private String anomalyType; // BEHAVIORAL, LOCATION, DEVICE, SESSION, etc.
    private String confidenceLevel; // HIGH, MEDIUM, LOW
    
    // Detailed Analysis
    private Map<String, Double> featureScores;
    private List<String> detectedAnomalies;
    private List<String> riskFactors;
    private String riskLevel; // LOW, MEDIUM, HIGH, CRITICAL
    
    // Behavioral Analysis
    private Double typingAnomalyScore;
    private Double touchAnomalyScore;
    private Double navigationAnomalyScore;
    private Double locationAnomalyScore;
    private Double deviceAnomalyScore;
    private Double sessionAnomalyScore;
    
    // Context Information
    private String actionType;
    private String endpoint;
    private String requestMethod;
    private Map<String, Object> contextData;
    
    // Response Actions
    private String recommendedAction; // ALLOW, BLOCK, CHALLENGE, MONITOR
    private List<String> securityMeasures;
    private Boolean requiresReauthentication;
    private Boolean triggersSmartContract;
    
    // Privacy and Compliance
    private Boolean dataAnonymized;
    private String consentLevel;
    private LocalDateTime dataRetentionUntil;
    
    // Machine Learning Metadata
    private String modelVersion;
    private String algorithmUsed;
    private Map<String, Object> modelParameters;
    private Double modelConfidence;
} 
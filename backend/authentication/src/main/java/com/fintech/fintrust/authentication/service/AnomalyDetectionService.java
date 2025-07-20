package com.fintech.fintrust.authentication.service;

import com.fintech.fintrust.authentication.model.*;
import com.fintech.fintrust.authentication.repository.UserBehaviorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnomalyDetectionService {
    
    private final UserBehaviorRepository userBehaviorRepository;
    
    // Machine Learning Model Parameters
    private static final double TYPING_ANOMALY_THRESHOLD = 0.7;
    private static final double TOUCH_ANOMALY_THRESHOLD = 0.6;
    private static final double LOCATION_ANOMALY_THRESHOLD = 0.8;
    private static final double SESSION_ANOMALY_THRESHOLD = 0.5;
    private static final double OVERALL_ANOMALY_THRESHOLD = 0.6;
    
    public AnomalyDetectionResult detectAnomaly(UserBehavior currentBehavior) {
        log.info("Starting anomaly detection for user: {}", currentBehavior.getUserId());
        log.info("user behaviur : {}", currentBehavior);
        // Get historical behavior data for comparison
        List<UserBehavior> historicalBehaviors = userBehaviorRepository
                .findByUserIdOrderByTimestampDesc(currentBehavior.getUserId())
                .stream()
                .limit(100) // Last 100 behaviors
                .collect(Collectors.toList());
        log.info("{}",historicalBehaviors);
        if (historicalBehaviors.isEmpty()) {
            // First-time user, create baseline
            return createBaselineResult(currentBehavior);
        }
        
        // Calculate anomaly scores for different behavioral aspects
        double typingAnomalyScore = calculateTypingAnomalyScore(currentBehavior, historicalBehaviors);
        double touchAnomalyScore = calculateTouchAnomalyScore(currentBehavior, historicalBehaviors);
        double locationAnomalyScore = calculateLocationAnomalyScore(currentBehavior, historicalBehaviors);
        double sessionAnomalyScore = calculateSessionAnomalyScore(currentBehavior, historicalBehaviors);
        double deviceAnomalyScore = calculateDeviceAnomalyScore(currentBehavior, historicalBehaviors);
        
        // Calculate overall anomaly score using weighted average
        double overallAnomalyScore = calculateOverallAnomalyScore(
                typingAnomalyScore, touchAnomalyScore, locationAnomalyScore, 
                sessionAnomalyScore, deviceAnomalyScore
        );
        
        // Determine if anomaly is detected
        boolean isAnomaly = overallAnomalyScore > OVERALL_ANOMALY_THRESHOLD;
        
        // Identify risk factors
        List<String> riskFactors = identifyRiskFactors(
                typingAnomalyScore, touchAnomalyScore, locationAnomalyScore,
                sessionAnomalyScore, deviceAnomalyScore
        );
        
        // Determine risk level
        String riskLevel = determineRiskLevel(overallAnomalyScore, riskFactors);
        
        // Determine recommended action
        String recommendedAction = determineRecommendedAction(overallAnomalyScore, riskLevel);
        
        // Create result
        AnomalyDetectionResult result = AnomalyDetectionResult.builder()
                .id(UUID.randomUUID().toString())
                .userId(currentBehavior.getUserId())
                .sessionId(currentBehavior.getSessionPattern().getSessionId())
                .timestamp(LocalDateTime.now())
                .overallAnomalyScore(overallAnomalyScore)
                .isAnomaly(isAnomaly)
                .anomalyType(determineAnomalyType(typingAnomalyScore, touchAnomalyScore, locationAnomalyScore))
                .confidenceLevel(determineConfidenceLevel(historicalBehaviors.size()))
                .typingAnomalyScore(typingAnomalyScore)
                .touchAnomalyScore(touchAnomalyScore)
                .navigationAnomalyScore(0.0) // TODO: Implement navigation analysis
                .locationAnomalyScore(locationAnomalyScore)
                .deviceAnomalyScore(deviceAnomalyScore)
                .sessionAnomalyScore(sessionAnomalyScore)
                .actionType(currentBehavior.getActionType())
                .endpoint(currentBehavior.getEndpoint())
                .requestMethod(currentBehavior.getRequestMethod())
                .contextData(currentBehavior.getContextData())
                .recommendedAction(recommendedAction)
                .securityMeasures(determineSecurityMeasures(riskLevel))
                .requiresReauthentication(overallAnomalyScore > 0.8)
                .triggersSmartContract(overallAnomalyScore > 0.9)
                .riskFactors(riskFactors)
                .riskLevel(riskLevel)
                .dataAnonymized(currentBehavior.getDataAnonymized())
                .consentLevel(currentBehavior.getConsentLevel())
                .dataRetentionUntil(currentBehavior.getDataRetentionUntil())
                .modelVersion("1.0")
                .algorithmUsed("Isolation Forest + Statistical Analysis")
                .modelParameters(createModelParameters())
                .modelConfidence(calculateModelConfidence(historicalBehaviors.size()))
                .build();
        
        // Save current behavior for future analysis
        userBehaviorRepository.save(currentBehavior);
        
        log.info("Anomaly detection completed. Score: {}, Anomaly: {}, Risk Level: {}", 
                overallAnomalyScore, isAnomaly, riskLevel);
        
        return result;
    }
    
    private double calculateTypingAnomalyScore(UserBehavior current, List<UserBehavior> historical) {
        if (current.getTypingPattern() == null) return 0.0;
        
        // Calculate average typing speed from historical data
        double avgHistoricalSpeed = historical.stream()
                .filter(b -> b.getTypingPattern() != null && b.getTypingPattern().getAverageTypingSpeed() != null)
                .mapToDouble(b -> b.getTypingPattern().getAverageTypingSpeed())
                .average()
                .orElse(0.0);
        
        if (avgHistoricalSpeed == 0.0) return 0.0;
        
        double currentSpeed = current.getTypingPattern().getAverageTypingSpeed();
        double speedDifference = Math.abs(currentSpeed - avgHistoricalSpeed) / avgHistoricalSpeed;
        
        // Normalize to 0-1 scale
        return Math.min(speedDifference, 1.0);
    }
    
    private double calculateTouchAnomalyScore(UserBehavior current, List<UserBehavior> historical) {
        if (current.getTouchPattern() == null) return 0.0;
        
        // Calculate average tap pressure from historical data
        double avgHistoricalPressure = historical.stream()
                .filter(b -> b.getTouchPattern() != null && b.getTouchPattern().getTapPressure() != null)
                .mapToDouble(b -> b.getTouchPattern().getTapPressure())
                .average()
                .orElse(0.0);
        
        if (avgHistoricalPressure == 0.0) return 0.0;
        
        double currentPressure = current.getTouchPattern().getTapPressure();
        double pressureDifference = Math.abs(currentPressure - avgHistoricalPressure) / avgHistoricalPressure;
        
        return Math.min(pressureDifference, 1.0);
    }
    
    private double calculateLocationAnomalyScore(UserBehavior current, List<UserBehavior> historical) {
        if (current.getLatitude() == null || current.getLongitude() == null) return 0.0;
        
        // Calculate distance from usual location
        double avgLat = historical.stream()
                .filter(b -> b.getLatitude() != null)
                .mapToDouble(UserBehavior::getLatitude)
                .average()
                .orElse(current.getLatitude());
        
        double avgLon = historical.stream()
                .filter(b -> b.getLongitude() != null)
                .mapToDouble(UserBehavior::getLongitude)
                .average()
                .orElse(current.getLongitude());
        
        double distance = calculateDistance(
                current.getLatitude(), current.getLongitude(),
                avgLat, avgLon
        );
        
        // Normalize distance (consider 100km as maximum anomaly)
        return Math.min(distance / 100.0, 1.0);
    }
    
    private double calculateSessionAnomalyScore(UserBehavior current, List<UserBehavior> historical) {
        if (current.getSessionPattern() == null) return 0.0;
        
        // Check for unusual session patterns
        long currentDuration = current.getSessionPattern().getSessionDuration();
        double avgHistoricalDuration = historical.stream()
                .filter(b -> b.getSessionPattern() != null && b.getSessionPattern().getSessionDuration() != null)
                .mapToDouble(b -> b.getSessionPattern().getSessionDuration())
                .average()
                .orElse(currentDuration);
        
        if (avgHistoricalDuration == 0.0) return 0.0;
        
        double durationDifference = Math.abs(currentDuration - avgHistoricalDuration) / avgHistoricalDuration;
        return Math.min(durationDifference, 1.0);
    }
    
    private double calculateDeviceAnomalyScore(UserBehavior current, List<UserBehavior> historical) {
        // Check if device is new or unusual
        Set<String> knownDevices = historical.stream()
                .map(UserBehavior::getDeviceId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        
        if (knownDevices.isEmpty()) return 0.0;
        
        return knownDevices.contains(current.getDeviceId()) ? 0.0 : 0.8;
    }
    
    private double calculateOverallAnomalyScore(double typing, double touch, double location, 
                                              double session, double device) {
        // Weighted average based on importance
        return (typing * 0.25 + touch * 0.20 + location * 0.30 + session * 0.15 + device * 0.10);
    }
    
    private List<String> identifyRiskFactors(double typing, double touch, double location, 
                                           double session, double device) {
        List<String> factors = new ArrayList<>();
        
        if (typing > TYPING_ANOMALY_THRESHOLD) factors.add("UNUSUAL_TYPING_PATTERN");
        if (touch > TOUCH_ANOMALY_THRESHOLD) factors.add("UNUSUAL_TOUCH_PATTERN");
        if (location > LOCATION_ANOMALY_THRESHOLD) factors.add("UNUSUAL_LOCATION");
        if (session > SESSION_ANOMALY_THRESHOLD) factors.add("UNUSUAL_SESSION_PATTERN");
        if (device > 0.5) factors.add("UNKNOWN_DEVICE");
        
        return factors;
    }
    
    private String determineRiskLevel(double anomalyScore, List<String> riskFactors) {
        if (anomalyScore > 0.9 || riskFactors.size() >= 4) return "CRITICAL";
        if (anomalyScore > 0.7 || riskFactors.size() >= 3) return "HIGH";
        if (anomalyScore > 0.5 || riskFactors.size() >= 2) return "MEDIUM";
        return "LOW";
    }
    
    private String determineRecommendedAction(double anomalyScore, String riskLevel) {
        if ("CRITICAL".equals(riskLevel) || anomalyScore > 0.9) return "BLOCK";
        if ("HIGH".equals(riskLevel) || anomalyScore > 0.7) return "CHALLENGE";
        if ("MEDIUM".equals(riskLevel) || anomalyScore > 0.5) return "MONITOR";
        return "ALLOW";
    }
    
    private String determineAnomalyType(double typing, double touch, double location) {
        if (location > LOCATION_ANOMALY_THRESHOLD) return "LOCATION";
        if (typing > TYPING_ANOMALY_THRESHOLD) return "BEHAVIORAL";
        if (touch > TOUCH_ANOMALY_THRESHOLD) return "BEHAVIORAL";
        return "NONE";
    }
    
    private String determineConfidenceLevel(int historicalDataSize) {
        if (historicalDataSize > 50) return "HIGH";
        if (historicalDataSize > 20) return "MEDIUM";
        return "LOW";
    }
    
    private List<String> determineSecurityMeasures(String riskLevel) {
        List<String> measures = new ArrayList<>();
        
        switch (riskLevel) {
            case "CRITICAL":
                measures.addAll(Arrays.asList("IMMEDIATE_SESSION_TERMINATION", "ACCOUNT_FREEZE", "ADMIN_NOTIFICATION"));
                break;
            case "HIGH":
                measures.addAll(Arrays.asList("MULTI_FACTOR_AUTHENTICATION", "ENHANCED_MONITORING", "USER_NOTIFICATION"));
                break;
            case "MEDIUM":
                measures.addAll(Arrays.asList("INCREASED_MONITORING", "LIMITED_FEATURE_ACCESS"));
                break;
            case "LOW":
                measures.add("BASIC_MONITORING");
                break;
        }
        
        return measures;
    }
    
    private Map<String, Object> createModelParameters() {
        Map<String, Object> params = new HashMap<>();
        params.put("typingThreshold", TYPING_ANOMALY_THRESHOLD);
        params.put("touchThreshold", TOUCH_ANOMALY_THRESHOLD);
        params.put("locationThreshold", LOCATION_ANOMALY_THRESHOLD);
        params.put("sessionThreshold", SESSION_ANOMALY_THRESHOLD);
        params.put("overallThreshold", OVERALL_ANOMALY_THRESHOLD);
        return params;
    }
    
    private double calculateModelConfidence(int historicalDataSize) {
        return Math.min(historicalDataSize / 100.0, 1.0);
    }
    
    private AnomalyDetectionResult createBaselineResult(UserBehavior behavior) {
        return AnomalyDetectionResult.builder()
                .id(UUID.randomUUID().toString())
                .userId(behavior.getUserId())
                .sessionId(behavior.getSessionPattern() != null ? behavior.getSessionPattern().getSessionId() : null)
                .timestamp(LocalDateTime.now())
                .overallAnomalyScore(0.0)
                .isAnomaly(false)
                .anomalyType("NONE")
                .confidenceLevel("LOW")
                .recommendedAction("ALLOW")
                .riskLevel("LOW")
                .modelVersion("1.0")
                .algorithmUsed("Baseline Creation")
                .modelConfidence(0.1)
                .build();
    }
    
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        // Haversine formula for calculating distance between two points
        final int R = 6371; // Earth's radius in kilometers
        
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c;
    }
} 
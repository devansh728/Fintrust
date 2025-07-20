package com.thirdparty.user.request.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Document(collection = "user_behaviors")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserBehavior {
    @Id
    private String id;
    private String userId;
    private String username;
    private LocalDateTime timestamp;
    
    // Device and Location Data
    private String deviceId;
    private String deviceType;
    private String deviceModel;
    private String ipAddress;
    private String userAgent;
    private Double latitude;
    private Double longitude;
    private String locationHash; // Privacy-preserving location
    
    // Behavioral Patterns
    private TypingPattern typingPattern;
    private TouchPattern touchPattern;
    private NavigationPattern navigationPattern;
    private SessionPattern sessionPattern;
    
    // Risk Indicators
    private Double anomalyScore;
    private List<String> riskFactors;
    private String riskLevel; // LOW, MEDIUM, HIGH, CRITICAL
    
    // Context Information
    private String actionType; // LOGIN, TRANSACTION, NAVIGATION, etc.
    private String endpoint;
    private String requestMethod;
    private Map<String, Object> contextData;
    
    // Privacy and Compliance
    private Boolean dataAnonymized;
    private String consentLevel;
    private LocalDateTime dataRetentionUntil;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TypingPattern {
        private Double averageTypingSpeed; // characters per second
        private Double typingVariance;
        private Double pauseDuration;
        private Double backspaceFrequency;
        private Map<String, Double> keyPressIntervals;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TouchPattern {
        private Double tapPressure;
        private Double tapDuration;
        private Double swipeVelocity;
        private Double swipeDistance;
        private String swipeDirection;
        private Double screenSize;
        private String touchArea; // top, bottom, left, right, center
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class NavigationPattern {
        private String previousPage;
        private String currentPage;
        private String nextPage;
        private Double timeOnPage;
        private Integer scrollDepth;
        private List<String> navigationPath;
        private Double navigationSpeed;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SessionPattern {
        private LocalDateTime sessionStart;
        private LocalDateTime sessionEnd;
        private Long sessionDuration;
        private Integer requestCount;
        private String sessionId;
        private Boolean isActive;
        private List<String> accessedEndpoints;
    }
} 
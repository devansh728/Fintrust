package com.thirdparty.user.request.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.thirdparty.user.request.domain.AnomalyDetectionResult;
import com.thirdparty.user.request.domain.User;
import com.thirdparty.user.request.domain.UserBehavior;
import com.thirdparty.user.request.dto.CustomUserDetails;
import com.thirdparty.user.request.repository.UserRepository;
import com.thirdparty.user.request.service.AnomalyDetectionService;
import com.thirdparty.user.request.service.JwtService;
import com.thirdparty.user.request.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.Enumeration;

@Component
@RequiredArgsConstructor
@Slf4j
public class AnomalyDetectionFilter extends OncePerRequestFilter {
    
    private final JwtService jwtService;
    private final AnomalyDetectionService anomalyDetectionService;
    private final ObjectMapper objectMapper;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        final String authHeader = request.getHeader("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extract all user behavior and authentication headers and store as request attribute
        Map<String, String> behaviorHeaders = new HashMap<>();
        behaviorHeaders.put("Authorization", request.getHeader("Authorization"));
        behaviorHeaders.put("X-User-ID", request.getHeader("X-User-ID"));
        behaviorHeaders.put("X-Session-ID", request.getHeader("X-Session-ID"));
        behaviorHeaders.put("X-Device-ID", request.getHeader("X-Device-ID"));
        behaviorHeaders.put("X-Device-Type", request.getHeader("X-Device-Type"));
        behaviorHeaders.put("X-Device-Model", request.getHeader("X-Device-Model"));
        behaviorHeaders.put("X-User-Location", request.getHeader("X-User-Location"));
        behaviorHeaders.put("X-Typing-Pattern", request.getHeader("X-Typing-Pattern"));
        behaviorHeaders.put("X-Touch-Pattern", request.getHeader("X-Touch-Pattern"));
        behaviorHeaders.put("User-Agent", request.getHeader("User-Agent"));
        request.setAttribute("behaviorHeaders", behaviorHeaders);
        
        try {
            final String jwt = authHeader.substring(7);
            final String username = jwtService.extractUsernameFromAccessToken(jwt);
            
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                User user = userRepository.findByUsername(username).orElseThrow(() -> new IllegalArgumentException("User with username '" + username + "' not found"));
                UserDetails userDetails = new CustomUserDetails(user);
                
                if (jwtService.validateAccessToken(jwt)) {
                    // Create user behavior data for anomaly detection
                    UserBehavior userBehavior = createUserBehavior(request, username, userDetails);
                    
                    // Perform anomaly detection
                    AnomalyDetectionResult anomalyResult = anomalyDetectionService.detectAnomaly(userBehavior);
                    
                    // Check if anomaly is detected
                    if (anomalyResult.getIsAnomaly()) {
                        log.warn("Anomaly detected for user: {}. Score: {}, Risk Level: {}", 
                                username, anomalyResult.getOverallAnomalyScore(), anomalyResult.getRiskLevel());
                        
                        // Block the request if anomaly is detected
                        if (anomalyResult.getRecommendedAction().equals("BLOCK")) {
                            sendAnomalyResponse(response, anomalyResult);
                            return;
                        }
                        
                        // Challenge the user if anomaly is detected but not critical
                        if (anomalyResult.getRecommendedAction().equals("CHALLENGE")) {
                            sendChallengeResponse(response, anomalyResult);
                            return;
                        }
                    }
                    
                    // If no anomaly or anomaly is acceptable, proceed with authentication
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    
                    // Add anomaly detection headers to response
                    addAnomalyHeaders(response, anomalyResult);
                }
            }
            
            filterChain.doFilter(request, response);
            
        } catch (Exception e) {
            log.error("Error in anomaly detection filter: {}", e.getMessage());
            filterChain.doFilter(request, response);
        }
    }
    
    private UserBehavior createUserBehavior(HttpServletRequest request, String username, UserDetails userDetails) {
        // Extract behavioral data from request
        Map<String, Object> contextData = new HashMap<>();
        contextData.put("userAgent", request.getHeader("User-Agent"));
        contextData.put("acceptLanguage", request.getHeader("Accept-Language"));
        contextData.put("referer", request.getHeader("Referer"));
        contextData.put("requestSize", request.getContentLength());
        
        // Extract location data if available
        String locationHeader = request.getHeader("X-User-Location");
        Double latitude = null;
        Double longitude = null;
        if (locationHeader != null) {
            try {
                String[] coords = locationHeader.split(",");
                if (coords.length == 2) {
                    latitude = Double.parseDouble(coords[0].trim());
                    longitude = Double.parseDouble(coords[1].trim());
                }
            } catch (NumberFormatException e) {
                log.warn("Invalid location format: {}", locationHeader);
            }
        }
        
        // Extract behavioral data if available
        String typingData = request.getHeader("X-Typing-Pattern");
        String touchData = request.getHeader("X-Touch-Pattern");
        
        UserBehavior.TypingPattern typingPattern = null;
        if (typingData != null) {
            try {
                Map<String, Object> typingMap = objectMapper.readValue(typingData, Map.class);
                typingPattern = UserBehavior.TypingPattern.builder()
                        .averageTypingSpeed((Double) typingMap.get("averageSpeed"))
                        .typingVariance((Double) typingMap.get("variance"))
                        .pauseDuration((Double) typingMap.get("pauseDuration"))
                        .backspaceFrequency((Double) typingMap.get("backspaceFreq"))
                        .build();
            } catch (Exception e) {
                log.warn("Invalid typing pattern data: {}", typingData);
            }
        }
        
        UserBehavior.TouchPattern touchPattern = null;
        if (touchData != null) {
            try {
                Map<String, Object> touchMap = objectMapper.readValue(touchData, Map.class);
                touchPattern = UserBehavior.TouchPattern.builder()
                        .tapPressure((Double) touchMap.get("pressure"))
                        .tapDuration((Double) touchMap.get("duration"))
                        .swipeVelocity((Double) touchMap.get("velocity"))
                        .swipeDistance((Double) touchMap.get("distance"))
                        .swipeDirection((String) touchMap.get("direction"))
                        .screenSize((Double) touchMap.get("screenSize"))
                        .touchArea((String) touchMap.get("area"))
                        .build();
            } catch (Exception e) {
                log.warn("Invalid touch pattern data: {}", touchData);
            }
        }
        
        return UserBehavior.builder()
                .id(UUID.randomUUID().toString())
                .userId(userDetails.getUsername())
                .username(username)
                .timestamp(LocalDateTime.now())
                .deviceId(request.getHeader("X-Device-ID"))
                .deviceType(request.getHeader("X-Device-Type"))
                .deviceModel(request.getHeader("X-Device-Model"))
                .ipAddress(getClientIpAddress(request))
                .userAgent(request.getHeader("User-Agent"))
                .latitude(latitude)
                .longitude(longitude)
                .locationHash(generateLocationHash(latitude, longitude))
                .typingPattern(typingPattern)
                .touchPattern(touchPattern)
                .navigationPattern(UserBehavior.NavigationPattern.builder()
                        .currentPage(request.getRequestURI())
                        .build())
                .sessionPattern(UserBehavior.SessionPattern.builder()
                        .sessionId(request.getSession().getId())
                        .isActive(true)
                        .build())
                .actionType("API_REQUEST")
                .endpoint(request.getRequestURI())
                .requestMethod(request.getMethod())
                .contextData(contextData)
                .dataAnonymized(true)
                .consentLevel("EXPLICIT")
                .dataRetentionUntil(LocalDateTime.now().plusYears(1))
                .build();
    }
    
    private void sendAnomalyResponse(HttpServletResponse response, AnomalyDetectionResult anomalyResult) throws IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", "ANOMALY_DETECTED");
        errorResponse.put("message", "Access blocked due to detected anomaly");
        errorResponse.put("anomalyScore", anomalyResult.getOverallAnomalyScore());
        errorResponse.put("riskLevel", anomalyResult.getRiskLevel());
        errorResponse.put("riskFactors", anomalyResult.getRiskFactors());
        errorResponse.put("recommendedAction", anomalyResult.getRecommendedAction());
        errorResponse.put("timestamp", LocalDateTime.now());
        
        objectMapper.writeValue(response.getWriter(), errorResponse);
    }
    
    private void sendChallengeResponse(HttpServletResponse response, AnomalyDetectionResult anomalyResult) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        
        Map<String, Object> challengeResponse = new HashMap<>();
        challengeResponse.put("error", "ANOMALY_CHALLENGE");
        challengeResponse.put("message", "Additional verification required");
        challengeResponse.put("anomalyScore", anomalyResult.getOverallAnomalyScore());
        challengeResponse.put("riskLevel", anomalyResult.getRiskLevel());
        challengeResponse.put("challengeType", "MULTI_FACTOR_AUTHENTICATION");
        challengeResponse.put("timestamp", LocalDateTime.now());
        
        objectMapper.writeValue(response.getWriter(), challengeResponse);
    }
    
    private void addAnomalyHeaders(HttpServletResponse response, AnomalyDetectionResult anomalyResult) {
        response.setHeader("X-Anomaly-Score", String.valueOf(anomalyResult.getOverallAnomalyScore()));
        response.setHeader("X-Risk-Level", anomalyResult.getRiskLevel());
        response.setHeader("X-Confidence-Level", anomalyResult.getConfidenceLevel());
        response.setHeader("X-Security-Measures", String.join(",", anomalyResult.getSecurityMeasures()));
    }
    
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0];
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
    
    private String generateLocationHash(Double latitude, Double longitude) {
        if (latitude == null || longitude == null) {
            return null;
        }
        // Generate privacy-preserving location hash (rounded to ~1km precision)
        int latRounded = (int) (latitude * 100);
        int lonRounded = (int) (longitude * 100);
        return String.format("%d,%d", latRounded, lonRounded);
    }
} 
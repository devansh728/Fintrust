package com.fintrust.Consent.security.filter;

import com.fintrust.Consent.security.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.Collections;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class JwtTokenFilter extends OncePerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger(JwtTokenFilter.class);
    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        String token = null;
        logger.info("JwtTokenFilter: Incoming request URI: {}", request.getRequestURI());
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            logger.info("JwtTokenFilter: Bearer token found");
        } else {
            logger.warn("JwtTokenFilter: No Bearer token found in Authorization header");
        }

        if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                if (jwtUtil.validateToken(token)) {
                    String userId = jwtUtil.extractUserId(token);
                    logger.info("JwtTokenFilter: Token valid, extracted userId: {}", userId);
                    // --- Behavioral Anomaly Detection Integration ---
                    try {
                        RestTemplate restTemplate = new RestTemplate();
                        String detectUrl = "http://localhost:9001/detect";
                        HttpHeaders detectHeaders = new HttpHeaders();
                        detectHeaders.set("User-Agent", request.getHeader("User-Agent"));
                        detectHeaders.set("X-Forwarded-For", request.getRemoteAddr());
                        detectHeaders.setContentType(MediaType.APPLICATION_JSON);
                        HttpEntity<String> detectEntity = new HttpEntity<>(null, detectHeaders);
                        ResponseEntity<Map> detectResponse = restTemplate.postForEntity(detectUrl, detectEntity, Map.class);
                        if (detectResponse.getStatusCode().is2xxSuccessful() && detectResponse.getBody() != null) {
                            Object riskLevelObj = detectResponse.getBody().get("riskLevel");
                            Object anomalyScoreObj = detectResponse.getBody().get("anomalyScore");
                            String riskLevel = riskLevelObj != null ? riskLevelObj.toString() : "UNKNOWN";
                            logger.info("Behavioral Detection: riskLevel={}, anomalyScore={}", riskLevel, anomalyScoreObj);
                            if ("HIGH".equalsIgnoreCase(riskLevel) || "CRITICAL".equalsIgnoreCase(riskLevel)) {
                                logger.warn("Suspicious user detected: riskLevel={}, blocking request", riskLevel);
                                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                                response.setContentType("application/json");
                                response.getWriter().write("{\"error\":\"Suspicious user detected\"}");
                                return;
                            }
                        } else {
                            logger.warn("/detect API returned non-2xx or empty body, proceeding with request");
                        }
                    } catch (Exception ex) {
                        logger.error("Error calling /detect API: {}. Proceeding with request.", ex.getMessage());
                    }
                    // --- End Behavioral Detection ---
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userId, null, Collections.emptyList());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (io.jsonwebtoken.ExpiredJwtException ex) {
                logger.warn("JwtTokenFilter: Access token expired, attempting refresh");
                // Try to get refresh token from header (or cookie)
                String refreshToken = request.getHeader("Authorization-Refresh");
                if (refreshToken != null && refreshToken.startsWith("Bearer ")) {
                    refreshToken = refreshToken.substring(7);
                }
                if (refreshToken != null && !refreshToken.isEmpty()) {
                    try {
                        // Call the auth microservice to refresh the token
                        RestTemplate restTemplate = new RestTemplate();
                        String refreshUrl = "http://localhost:8080/api/auth/refresh-token";
                        Map<String, String> body = new HashMap<>();
                        body.put("refreshToken", refreshToken);
                        HttpHeaders headers = new HttpHeaders();
                        headers.setContentType(MediaType.APPLICATION_JSON);
                        HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);
                        ResponseEntity<Map> refreshResponse = restTemplate.postForEntity(refreshUrl, entity, Map.class);
                        if (refreshResponse.getStatusCode().is2xxSuccessful() && refreshResponse.getBody() != null) {
                            String newAccessToken = (String) refreshResponse.getBody().get("accessToken");
                            if (newAccessToken != null && jwtUtil.validateToken(newAccessToken)) {
                                String userId = jwtUtil.extractUserId(newAccessToken);
                                logger.info("JwtTokenFilter: Refreshed token valid, extracted userId: {}", userId);
                                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                        userId, null, Collections.emptyList());
                                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                                SecurityContextHolder.getContext().setAuthentication(authentication);
                                // Optionally, set new access token in response header for frontend
                                response.setHeader("X-New-Access-Token", newAccessToken);
                            }
                        }
                    } catch (Exception refreshEx) {
                        logger.error("JwtTokenFilter: Failed to refresh token: {}", refreshEx.getMessage());
                        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token expired and refresh failed");
                        return;
                    }
                } else {
                    logger.warn("JwtTokenFilter: No refresh token provided for expired access token");
                }
            } catch (Exception e) {
                logger.warn("JwtTokenFilter: Invalid token or authentication already set");
            }
        }
        filterChain.doFilter(request, response);
    }
}

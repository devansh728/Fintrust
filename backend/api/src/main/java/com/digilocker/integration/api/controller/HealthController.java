package com.digilocker.integration.api.controller;

import com.digilocker.integration.api.service.DigiLockerOAuth2Service;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
public class HealthController {

    private final DigiLockerOAuth2Service digiLockerOAuth2Service;

    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication != null ? authentication.getName() : "anonymous";
        
        boolean isConnected = false;
        if (!"anonymous".equals(username)) {
            try {
                isConnected = digiLockerOAuth2Service.isUserConnected(username);
            } catch (Exception e) {
                // Ignore errors in health check
            }
        }
        
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "DigiLocker Integration API",
                "authenticated_user", username,
                "digilocker_connected", isConnected,
                "timestamp", System.currentTimeMillis()
        ));
    }
} 
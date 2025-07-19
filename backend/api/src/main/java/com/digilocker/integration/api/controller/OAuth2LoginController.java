package com.digilocker.integration.api.controller;

import com.digilocker.integration.api.dto.DigiLockerConnectionResponse;
import com.digilocker.integration.api.service.DigiLockerOAuth2Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/digilocker") //v1
@RequiredArgsConstructor
@Slf4j
public class OAuth2LoginController {

    private final DigiLockerOAuth2Service digiLockerOAuth2Service;
    private final OAuth2AuthorizedClientService authorizedClientService;

    /**
     * Initiates DigiLocker OAuth2 authorization flow
     * Requires valid JWT token in Authorization header
     */
    @PostMapping("/connect")
    public ResponseEntity<DigiLockerConnectionResponse> connectToDigiLocker() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        log.info("Initiating DigiLocker connection for user: {}", username);
        
        try {
            String authorizationUrl = digiLockerOAuth2Service.initiateAuthorization(username);
            return ResponseEntity.ok(DigiLockerConnectionResponse.builder()
                    .success(true)
                    .message("DigiLocker authorization initiated")
                    .authorizationUrl(authorizationUrl)
                    .build());
        } catch (Exception e) {
            log.error("Error initiating DigiLocker connection for user {}: {}", username, e.getMessage());
            return ResponseEntity.badRequest().body(DigiLockerConnectionResponse.builder()
                    .success(false)
                    .message("Failed to initiate DigiLocker connection: " + e.getMessage())
                    .build());
        }
    }

    /**
     * Handles OAuth2 callback from DigiLocker
     * This endpoint is called by DigiLocker after user authorization
     */
    @GetMapping("/callback")
    public ResponseEntity<DigiLockerConnectionResponse> handleCallback(
            @RequestParam("code") String code,
            @RequestParam("state") String state) {
        
        log.info("Received OAuth2 callback with code and state");
        
        try {
            String username = digiLockerOAuth2Service.handleCallback(code, state);
            
            return ResponseEntity.ok(DigiLockerConnectionResponse.builder()
                    .success(true)
                    .message("DigiLocker connection successful")
                    .username(username)
                    .build());
        } catch (Exception e) {
            log.error("Error handling OAuth2 callback: {}", e.getMessage());
            return ResponseEntity.badRequest().body(DigiLockerConnectionResponse.builder()
                    .success(false)
                    .message("Failed to complete DigiLocker connection: " + e.getMessage())
                    .build());
        }
    }

    /**
     * Check DigiLocker connection status for current user
     */
    @GetMapping("/status")
    public ResponseEntity<DigiLockerConnectionResponse> checkConnectionStatus() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        try {
            boolean isConnected = digiLockerOAuth2Service.isUserConnected(username);
            return ResponseEntity.ok(DigiLockerConnectionResponse.builder()
                    .success(true)
                    .message(isConnected ? "Connected to DigiLocker" : "Not connected to DigiLocker")
                    .connected(isConnected)
                    .username(username)
                    .build());
        } catch (Exception e) {
            log.error("Error checking DigiLocker connection status for user {}: {}", username, e.getMessage());
            return ResponseEntity.badRequest().body(DigiLockerConnectionResponse.builder()
                    .success(false)
                    .message("Failed to check connection status: " + e.getMessage())
                    .build());
        }
    }

    /**
     * Disconnect from DigiLocker (remove stored tokens)
     */
    @DeleteMapping("/disconnect")
    public ResponseEntity<DigiLockerConnectionResponse> disconnectFromDigiLocker() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        log.info("Disconnecting DigiLocker for user: {}", username);
        
        try {
            digiLockerOAuth2Service.disconnectUser(username);
            return ResponseEntity.ok(DigiLockerConnectionResponse.builder()
                    .success(true)
                    .message("Successfully disconnected from DigiLocker")
                    .username(username)
                    .build());
        } catch (Exception e) {
            log.error("Error disconnecting DigiLocker for user {}: {}", username, e.getMessage());
            return ResponseEntity.badRequest().body(DigiLockerConnectionResponse.builder()
                    .success(false)
                    .message("Failed to disconnect from DigiLocker: " + e.getMessage())
                    .build());
        }
    }
} 
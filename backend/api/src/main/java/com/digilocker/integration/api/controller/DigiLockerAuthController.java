package com.digilocker.integration.api.controller;

import com.digilocker.integration.api.dto.TokenResponse;
import com.digilocker.integration.api.service.DigiLockerIntegrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/digilocker/auth")
@RequiredArgsConstructor
public class DigiLockerAuthController {

    private final DigiLockerIntegrationService integrationService;

    @GetMapping("/initiate")
    public ResponseEntity<String> initiateAuth(
            @RequestParam String userId) {

        String authUrl = integrationService.initiateAuthorization(userId);
        return ResponseEntity.ok(authUrl);
    }

    @PostMapping("/callback")
    public ResponseEntity<TokenResponse> handleCallback(
            @RequestParam String code,
            @RequestParam String state) {

        TokenResponse response = integrationService.exchangeCode(code, state);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refreshToken(
            @RequestParam String userId) {

        TokenResponse response = integrationService.refreshToken(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status")
    public ResponseEntity<Boolean> checkTokenStatus(
            @RequestParam String userId) {

        boolean isValid = integrationService.isTokenValid(userId);
        return ResponseEntity.ok(isValid);
    }
}

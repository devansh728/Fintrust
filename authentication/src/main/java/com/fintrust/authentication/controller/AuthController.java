package com.fintrust.authentication.controller;

import com.fintrust.authentication.dto.*;
import com.fintrust.authentication.service.AuthService;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok().body("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response); // 200 OK on success
        }
        catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Invalid credentials");
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body( "Login failed: " + e.getMessage());
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refresh(@RequestBody RefreshRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody LogoutRequest  request) {
        authService.logout(request);
        return ResponseEntity.ok(
                new ApiResponse(true, "Logout successful")
        );
    }
    @PostMapping("/validate-token")
    public ResponseEntity<?> validateToken(
            @RequestHeader(name = HttpHeaders.AUTHORIZATION) String authHeader
    ) {
        if (!authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest()
                    .body(new TokenValidationResult(false, "Invalid Authorization header"));
        }

        String token = authHeader.substring(7);
        TokenValidationResult result = authService.validateToken(token);
        return ResponseEntity.ok(result);
    }

    @Data
    @AllArgsConstructor
    private static class ApiResponse {
        private boolean success;
        private String message;
    }
    
}

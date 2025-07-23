package com.fintrust.authentication.controller;

import com.fintrust.authentication.dto.*;
import com.fintrust.authentication.service.AuthService;

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
        } catch (BadCredentialsException e) {
            // Return 401 Unauthorized for invalid email or password
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (IllegalStateException e) {
            // This indicates a rare data inconsistency where authentication succeeded but user wasn't found
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal error: " + e.getMessage());
        } catch (RuntimeException e) {
            // Catch any other unexpected runtime exceptions from the service layer
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred: " + e.getMessage());
        } catch (Exception e) {
            // Catch any other general exceptions not specifically handled
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unknown error occurred.");
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refresh(@RequestBody RefreshRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody LogoutRequest  request) {
        return ResponseEntity.ok(authService.logout(request));
    }
    @PostMapping("/validate-token")
    public ResponseEntity<?> validateToken(@RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader) {
        String token = null;
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            
            return ResponseEntity.badRequest().body("Authorization header is missing or does not start with 'Bearer '");
        }
        token = authorizationHeader.substring(7);

        return ResponseEntity.ok(authService.validateToken(token));
    }
    
}

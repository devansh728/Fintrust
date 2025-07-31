package com.fintrust.authentication.dto;

import io.jsonwebtoken.Claims;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TokenValidationResult {
    private boolean valid;
    private String message;
    private Claims claims;
    public TokenValidationResult(boolean valid, String message) {
        this.valid = valid;
        this.message = message;
        this.claims = null;
    }
}
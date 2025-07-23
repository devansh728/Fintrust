package com.fintrust.authentication.service;

import com.fintrust.authentication.model.User;
import io.jsonwebtoken.Claims;

public interface JwtService {
    String generateAccessToken(User user);
    String generateRefreshToken(User user);
    boolean validateToken(String token);
    Claims extractClaims(String token);
    String extractUserId(String token);
}

package com.fintrust.authentication.service;

import com.fintrust.authentication.dto.*;
import com.fintrust.authentication.model.User;

public interface AuthService {
    User register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refreshToken(RefreshRequest request);
    void logout(LogoutRequest request);
    TokenValidationResult validateToken(String token);
}
    
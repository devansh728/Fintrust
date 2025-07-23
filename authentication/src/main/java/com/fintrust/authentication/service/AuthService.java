package com.fintrust.authentication.service;

import com.fintrust.authentication.dto.*;
import com.fintrust.authentication.model.User;

public interface AuthService {
    User register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refreshToken(RefreshRequest request);
    AuthResponse logout(LogoutRequest request);
    Boolean validateToken(String token);
}
    
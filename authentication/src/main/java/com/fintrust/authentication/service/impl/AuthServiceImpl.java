package com.fintrust.authentication.service.impl;

import com.fintrust.authentication.dto.*;
import com.fintrust.authentication.model.AuthProvider;
import com.fintrust.authentication.model.Role;
import com.fintrust.authentication.model.User;
import com.fintrust.authentication.repository.UserRepository;
import com.fintrust.authentication.service.AuthService;
import com.fintrust.authentication.service.JwtService;
import com.fintrust.authentication.service.UserService;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.util.StringUtils;
import java.time.Instant;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UserService userService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;

    @Override
    public User register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .authProvider(AuthProvider.LOCAL)
                .createdAt(Instant.now())
                .build();
        return userRepository.save(user);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(auth);

            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new IllegalStateException("User not found after authentication"));

            String accessToken = jwtService.generateAccessToken(user);
            String refreshToken = jwtService.generateRefreshToken(user);
            user.setRefreshToken(refreshToken);
            userRepository.save(user);

            return new AuthResponse(accessToken, refreshToken, user);
        } catch (AuthenticationException e) {
            throw new BadCredentialsException("Invalid credentials");
        }
    }

    @Override
    public AuthResponse refreshToken(RefreshRequest request) {
        if (!jwtService.validateToken(request.getRefreshToken())) {
            throw new SecurityException("Invalid refresh token");
        }

        String email = jwtService.extractUserId(request.getRefreshToken());
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new SecurityException("User not found"));

        if (!request.getRefreshToken().equals(user.getRefreshToken())) {
            throw new SecurityException("Refresh token mismatch");
        }

        String newAccessToken = jwtService.generateAccessToken(user);
        String newRefreshToken = jwtService.generateRefreshToken(user);

        user.setRefreshToken(newRefreshToken);
        userRepository.save(user);

        return new AuthResponse(newAccessToken, newRefreshToken, user);
    }

    @Override
    public void logout(LogoutRequest request) {
        if (!jwtService.validateToken(request.getRefreshToken())) return;

        String email = jwtService.extractUserId(request.getRefreshToken());
        userService.findByEmail(email).ifPresent(user -> {
            user.setRefreshToken(null);
            userRepository.save(user);
        });
    }

    @Override
    public TokenValidationResult validateToken(String token) {
        if (!StringUtils.hasText(token)) {
            return new TokenValidationResult(false, "Token is empty");
        }

        try {
            Claims claims = jwtService.extractClaims(token);
            return new TokenValidationResult(true, "Valid token", claims);
        } catch (Exception e) {
            return new TokenValidationResult(false, "Invalid token: " + e.getMessage());
        }
    }
}

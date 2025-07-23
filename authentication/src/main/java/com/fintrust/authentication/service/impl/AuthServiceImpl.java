package com.fintrust.authentication.service.impl;

import com.fintrust.authentication.dto.*;
import com.fintrust.authentication.model.AuthProvider;
import com.fintrust.authentication.model.Role;
import com.fintrust.authentication.model.User;
import com.fintrust.authentication.repository.UserRepository;
import com.fintrust.authentication.service.AuthService;
import com.fintrust.authentication.service.JwtService;
import com.fintrust.authentication.service.UserService;
import lombok.RequiredArgsConstructor;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
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
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (Exception e) {
            throw new BadCredentialsException("Invalid email or password");
        }
        SecurityContextHolder.getContext().setAuthentication(authentication);
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        user.setRefreshToken(refreshToken); // Store refresh token in user object
        userRepository.save(user); // Save user with updated refresh token
        return new AuthResponse(accessToken, refreshToken, user);
    }

    @Override
    public AuthResponse refreshToken(RefreshRequest request) {
        org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(AuthServiceImpl.class);
        logger.info("[refreshToken] Incoming refresh token: {}", request.getRefreshToken());
        if (!StringUtils.hasText(request.getRefreshToken())) {
            logger.error("[refreshToken] Refresh token is missing");
            throw new RuntimeException("Refresh token is missing");
        }
        boolean valid = false;
        try {
            valid = jwtService.validateToken(request.getRefreshToken());
        } catch (Exception e) {
            logger.error("[refreshToken] Exception during token validation: {}", e.getMessage(), e);
        }
        if (!valid) {
            logger.error("[refreshToken] Refresh token is invalid or expired");
            throw new RuntimeException("Refresh token is invalid or expired");
        }
        String userId = null;
        try {
            userId = jwtService.extractUserId(request.getRefreshToken());
            logger.info("[refreshToken] Extracted userId/email from token: {}", userId);
        } catch (Exception e) {
            logger.error("[refreshToken] Failed to extract userId from token: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to extract user from token");
        }
        Optional<User> userOpt = userService.findByEmail(userId);
        if (userOpt.isEmpty()) {
            logger.error("[refreshToken] User not found for email: {}", userId);
            throw new RuntimeException("User not found");
        }
        User user = userOpt.get();
        logger.info("[refreshToken] User found: {}", user.getEmail());
        if (user.getRefreshToken() == null) {
            logger.error("[refreshToken] No refresh token stored for user {}");
            throw new RuntimeException("No refresh token stored for user");
        }
        if (!user.getRefreshToken().equals(request.getRefreshToken())) {
            logger.error("[refreshToken] Provided refresh token does not match stored token for user {}", user.getEmail());
            throw new RuntimeException("Refresh token does not match the stored token");
        }
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        user.setRefreshToken(refreshToken);
        userRepository.save(user); // Save user with updated refresh token
        logger.info("[refreshToken] Successfully refreshed tokens for user {}", user.getEmail());
        return new AuthResponse(accessToken, refreshToken, user);
    }

    @Override
    public AuthResponse logout(LogoutRequest request) {
        if (!StringUtils.hasText(request.getRefreshToken()) || !jwtService.validateToken(request.getRefreshToken())) {
            throw new RuntimeException("Invalid refresh token");
        }
        String userId = jwtService.extractUserId(request.getRefreshToken());
        User user = userService.findByEmail(userId)
            .orElseGet(() -> userService.findByEmail(userId).orElseThrow(() -> new RuntimeException("User not found")));
        if (user != null && request.getRefreshToken().equals(user.getRefreshToken())) {
            user.setRefreshToken(null);
            userRepository.save(user);
        }
        return new AuthResponse(null, null, user);
    }

    @Override
    public Boolean validateToken(String token) {
        if (!StringUtils.hasText(token)) {
            return false;
        }
        try {
            return jwtService.validateToken(token);
        } catch (Exception e) {
            return false; // Token is invalid or expired
        }
    }
}

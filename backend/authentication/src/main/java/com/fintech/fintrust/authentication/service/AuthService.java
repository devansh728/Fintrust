package com.fintech.fintrust.authentication.service;

import com.fintech.fintrust.authentication.model.*;
import com.fintech.fintrust.authentication.repository.UserRepository;
import com.fintech.fintrust.authentication.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public void register(SignupRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        User user = User.builder()
                .username(request.getUsername())
                .userId("XX-"+ request.getUsername().hashCode()) // Example userId generation
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(Collections.singletonList("ROLE_USER"))
                .build();
        userRepository.save(user);
    }

    public AuthResponse login(SigninRequest request) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
        } catch (Exception e) {
            throw new BadCredentialsException("Invalid username or password");
        }
        SecurityContextHolder.getContext().setAuthentication(authentication);
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadCredentialsException("User not found"));
        String accessToken = jwtService.generateAccessToken(user.getUsername(), user.getRoles());
        String refreshToken = jwtService.generateRefreshToken(user.getUsername());
        user.setRefreshToken(refreshToken);
        userRepository.save(user);
        return new AuthResponse(accessToken, refreshToken, user.getUsername(), user.getRoles());
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        if (!jwtService.validateRefreshToken(refreshToken)) {
            throw new BadCredentialsException("Invalid refresh token");
        }
        String username = jwtService.extractUsernameFromRefreshToken(refreshToken);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BadCredentialsException("User not found"));
        if (!refreshToken.equals(user.getRefreshToken())) {
            throw new BadCredentialsException("Refresh token does not match");
        }
        // Rotate refresh token
        String newRefreshToken = jwtService.generateRefreshToken(username);
        user.setRefreshToken(newRefreshToken);
        userRepository.save(user);
        String accessToken = jwtService.generateAccessToken(username, user.getRoles());
        return new AuthResponse(accessToken, newRefreshToken, username, user.getRoles());
    }

    public void logout(LogoutRequest request) {
        String refreshToken = request.getRefreshToken();
        if (!jwtService.validateRefreshToken(refreshToken)) {
            return; // Already invalid
        }
        String username = jwtService.extractUsernameFromRefreshToken(refreshToken);
        User user = userRepository.findByUsername(username).orElse(null);
        if (user != null && refreshToken.equals(user.getRefreshToken())) {
            user.setRefreshToken(null);
            userRepository.save(user);
        }
    }

    public String getProfileMessage(String username) {
        return "Welcome, " + username + "! This is a protected resource.";
    }
}

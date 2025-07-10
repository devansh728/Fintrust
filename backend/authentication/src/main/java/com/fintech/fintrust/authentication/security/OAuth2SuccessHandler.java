package com.fintech.fintrust.authentication.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fintech.fintrust.authentication.model.User;
import com.fintech.fintrust.authentication.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public OAuth2SuccessHandler(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = (String) oAuth2User.getAttributes().get("email");
        User user = userRepository.findByUsername(email).orElseGet(() -> {
            User newUser = User.builder()
                    .username(email)
                    .userId("XX-" + email.hashCode()) // Example userId generation
                    .password("")
                    .roles(Collections.singletonList("ROLE_USER"))
                    .build();
            return userRepository.save(newUser);
        });
        String accessToken = jwtService.generateAccessToken(user.getUsername(), user.getRoles());
        String refreshToken = jwtService.generateRefreshToken(user.getUsername());
        user.setRefreshToken(refreshToken);
        userRepository.save(user);
        Map<String, Object> tokens = new HashMap<>();
        tokens.put("accessToken", accessToken);
        tokens.put("refreshToken", refreshToken);
        tokens.put("username", user.getUsername());
        tokens.put("roles", user.getRoles());
        response.setContentType("application/json");
        response.getWriter().write(objectMapper.writeValueAsString(tokens));
    }
}

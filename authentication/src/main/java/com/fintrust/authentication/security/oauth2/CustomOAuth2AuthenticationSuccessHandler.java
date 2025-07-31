package com.fintrust.authentication.security.oauth2;

import com.fintrust.authentication.model.AuthProvider;
import com.fintrust.authentication.model.Role;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import java.io.IOException;
import java.time.Instant;
import java.util.Map;

import com.fintrust.authentication.model.User;
import com.fintrust.authentication.repository.UserRepository;
import com.fintrust.authentication.service.JwtService;
import org.springframework.security.oauth2.core.user.OAuth2User;

@Component
public class CustomOAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public CustomOAuth2AuthenticationSuccessHandler(JwtService jwtService,UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        setRedirectStrategy((request, response, url) -> {});
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        Map<String, Object> attributes = oAuth2User.getAttributes();
        String email = (String) attributes.get("email");
        if (email == null) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Email not found in OAuth2 response");
            return;
        }
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> createNewUser(attributes, email));

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        user.setRefreshToken(refreshToken);
        userRepository.save(user);
        response.getWriter().write(
                String.format(
                        "{\"access_token\":\"%s\", \"refresh_token\":\"%s\"}",
                        accessToken, refreshToken
                )
        );
        response.setStatus(HttpServletResponse.SC_OK);
    }

    private User createNewUser(Map<String, Object> attributes, String email) {
        return userRepository.save(
                User.builder()
                        .email(email)
                        .name((String) attributes.get("name"))
                        .role(Role.USER)
                        .authProvider(AuthProvider.GOOGLE)
                        .createdAt(Instant.now())
                        .build()
        );
    }
}

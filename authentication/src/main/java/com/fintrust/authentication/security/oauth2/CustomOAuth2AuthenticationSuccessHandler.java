package com.fintrust.authentication.security.oauth2;

import com.fintrust.authentication.util.CookieService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


import com.fintrust.authentication.model.User;
import com.fintrust.authentication.repository.UserRepository;
import com.fintrust.authentication.service.JwtService;
import com.fintrust.authentication.service.UserService;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;

@Component
public class CustomOAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private static final Logger logger = LoggerFactory.getLogger(CustomOAuth2AuthenticationSuccessHandler.class);
    private final JwtService jwtService;
    private final UserService userService;
    private final UserRepository userRepository;
    private final CookieService cookieService;

    public CustomOAuth2AuthenticationSuccessHandler(JwtService jwtService, UserService userService, UserRepository userRepository, CookieService cookieService) {
        this.jwtService = jwtService;
        this.userService = userService;
        this.userRepository = userRepository;
        this.cookieService = cookieService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        // Debug log all attributes to help diagnose missing email
        logger.info("OAuth2User attributes: {}", oAuth2User.getAttributes());
        String email = oAuth2User.getAttribute("email");
        if (email == null || email.isEmpty()) {
            // Try to use 'sub' as a fallback identifier (Google unique user id)
            String sub = oAuth2User.getAttribute("sub");
            logger.warn("[OAuth2] Email missing, using sub as fallback: {}", sub);
            // Optionally, you could block login if email is required:
            response.sendRedirect("/login?error=NoEmailFromGoogle");
            return;
        }
        User user = userService.findByEmail(email).orElse(null);
        if (user == null) {
            user = User.builder()
                    .name(oAuth2User.getAttribute("name"))
                    .email(email)
                    .role(com.fintrust.authentication.model.Role.USER)
                    .authProvider(com.fintrust.authentication.model.AuthProvider.GOOGLE)
                    .createdAt(java.time.Instant.now())
                    .build();
            user = userRepository.save(user);
        }
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        user.setRefreshToken(refreshToken);
        userRepository.save(user);
        // For local dev, set cookies as secure=false
        cookieService.addAccessTokenCookie(response, accessToken, false);
        cookieService.addRefreshTokenCookie(response, refreshToken, false);
        // Redirect to frontend home/dashboard after login
        this.getRedirectStrategy().sendRedirect(request, response, "http://localhost:3000/home");
    }
}

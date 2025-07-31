package com.fintrust.authentication.security.filter;

import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import com.fintrust.authentication.service.JwtService;
import com.fintrust.authentication.service.UserService;
import com.fintrust.authentication.model.User;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.Collection;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UserService userService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        try {
            String token = extractTokenFromHeader(request);
            if (token == null) {
                filterChain.doFilter(request, response);
                return;
            }

            if (jwtService.validateToken(token)) {
                handleValidToken(request, token);
            } else {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid token");
                return;
            }
        } catch (ExpiredJwtException ex) {
            handleExpiredToken(request, response, ex);
            return;
        } catch (Exception ex) {
            log.error("JWT processing error", ex);
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Authentication failed");
            return;
        }
        filterChain.doFilter(request, response);
    }

    private String extractTokenFromHeader(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    private void handleValidToken(HttpServletRequest request, String token) {
        Claims claims = jwtService.extractClaims(token);
        String userId = claims.getSubject();
        User user = userService.findByEmail(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Collection<? extends GrantedAuthority> authorities = jwtService.extractAuthorities(token);

        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                user,
                null,
                authorities
        );
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    private void handleExpiredToken(
            HttpServletRequest request,
            HttpServletResponse response,
            ExpiredJwtException ex
    ) throws IOException {
        String userId = ex.getClaims().getSubject();
        User user = userService.findByEmail(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRefreshToken() != null && jwtService.validateToken(user.getRefreshToken())) {
            String newAccessToken = jwtService.generateAccessToken(user);
            String newRefreshToken = jwtService.generateRefreshToken(user);
            userService.updateRefreshToken(userId, newRefreshToken);
            Collection<? extends GrantedAuthority> authorities = jwtService.extractAuthorities(newAccessToken);

            response.setHeader("Authorization", "Bearer " + newAccessToken);

            SecurityContextHolder.getContext().setAuthentication(
                    new UsernamePasswordAuthenticationToken(
                            user,
                            null,
                            authorities
                    )
            );
        } else {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Session expired");
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/api/auth/");
    }
}

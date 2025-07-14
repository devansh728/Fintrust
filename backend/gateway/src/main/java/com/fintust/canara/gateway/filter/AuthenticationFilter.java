package com.fintust.canara.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;
import javax.crypto.SecretKey;

// Import for logging (assuming SLF4J and Logback/Log4j2 are in classpath)
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    private static final Logger logger = LoggerFactory.getLogger(AuthenticationFilter.class);

    @Value("${jwt.access.secret}")
    private String jwtSecret;

    public AuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String path = request.getURI().getPath();
            logger.info("API Gateway Request Path: {}", path); // Log the incoming path

            // Fix the double slash in path.startsWith for auth endpoints
            if (path.startsWith("/api/auth/login") || path.startsWith("/api/auth/signup") || path.startsWith("/api/auth/oauth2")) {
                logger.info("Bypassing AuthenticationFilter for public path: {}", path);
                return chain.filter(exchange);
            }

            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            logger.info("Authorization Header: {}", authHeader != null ? "Present" : "Missing");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                logger.warn("Unauthorized: Missing or invalid Authorization header for path: {}", path);
                return unauthorized(exchange, "Missing or invalid Authorization header");
            }

            String token = authHeader.substring(7);
            logger.info("Extracted JWT Token (first 20 chars): {}", token.substring(0, Math.min(token.length(), 20)) + "...");

            try {
                // Log the secret being used (be cautious in production, avoid logging full secret)
                logger.debug("JWT Secret used for verification: {}", jwtSecret);
                SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
                Jws<Claims> claimsJws = Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
                Claims claims = claimsJws.getPayload();

                String userId = claims.getSubject();
                List<String> rolesList = claims.get("roles", List.class);

                logger.info("JWT Validated. User ID: {}, Roles: {}", userId, rolesList);

                if (rolesList == null) {
                    rolesList = List.of();
                    logger.warn("Roles claim missing or not a List in JWT for user: {}", userId);
                }

                List<SimpleGrantedAuthority> authorities = rolesList.stream()
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userId, null, authorities);

                SecurityContext securityContext = new SecurityContextImpl(authentication);

                String rolesHeader = String.join(",", rolesList);
                ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                        .header("X-User-Id", userId)
                        .header("X-User-Roles", rolesHeader)
                        .build();

                logger.info("SecurityContext populated for user: {}", userId);
                return chain.filter(exchange.mutate().request(mutatedRequest).build())
                        .contextWrite(ReactiveSecurityContextHolder.withSecurityContext(Mono.just(securityContext)));

            } catch (ExpiredJwtException e) {
                logger.error("Unauthorized: The access token expired for path {}. Error: {}", path, e.getMessage());
                return unauthorized(exchange, "The access token expired");
            } catch (JwtException e) {
                logger.error("Unauthorized: Invalid access token for path {}. Error: {}", path, e.getMessage());
                return unauthorized(exchange, "Invalid access token: " + e.getMessage());
            } catch (Exception e) {
                logger.error("Unauthorized: Unexpected error processing token for path {}. Error: {}", path, e.getMessage(), e);
                return unauthorized(exchange, "Error processing token: " + e.getMessage());
            }
        };
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange, String errorDescription) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        exchange.getResponse().getHeaders().add(HttpHeaders.WWW_AUTHENTICATE,
                "Bearer error=\"invalid_token\", error_description=\"" + errorDescription + "\"");
        return exchange.getResponse().setComplete();
    }

    public static class Config {
        // Add config fields if needed in the future
    }
}
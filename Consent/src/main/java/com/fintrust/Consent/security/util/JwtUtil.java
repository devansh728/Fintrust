package com.fintrust.Consent.security.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class JwtUtil {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);
    @Value("${jwt.secret}")
    private String jwtSecret;

    public boolean validateToken(String token) {
        extractClaims(token); // Let exceptions propagate
        logger.info("JwtUtil: Token validated successfully");
        return true;
    }


    public Claims extractClaims(String token) {
        logger.info("JwtUtil: Extracting claims from token");
        return Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(jwtSecret.getBytes()))
                .setAllowedClockSkewSeconds(60)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }


    public String extractUserId(String token) {
        return extractClaims(token).getSubject();
    }
}

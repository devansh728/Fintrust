package com.thirdparty.user.request.service;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.List;
import java.util.function.Function;

@Component
public class JwtService {
    private final Key accessTokenKey;
    private final Key refreshTokenKey;
    private final long accessTokenExpirationMs;
    private final long refreshTokenExpirationMs;

    public JwtService(
            @Value("${jwt.access.secret}") String accessSecret,
            @Value("${jwt.refresh.secret}") String refreshSecret,
            @Value("${jwt.access.expiration}") long accessTokenExpirationMs,
            @Value("${jwt.refresh.expiration}") long refreshTokenExpirationMs
    ) {
        this.accessTokenKey = Keys.hmacShaKeyFor(accessSecret.getBytes());
        this.refreshTokenKey = Keys.hmacShaKeyFor(refreshSecret.getBytes());
        this.accessTokenExpirationMs = accessTokenExpirationMs;
        this.refreshTokenExpirationMs = refreshTokenExpirationMs;
    }

    public String generateAccessToken(String username, List<String> roles) {
        return Jwts.builder()
                .setSubject(username)
                .claim("roles", roles)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + accessTokenExpirationMs))
                .signWith(accessTokenKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshTokenExpirationMs))
                .signWith(refreshTokenKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateAccessToken(String token) {
        return validateToken(token, accessTokenKey);
    }

    public boolean validateRefreshToken(String token) {
        return validateToken(token, refreshTokenKey);
    }

    private boolean validateToken(String token, Key key) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String extractUsernameFromAccessToken(String token) {
        return extractClaim(token, accessTokenKey, Claims::getSubject);
    }

    public String extractUsernameFromRefreshToken(String token) {
        return extractClaim(token, refreshTokenKey, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Key key, Function<Claims, T> claimsResolver) {
        final Claims claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
        return claimsResolver.apply(claims);
    }
}

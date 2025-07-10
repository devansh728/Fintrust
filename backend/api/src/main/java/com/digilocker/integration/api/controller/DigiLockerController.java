package com.digilocker.integration.api.controller;

import com.digilocker.integration.api.service.TokenService;
import com.digilocker.integration.api.service.DocumentService;
import com.digilocker.integration.api.util.JwtUtil;
import com.digilocker.integration.api.util.RateLimiter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import javax.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
@RequestMapping("/api/digilocker")
public class DigiLockerController {
    private final TokenService tokenService;
    private final DocumentService documentService;
    private final RateLimiter rateLimiter;
    private final String jwtSecret;

    public DigiLockerController(TokenService tokenService, DocumentService documentService, RateLimiter rateLimiter, @Value("${auth.jwt.secret}") String jwtSecret) {
        this.tokenService = tokenService;
        this.documentService = documentService;
        this.rateLimiter = rateLimiter;
        this.jwtSecret = jwtSecret;
    }

    public String getAccessToken(){
        JwtAuthenticationToken auth = (JwtAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        return auth.getToken().getTokenValue();
    }

    private String getUserIdFromJwt() {
        String jwt = getAccessToken();
        if(jwt == null){
            throw new IllegalArgumentException("no jwt token found");
        }
        return JwtUtil.validateAndGetClaims(jwt, jwtSecret).getSubject();
    }

    @GetMapping("/documents")
    public ResponseEntity<?> listDocuments() throws Exception {
        String userId = getUserIdFromJwt();
        if (!rateLimiter.allow(userId)) return ResponseEntity.status(429).body("Rate limit exceeded");
        // TODO: Check DigiLocker connection, token validity
        return ResponseEntity.ok(Map.of("documents", documentService.getIssuedDocuments(userId)));
    }

    @GetMapping("/document/{uri}")
    public ResponseEntity<?> downloadDocument(@PathVariable String uri) throws Exception {
        String userId = getUserIdFromJwt();
        if (!rateLimiter.allow(userId)) return ResponseEntity.status(429).body("Rate limit exceeded");
        // TODO: Validate HMAC, check tokens, return file
        byte[] file = documentService.downloadDocument(userId, uri).getContent();
        if (file.length == 0) return ResponseEntity.status(404).body("Document not found");
        return ResponseEntity.ok().body(file);
    }
}

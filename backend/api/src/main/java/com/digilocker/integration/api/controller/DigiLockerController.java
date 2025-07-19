package com.digilocker.integration.api.controller;

import com.digilocker.integration.api.service.DocumentService;
import com.digilocker.integration.api.util.JwtUtil;
import com.digilocker.integration.api.util.RateLimiter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import javax.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
@RequestMapping("/api/digilocker")
public class DigiLockerController {
    private final DocumentService documentService;
    private final RateLimiter rateLimiter;
    private final String jwtSecret;

    public DigiLockerController(DocumentService documentService, RateLimiter rateLimiter, @Value("${auth.jwt.secret}") String jwtSecret) {
        this.documentService = documentService;
        this.rateLimiter = rateLimiter;
        this.jwtSecret = jwtSecret;
    }

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getName();
        }
        throw new IllegalStateException("No authenticated user found");
    }

    @GetMapping("/documents")
    public ResponseEntity<?> listDocuments() throws Exception {
        String username = getCurrentUsername();
        if (!rateLimiter.allow(username)) return ResponseEntity.status(429).body("Rate limit exceeded");
        
        try {
            return ResponseEntity.ok(Map.of("documents", documentService.getIssuedDocuments(username)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "DigiLocker connection required", "message", e.getMessage()));
        }
    }

    @GetMapping("/document/{uri}")
    public ResponseEntity<?> downloadDocument(@PathVariable String uri) throws Exception {
        String username = getCurrentUsername();
        if (!rateLimiter.allow(username)) return ResponseEntity.status(429).body("Rate limit exceeded");
        
        try {
            byte[] file = documentService.downloadDocument(username, uri).getContent();
            if (file.length == 0) return ResponseEntity.status(404).body("Document not found");
            return ResponseEntity.ok().body(file);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "DigiLocker connection required", "message", e.getMessage()));
        }
    }
}

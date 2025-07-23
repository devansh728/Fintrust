package com.fintrust.Consent.controller;

import com.fintrust.Consent.dto.ConsentDecisionDTO;
import com.fintrust.Consent.service.ConsentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/consent/")
@RequiredArgsConstructor
public class ConsentController {
    private final ConsentService consentService;

    @PostMapping("/respond/{reqId}")
    public ResponseEntity<?> respondConsent(@RequestBody ConsentDecisionDTO dto, @PathVariable String reqId) {
        // Set the userId from the security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = (authentication != null) ? (String) authentication.getPrincipal() : null;
        dto.setUserId(email);
        dto.setThirdPartyRequestId(reqId);
        return ResponseEntity.ok(consentService.respondConsent(dto, reqId));
    }

    @GetMapping("/user/")
    public ResponseEntity<?> getUserConsents() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = (authentication != null) ? (String) authentication.getPrincipal() : null;
        return ResponseEntity.ok(consentService.getUserConsents(userId));
    }
}

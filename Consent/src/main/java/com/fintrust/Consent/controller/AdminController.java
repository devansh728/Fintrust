package com.fintrust.Consent.controller;

import com.fintrust.Consent.dto.TppApprovalRequest;
import com.fintrust.Consent.service.impl.KycApprovalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ROLE_BANK_ADMIN')")
public class AdminController {
    private final KycApprovalService kycService;

    public AdminController(KycApprovalService kycService) {
        this.kycService = kycService;
    }

    @PostMapping("/approve-tpp")
    public ResponseEntity<?> approveTpp(@RequestBody @Valid TppApprovalRequest request) {
        try {
            return ResponseEntity.ok(kycService.approveTpp(request));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to approve TPP");
        }
    }

    @GetMapping("/pending-tpps")
    public ResponseEntity<?> getPendingTpps() {
        try {
            return ResponseEntity.ok(kycService.getPendingTpps());
        } catch (Exception ex) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch pending TPPs");
        }
    }
}

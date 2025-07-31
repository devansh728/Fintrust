package com.fintrust.Consent.controller;

import com.fintrust.Consent.dto.TppRegistrationRequest;
import com.fintrust.Consent.service.impl.TppRegistrationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tpp")
public class TppController {
    private final TppRegistrationService tppService;

    public TppController(TppRegistrationService tppService) {
        this.tppService = tppService;
    }

    @PostMapping("/register")
    @PreAuthorize("hasRole('ROLE_TPP')")
    public ResponseEntity<?> registerTpp(@RequestBody @Valid TppRegistrationRequest request) {
        try {
            return ResponseEntity.ok(tppService.registerTpp(request));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred");
        }
    }

    @GetMapping("/{tppId}/status")
    public ResponseEntity<?> getTppStatus(@PathVariable String tppId) {
        try {
            return ResponseEntity.ok(tppService.getTppStatus(tppId));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(ex.getMessage());
        }
    }
}

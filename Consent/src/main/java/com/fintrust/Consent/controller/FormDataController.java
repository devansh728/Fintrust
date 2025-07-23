package com.fintrust.Consent.controller;

import com.fintrust.Consent.dto.FormDataSubmissionDTO;
import com.fintrust.Consent.service.FormDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/form")
@RequiredArgsConstructor
public class FormDataController {
    private final FormDataService formDataService;

    @PostMapping("/submit/{formId}")
    public ResponseEntity<?> submitForm(@RequestBody FormDataSubmissionDTO dto, @PathVariable String formId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = (authentication != null) ? (String) authentication.getPrincipal() : null;
        dto.setUserId(email);
        dto.setFormId(formId);
        dto.setThirdPartyRequestId(formId); // Assuming formId is used as the request ID
        return ResponseEntity.ok(formDataService.submitForm(dto));
    }
}

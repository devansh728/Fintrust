package com.thirdparty.user.request.controller;

import com.thirdparty.user.request.dto.*;
import com.thirdparty.user.request.domain.Request;
import com.thirdparty.user.request.service.RequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class RequestController {
    private final RequestService requestService;

    @PostMapping
    @PreAuthorize("hasRole('ROLE_INITIATOR')")
    public ResponseEntity<Request> initiateRequest(@RequestBody RequestInitiateDto dto, @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(requestService.initiateRequest(dto, userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Request> getRequest(@PathVariable String id) {
        return requestService.getRequestById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/consent")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<Request> handleConsent(@PathVariable String id, @RequestBody ConsentActionDto dto, @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(requestService.handleConsentFull(id, dto, userId));
    }

    @PostMapping("/{id}/fields/consent")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<Request> handleConsentByField(@PathVariable String id, @RequestBody List<ConsentActionFieldDto> dto, @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(requestService.handleConsentField(id, dto, userId));
    }

    @PostMapping("/{id}/documents")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<Request> attachDocument(@PathVariable String id, @RequestBody AttachDocumentDto dto, @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(requestService.attachDocument(id, dto, userId));
    }

    @PostMapping("/{id}/submitForm")
    @PreAuthorize("hasRole('ROLE_INITIATOR')")
    public ResponseEntity<Boolean> submitForm(@PathVariable String id, @RequestBody SubmitForm dto, @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(requestService.submitForm(id, dto, userId));
    }

    @PostMapping("/{id}/submitToBlockChain")
    @PreAuthorize("hasRole('ROLE_INITIATOR')")
    public ResponseEntity<Request> submitToBlockchain(@PathVariable String id, @RequestBody BlockchainSubmitDto dto, @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(requestService.submitToBlockchain(id, dto, userId));
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<RequestStatusDto> getStatus(@PathVariable String id) {
        String status = requestService.getRequestStatus(id);
        RequestStatusDto dto = new RequestStatusDto();
        dto.setRequestId(id);
        dto.setStatus(status);
        // Optionally set blockchainTxId
        return ResponseEntity.ok(dto);
    }
}

package com.thirdparty.user.request.service;

import com.thirdparty.user.request.domain.*;
import com.thirdparty.user.request.dto.*;
import com.thirdparty.user.request.repository.RequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RequestServiceImpl implements RequestService {
    private final RequestRepository requestRepository;

    @Override
    public Request initiateRequest(RequestInitiateDto dto, String userId) {

        if(dto.getTitle() == null || dto.getTitle().isEmpty()) {
            throw new IllegalArgumentException("Request title cannot be empty");
        }
        if(dto.getDescription() == null || dto.getDescription().isEmpty()) {
            throw new IllegalArgumentException("Request description cannot be empty");
        }
        if(dto.getRole() == null || dto.getRole().isEmpty()) {
            throw new IllegalArgumentException("Request role cannot be empty");
        }
        if(dto.getRole().equals("ADMIN") && (dto.getDynamicFields() == null || dto.getDynamicFields().isEmpty())) {
            throw new IllegalArgumentException("Dynamic fields cannot be empty for ADMIN role");
        }
        if(dto.getRole().equals("USER")){
            throw new IllegalArgumentException("User role cannot initiate requests");
        }

        Request request = Request.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .dynamicFields(dto.getDynamicFields())
                .requestedBy(userId)
                .role(dto.getRole())
                .status("INITIATED")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        return requestRepository.save(request);
    }

    @Override
    public Optional<Request> getRequestById(String id) {
        return requestRepository.findById(id);
    }

    @Override
    @Transactional
    public Request handleConsent(String requestId, ConsentActionDto dto, String userId) {

        if(dto.getAction() == null || dto.getAction().isEmpty()) {
            throw new IllegalArgumentException("Consent action cannot be empty");
        }
        if(!dto.getAction().matches("approve|reject|delete")) {
            throw new IllegalArgumentException("Invalid consent action: " + dto.getAction());
        }
        Request request = requestRepository.findById(requestId).orElseThrow();
        Consent consent = Consent.builder()
                .userId(userId)
                .action(dto.getAction())
                .reason(dto.getReason())
                .timestamp(Instant.now())
                .build();
        request.getConsents().add(consent);
        request.setUpdatedAt(Instant.now());
        return requestRepository.save(request);
    }

    @Override
    @Transactional
    public Request attachDocument(String requestId, AttachDocumentDto dto, String userId) {
        Request request = requestRepository.findById(requestId).orElseThrow();
        DocumentMeta doc = DocumentMeta.builder()
                .documentId(dto.getDocumentId())
                .fileName(dto.getFileName())
                .digilockerToken(dto.getDigilockerToken())
                .uploadedBy(userId)
                .status("ATTACHED")
                .build();
        request.getDocuments().add(doc);
        request.setUpdatedAt(Instant.now());
        return requestRepository.save(request);
    }

    @Override
    @Transactional
    public Request submitToBlockchain(String requestId, BlockchainSubmitDto dto, String userId) {
        Request request = requestRepository.findById(requestId).orElseThrow();
        // Blockchain integration logic here (call Feign/Web3j client)
        request.setBlockchainTxId("dummy-txid");
        request.setStatus("SUBMITTED");
        request.setUpdatedAt(Instant.now());
        return requestRepository.save(request);
    }

    @Override
    public String getRequestStatus(String requestId) {
        return requestRepository.findById(requestId)
                .map(Request::getStatus)
                .orElse("NOT_FOUND");
    }
}

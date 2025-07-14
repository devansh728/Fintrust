package com.thirdparty.user.request.service;

import com.thirdparty.user.request.domain.*;
import com.thirdparty.user.request.dto.*;
import com.thirdparty.user.request.repository.RequestRepository;
import com.thirdparty.user.request.repository.SubmitFormRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RequestServiceImpl implements RequestService {
    private final RequestRepository requestRepository;
    private final SubmitFormRepository submitFormRepository;

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
    public Request handleConsentFull(String requestId, ConsentActionDto dto, String userId) {

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
                .timestamp(Instant.now()) //Add per consent field
                .build();
        request.getFullConsent().add(consent);
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

    @Override
    public Request handleConsentField(String requestId, List<ConsentActionFieldDto> dto, String userId) {

        dto.forEach((singleConsent)-> {
            if(singleConsent.getAction() == null || singleConsent.getAction().isEmpty()) {
                throw new IllegalArgumentException("Consent action cannot be empty");
            }
            if(!singleConsent.getAction().matches("approve|reject|delete")) {
                throw new IllegalArgumentException("Invalid consent action: " + singleConsent.getAction());
            }
        });

        Request request = requestRepository.findById(requestId).orElseThrow();
        dto.forEach((singleConsent)->{
            Consent consent = Consent.builder()
                    .userId(userId)
                    .action(singleConsent.getAction())
                    .reason(singleConsent.getReason())
                    .timestamp(Instant.now()) //Add per consent field
                    .build();
            request.getConsents().put(singleConsent.getField(),consent);
        });

        request.setUpdatedAt(Instant.now());
        return requestRepository.save(request);
    }

    @Override
    @Transactional
    public Boolean submitForm(String id, SubmitForm dto, String userId) {
        Request request = requestRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Request not found"));
        request.getFullConsent().forEach((each) -> {
            if (!Objects.equals(each.getAction(), "APPROVE") && !Objects.equals(each.getAction(), "DELETE") && !Objects.equals(each.getAction(), "REJECT")) {
                throw new IllegalArgumentException("Form can't be submit, Consent action cannot be empty");
            }
        });
        SubmitFrom submit = SubmitFrom.builder()
                .requestId(id)
                .fieldEntries(dto.getFieldEntries())
                .documentEntries(dto.getDocumentEntries())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        submitFormRepository.save(submit);
        request.setStatus("SUBMITTED");
        requestRepository.save(request);
        return Boolean.TRUE;
    }
}

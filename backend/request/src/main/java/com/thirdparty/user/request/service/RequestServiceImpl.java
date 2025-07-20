package com.thirdparty.user.request.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.thirdparty.user.request.FlaskApiClient;
import com.thirdparty.user.request.domain.*;
import com.thirdparty.user.request.dto.*;
import com.thirdparty.user.request.repository.RequestRepository;
import com.thirdparty.user.request.repository.SubmitFormRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RequestServiceImpl implements RequestService {
    private final RequestRepository requestRepository;
    private final SubmitFormRepository submitFormRepository;
    private final AsyncBlockchainService asyncBlockchainService;

    @Override
    public Request initiateRequest(RequestInitiateDto dto, String userId, List<String> roles) {

        if (dto.getTitle() == null || dto.getTitle().isEmpty()) {
            throw new IllegalArgumentException("Request title cannot be empty");
        }
        if (dto.getDescription() == null || dto.getDescription().isEmpty()) {
            throw new IllegalArgumentException("Request description cannot be empty");
        }

        if (roles == null || roles.isEmpty()) {
            throw new IllegalArgumentException("User must have at least one role");
        }

        boolean isInitiator = roles.stream()
                .anyMatch(role -> role.equals("ROLE_USER") || role.equals("USER"));

        if (!isInitiator) {
            throw new IllegalArgumentException("Only users with INITIATOR role can initiate requests");
        }

        if (dto.getDynamicFields() == null || dto.getDynamicFields().isEmpty()) {
            throw new IllegalArgumentException("Dynamic fields cannot be empty for INITIATOR role");
        }

        Request request = Request.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .dynamicFields(dto.getDynamicFields())
                .requestedBy(userId)
                .role(roles)
                .name(dto.getName())
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
        if(!dto.getAction().toLowerCase().matches("approve|reject|delete")) {
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
    public Request submitToBlockchain(String requestId, String userId) {
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
            if(!singleConsent.getAction().toLowerCase().matches("approve|reject|delete")) {
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
            request.getConsents().put(singleConsent.getField().toLowerCase(),consent);
        });

        request.setUpdatedAt(Instant.now());
        return requestRepository.save(request);
    }

    @Override
    @Transactional
    public Boolean submitForm(String id, SubmitForm dto, String userId) {
        Request request = requestRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Request not found"));
        request.getFullConsent().forEach((each) -> {
            if (!each.getAction().equalsIgnoreCase("approve")) {
                throw new IllegalArgumentException("Form can't be submit, Consent rejected");
            }
        });
        SubmitFrom submit = SubmitFrom.builder()
                .requestId(id)
                .fieldEntries(dto.getFieldEntries())
                .documentEntries(dto.getDocumentEntries())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .userId(userId)
                .build();
        submitFormRepository.save(submit);
        request.setStatus("SUBMITTED");
        requestRepository.save(request);

        UserConsentDto formConsent = UserConsentDto.builder()
                .approvedFields(request.getConsents().keySet().stream().toList())
                .consentTime(Instant.now())
                .consentType("Granular")
                .build();

        RequestInitiateDto1 dtoO = RequestInitiateDto1.builder()
                .requestedBy(request.getRequestedBy())
                .description(request.getDescription())
                .dynamicFields(request.getDynamicFields().keySet().stream().toList())
                .name(request.getName())
                .title(request.getTitle())
                .build();

        formData data = formData.builder()
                .textFields(submit.getFieldEntries())
                .fileUploads(submit.getDocumentEntries())
                .build();

        ConsentPayload payload = ConsentPayload.builder()
                .formData(data)
                .userConsent(formConsent)
                .thirdParty(dtoO)
                .useCase(request.getTitle())
                .build();

        try {
            FlaskApiClient apiClient = new FlaskApiClient(
                    new RestTemplate(),
                    new ObjectMapper(),
                    "http://localhost:5000"
            );

            String minimizedJson = apiClient.submitToFlaskApi(id, payload);

            asyncBlockchainService.submitToBlockchainAsync(id, minimizedJson)
                    .thenAccept(result -> {
                        // This will be executed when the async call completes successfully
                        log.info("Successfully submitted to blockchain");
                    })
                    .exceptionally(ex -> {
                        log.error("Failed to submit to blockchain", ex);
                        return null;
                    });

        } catch (Exception e) {
            throw new RuntimeException("Error communicating with Flask API", e);
        }




        return Boolean.TRUE;
    }
}

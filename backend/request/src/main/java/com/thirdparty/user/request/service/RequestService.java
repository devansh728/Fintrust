package com.thirdparty.user.request.service;

import com.thirdparty.user.request.domain.Request;
import com.thirdparty.user.request.dto.*;

import java.util.List;
import java.util.Optional;

public interface RequestService {
    Request initiateRequest(RequestInitiateDto dto, String userId, List<String> roles);
    Optional<Request> getRequestById(String id);
    Request handleConsentFull(String requestId, ConsentActionDto dto, String userId);
    Request attachDocument(String requestId, AttachDocumentDto dto, String userId);
    Request submitToBlockchain(String requestI, String userId);
    String getRequestStatus(String requestId);
    Request handleConsentField(String requestId, List<ConsentActionFieldDto> dto, String userId);
    Boolean submitForm(String id, SubmitForm dto, String userId);
}

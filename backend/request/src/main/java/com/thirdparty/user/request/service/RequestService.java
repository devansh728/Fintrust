package com.thirdparty.user.request.service;

import com.thirdparty.user.request.domain.Request;
import com.thirdparty.user.request.dto.*;
import java.util.Optional;

public interface RequestService {
    Request initiateRequest(RequestInitiateDto dto, String userId);
    Optional<Request> getRequestById(String id);
    Request handleConsent(String requestId, ConsentActionDto dto, String userId);
    Request attachDocument(String requestId, AttachDocumentDto dto, String userId);
    Request submitToBlockchain(String requestId, BlockchainSubmitDto dto, String userId);
    String getRequestStatus(String requestId);
}

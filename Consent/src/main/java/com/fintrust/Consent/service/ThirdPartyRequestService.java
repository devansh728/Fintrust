package com.fintrust.Consent.service;

import com.fintrust.Consent.dto.ThirdPartyRequestDTO;
import java.util.List;

public interface ThirdPartyRequestService {
    Object createRequest(ThirdPartyRequestDTO dto, String reqId);
    List<?> getAllRequests();
    List<?> getAllRequestsPending();
}

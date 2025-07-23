package com.fintrust.Consent.service;

import com.fintrust.Consent.dto.ConsentDecisionDTO;

public interface ConsentService {
    Object respondConsent(ConsentDecisionDTO dto, String reqId);
    Object getUserConsents(String userId);
}

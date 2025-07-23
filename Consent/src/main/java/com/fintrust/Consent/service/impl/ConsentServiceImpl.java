package com.fintrust.Consent.service.impl;

import com.fintrust.Consent.dto.ConsentDecisionDTO;
import com.fintrust.Consent.repository.UserConsentRepository;
import com.fintrust.Consent.service.ConsentService;
import com.fintrust.Consent.model.UserConsent;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.fintrust.Consent.security.util.AuthServiceTokenValidator;

@Service
@RequiredArgsConstructor
public class ConsentServiceImpl implements ConsentService {
    private final UserConsentRepository userConsentRepository;
    private final AuthServiceTokenValidator authServiceTokenValidator;

    @Override
    public Object respondConsent(ConsentDecisionDTO dto, String reqId) {
        UserConsent consent = UserConsent.builder()
                .userId(dto.getUserId())
                .thirdPartyRequestId(dto.getThirdPartyRequestId())
                .status(dto.getStatus())
                .decisionDate(Instant.now())
                .requestId(reqId) // Use the provided request ID
                .build();
        return userConsentRepository.save(consent);
    }

    @Override
    public Object getUserConsents(String userId) {
        List<UserConsent> consents = userConsentRepository.findAll()
                .stream().filter(c -> c.getUserId().equals(userId)).toList();
        return consents;
    }
}

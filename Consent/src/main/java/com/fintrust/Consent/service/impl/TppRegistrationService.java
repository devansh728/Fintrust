package com.fintrust.Consent.service.impl;

import com.fintrust.Consent.dto.TppRegistrationRequest;
import com.fintrust.Consent.model.TppRegistration;
import com.fintrust.Consent.repository.TppRegistrationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TppRegistrationService {
    private final TppRegistrationRepository tppRepo;

    public TppRegistration registerTpp(TppRegistrationRequest request) {
        TppRegistration tpp = new TppRegistration();
        tpp.setTppId(request.getTppId());
        tpp.setName(request.getName());
        tpp.setJurisdiction(request.getJurisdiction());
        tpp.setKycHashes(request.getKycDocs());
        tpp.setRequestedScopes(request.getRequestedScopes());
        tpp.setStatus("PENDING_KYC");
        return tppRepo.save(tpp);
    }

    public TppRegistration getTppStatus(String tppId) {
        return tppRepo.findById(tppId).orElseThrow();
    }
}
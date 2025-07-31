package com.fintrust.Consent.service.impl;

import com.fintrust.Consent.dto.BlockchainResponse;
import com.fintrust.Consent.dto.TppApprovalRequest;
import com.fintrust.Consent.model.TppRegistration;
import com.fintrust.Consent.repository.TppRegistrationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class KycApprovalService {
    private final TppRegistrationRepository tppRepo;
    private final BlockchainClient blockchainClient;

    @Transactional
    public BlockchainResponse approveTpp(TppApprovalRequest request) {
        TppRegistration tpp = tppRepo.findById(request.getTppId()).orElseThrow();

        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("name", tpp.getName());

        // Call Node.js blockchain service
        BlockchainResponse response = blockchainClient.authorizeTpp(requestBody);

        // Update DB
        tpp.setStatus("APPROVED");
        tpp.setTxHash("null");
        tpp.setExpiryDate(LocalDateTime.now().plusDays(365));
        tppRepo.save(tpp);

        return response;
    }

    public List<TppRegistration> getPendingTpps() {
        return tppRepo.findByStatus("PENDING_KYC");
    }
}

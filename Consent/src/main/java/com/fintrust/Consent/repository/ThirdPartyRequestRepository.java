package com.fintrust.Consent.repository;

import com.fintrust.Consent.model.ThirdPartyRequest;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ThirdPartyRequestRepository extends MongoRepository<ThirdPartyRequest, String> {
    ThirdPartyRequest findByRequestId(String requestId);
    boolean existsByRequestId(String requestId);
}

package com.fintrust.Consent.repository;

import com.fintrust.Consent.model.UserConsent;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserConsentRepository extends MongoRepository<UserConsent, String> {
}

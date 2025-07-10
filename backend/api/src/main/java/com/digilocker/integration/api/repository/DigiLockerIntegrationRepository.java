package com.digilocker.integration.api.repository;

import com.digilocker.integration.api.model.DigiLockerIntegration;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface DigiLockerIntegrationRepository extends MongoRepository<DigiLockerIntegration, String> {
    Optional<DigiLockerIntegration> findByUserId(String userId);
    Optional<DigiLockerIntegration> findByDigilockerId(String digilockerId);
}

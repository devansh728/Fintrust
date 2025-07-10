package com.digilocker.integration.api.repository;

import com.digilocker.integration.api.model.CodeVerifierEntity;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface CodeVerifierEntityRepository extends MongoRepository<CodeVerifierEntity,String> {
    Optional<CodeVerifierEntity> findByUserId(String userId);
    Optional<CodeVerifierEntity> findByState(String state);
}

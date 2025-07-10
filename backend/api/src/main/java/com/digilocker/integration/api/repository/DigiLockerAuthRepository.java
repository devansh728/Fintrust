package com.digilocker.integration.api.repository;

import com.digilocker.integration.api.model.CodeVerifierEntity;
import com.digilocker.integration.api.model.DigiLockerAuth;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface DigiLockerAuthRepository extends MongoRepository<DigiLockerAuth, String> {

    Optional<DigiLockerAuth> findByUserId(String userId);

    @Query("{ 'expiresAt' : { $lt: ?0 } }")
    List<DigiLockerAuth> findByExpiresAtBefore(Instant threshold);

    // For MongoDB, we'll need a separate collection for code verifiers
    @Query(value = "{ 'state' : ?0 }", fields = "{ 'codeVerifier' : 1 }")
    CodeVerifierEntity findCodeVerifierByState(String state);

    default void saveCodeVerifier(String state, String codeVerifier) {
        CodeVerifierEntity entity = new CodeVerifierEntity();
        entity.setState(state);
        entity.setCodeVerifier(codeVerifier);
        save(entity);
    }

    default String getCodeVerifier(String state) {
        CodeVerifierEntity entity = findCodeVerifierByState(state);
        return entity != null ? entity.getCodeVerifier() : null;
    }
}

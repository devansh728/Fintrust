package com.digilocker.integration.api.repository;

import com.digilocker.integration.api.model.DigiLockerTokenInfo;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface DigiLockerTokenInfoRepository extends MongoRepository<DigiLockerTokenInfo, String> {

    Optional<DigiLockerTokenInfo> findByUsername(String username);
    
    Optional<DigiLockerTokenInfo> findByUserId(String userId);
    
    @Query("{ 'username' : ?0, 'active' : true }")
    Optional<DigiLockerTokenInfo> findActiveByUsername(String username);
    
    @Query("{ 'expiresAt' : { $lt: ?0 }, 'active' : true }")
    List<DigiLockerTokenInfo> findExpiredTokens(Instant threshold);
    
    @Query("{ 'active' : true }")
    List<DigiLockerTokenInfo> findAllActiveTokens();
    
    @Query("{ 'state' : ?0 }")
    Optional<DigiLockerTokenInfo> findByState(String state);
    
    boolean existsByUsername(String username);
    
    void deleteByUsername(String username);
} 
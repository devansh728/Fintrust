package com.thirdparty.user.request.repository;

import com.thirdparty.user.request.domain.UserBehavior;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UserBehaviorRepository extends MongoRepository<UserBehavior, String> {
    
    List<UserBehavior> findByUserIdOrderByTimestampDesc(String userId);
    
    List<UserBehavior> findByUserIdAndTimestampBetweenOrderByTimestampDesc(
            String userId, LocalDateTime startTime, LocalDateTime endTime);
    
    @Query("{'userId': ?0, 'anomalyScore': {$gt: ?1}}")
    List<UserBehavior> findByUserIdAndAnomalyScoreGreaterThan(String userId, Double threshold);
    
    @Query("{'userId': ?0, 'riskLevel': ?1}")
    List<UserBehavior> findByUserIdAndRiskLevel(String userId, String riskLevel);
    
    @Query("{'timestamp': {$gte: ?0}, 'isAnomaly': true}")
    List<UserBehavior> findAnomaliesSince(LocalDateTime since);
    
    @Query("{'userId': ?0, 'deviceId': ?1}")
    List<UserBehavior> findByUserIdAndDeviceId(String userId, String deviceId);
    
    @Query("{'userId': ?0, 'ipAddress': ?1}")
    List<UserBehavior> findByUserIdAndIpAddress(String userId, String ipAddress);
    
    long countByUserIdAndTimestampBetween(String userId, LocalDateTime startTime, LocalDateTime endTime);
    
    @Query("{'userId': ?0, 'anomalyScore': {$gt: 0.7}}")
    long countHighRiskBehaviorsByUserId(String userId);
} 
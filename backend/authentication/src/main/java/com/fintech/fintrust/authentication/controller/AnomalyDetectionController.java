package com.fintech.fintrust.authentication.controller;

import com.fintech.fintrust.authentication.model.*;
import com.fintech.fintrust.authentication.service.AnomalyDetectionService;
import com.fintech.fintrust.authentication.service.SmartContractService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/anomaly")
@RequiredArgsConstructor
@Slf4j
public class AnomalyDetectionController {
    
    private final AnomalyDetectionService anomalyDetectionService;
    private final SmartContractService smartContractService;
    
    @PostMapping("/detect")
    public ResponseEntity<?> detectAnomaly(@RequestBody UserBehavior userBehavior, 
                                         Authentication authentication) {
        try {
            log.info("Anomaly detection request for user: {}", userBehavior.getUserId());
            
            // Perform anomaly detection
            AnomalyDetectionResult result = anomalyDetectionService.detectAnomaly(userBehavior);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("anomalyResult", result);
            response.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error in anomaly detection: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            errorResponse.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    @PostMapping("/smart-contract/execute")
    public ResponseEntity<?> executeSmartContract(@RequestBody Map<String, Object> request,
                                                Authentication authentication) {
        try {
            String userId = (String) request.get("userId");
            String contractFunction = (String) request.get("contractFunction");
            Map<String, Object> parameters = (Map<String, Object>) request.get("parameters");
            
            log.info("Smart contract execution request for user: {}, function: {}", 
                    userId, contractFunction);
            
            // Create a mock anomaly result for demonstration
            // In real implementation, this would come from the anomaly detection service
            AnomalyDetectionResult anomalyResult = AnomalyDetectionResult.builder()
                    .userId(userId)
                    .overallAnomalyScore(0.3) // Low anomaly score for demonstration
                    .isAnomaly(false)
                    .riskLevel("LOW")
                    .build();
            
            // Execute smart contract
            SmartContractRequest contractRequest = smartContractService.executeSmartContract(
                    anomalyResult, contractFunction, parameters);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("contractRequest", contractRequest);
            response.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error in smart contract execution: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            errorResponse.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    @PostMapping("/smart-contract/validate")
    public ResponseEntity<?> validateSmartContractExecution(@RequestBody AnomalyDetectionResult anomalyResult) {
        try {
            log.info("Validating smart contract execution for user: {}", anomalyResult.getUserId());
            
            boolean isValid = smartContractService.validateSmartContractExecution(anomalyResult);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("isValid", isValid);
            response.put("anomalyScore", anomalyResult.getOverallAnomalyScore());
            response.put("riskLevel", anomalyResult.getRiskLevel());
            response.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error in smart contract validation: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            errorResponse.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    @GetMapping("/status/{transactionHash}")
    public ResponseEntity<?> getContractStatus(@PathVariable String transactionHash) {
        try {
            log.info("Getting contract status for transaction: {}", transactionHash);
            
            SmartContractRequest contractRequest = smartContractService.getContractStatus(transactionHash);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("contractRequest", contractRequest);
            response.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error getting contract status: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            errorResponse.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        Map<String, Object> healthResponse = new HashMap<>();
        healthResponse.put("status", "HEALTHY");
        healthResponse.put("service", "Anomaly Detection Service");
        healthResponse.put("timestamp", LocalDateTime.now());
        healthResponse.put("version", "1.0.0");
        
        return ResponseEntity.ok(healthResponse);
    }
} 
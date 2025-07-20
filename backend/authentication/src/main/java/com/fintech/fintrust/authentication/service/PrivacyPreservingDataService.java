package com.fintech.fintrust.authentication.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PrivacyPreservingDataService {
    
    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 16;
    private static final double EPSILON = 0.1; // Differential privacy parameter
    
    public Map<String, Object> minimizeData(Map<String, Object> originalData, String useCase) {
        log.info("Minimizing data for use case: {}", useCase);
        
        Map<String, Object> minimizedData = new HashMap<>();
        List<Map<String, Object>> excludedFields = new ArrayList<>();
        
        // Define required fields for different use cases
        Set<String> requiredFields = getRequiredFieldsForUseCase(useCase);
        
        for (Map.Entry<String, Object> entry : originalData.entrySet()) {
            String field = entry.getKey();
            Object value = entry.getValue();
            
            if (requiredFields.contains(field)) {
                // Apply data minimization techniques
                Object minimizedValue = applyDataMinimization(field, value, useCase);
                minimizedData.put(field, minimizedValue);
            } else {
                // Track excluded fields
                Map<String, Object> excludedField = new HashMap<>();
                excludedField.put("field", field);
                excludedField.put("reason", "Not required for use case: " + useCase);
                excludedFields.add(excludedField);
            }
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("use_case", useCase);
        result.put("minimum_required_fields", new ArrayList<>(requiredFields));
        result.put("form_data", minimizedData);
        result.put("excluded_fields", excludedFields);
        
        return result;
    }
    
    public Map<String, Object> applyDifferentialPrivacy(Map<String, Object> data, double sensitivity) {
        log.info("Applying differential privacy with sensitivity: {}", sensitivity);
        
        Map<String, Object> privatizedData = new HashMap<>();
        
        for (Map.Entry<String, Object> entry : data.entrySet()) {
            String field = entry.getKey();
            Object value = entry.getValue();
            
            if (value instanceof Number) {
                double numericValue = ((Number) value).doubleValue();
                double noise = generateLaplaceNoise(sensitivity / EPSILON);
                double privatizedValue = numericValue + noise;
                privatizedData.put(field, privatizedValue);
            } else {
                // For non-numeric data, apply k-anonymity or other techniques
                privatizedData.put(field, applyKAnonymity(value));
            }
        }
        
        return privatizedData;
    }
    
    public String encryptData(String data, String key) throws Exception {
        log.info("Encrypting sensitive data");
        
        SecretKey secretKey = new SecretKeySpec(key.getBytes(), "AES");
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        
        byte[] iv = generateIV();
        GCMParameterSpec gcmParameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH * 8, iv);
        
        cipher.init(Cipher.ENCRYPT_MODE, secretKey, gcmParameterSpec);
        byte[] encryptedData = cipher.doFinal(data.getBytes());
        
        // Combine IV and encrypted data
        byte[] combined = new byte[iv.length + encryptedData.length];
        System.arraycopy(iv, 0, combined, 0, iv.length);
        System.arraycopy(encryptedData, 0, combined, iv.length, encryptedData.length);
        
        return Base64.getEncoder().encodeToString(combined);
    }
    
    public String decryptData(String encryptedData, String key) throws Exception {
        log.info("Decrypting sensitive data");
        
        byte[] combined = Base64.getDecoder().decode(encryptedData);
        
        // Extract IV and encrypted data
        byte[] iv = Arrays.copyOfRange(combined, 0, GCM_IV_LENGTH);
        byte[] data = Arrays.copyOfRange(combined, GCM_IV_LENGTH, combined.length);
        
        SecretKey secretKey = new SecretKeySpec(key.getBytes(), "AES");
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        
        GCMParameterSpec gcmParameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH * 8, iv);
        cipher.init(Cipher.DECRYPT_MODE, secretKey, gcmParameterSpec);
        
        byte[] decryptedData = cipher.doFinal(data);
        return new String(decryptedData);
    }
    
    public Map<String, Object> tokenizeData(Map<String, Object> data) {
        log.info("Tokenizing sensitive data");
        
        Map<String, Object> tokenizedData = new HashMap<>();
        Map<String, String> tokenMapping = new HashMap<>();
        
        for (Map.Entry<String, Object> entry : data.entrySet()) {
            String field = entry.getKey();
            Object value = entry.getValue();
            
            if (isSensitiveField(field)) {
                String token = generateToken();
                tokenizedData.put(field, token);
                tokenMapping.put(token, value.toString());
            } else {
                tokenizedData.put(field, value);
            }
        }
        
        // Store token mapping securely (in real implementation, this would be in a secure database)
        log.info("Token mapping created with {} sensitive fields", tokenMapping.size());
        
        return tokenizedData;
    }
    
    public Map<String, Object> createDataSharingPolicy(String partnerId, String purpose, 
                                                      Set<String> allowedFields, 
                                                      LocalDateTime expiryDate) {
        log.info("Creating data sharing policy for partner: {}", partnerId);
        
        Map<String, Object> policy = new HashMap<>();
        policy.put("policyId", UUID.randomUUID().toString());
        policy.put("partnerId", partnerId);
        policy.put("purpose", purpose);
        policy.put("allowedFields", new ArrayList<>(allowedFields));
        policy.put("expiryDate", expiryDate);
        policy.put("createdAt", LocalDateTime.now());
        policy.put("status", "ACTIVE");
        policy.put("privacyLevel", determinePrivacyLevel(allowedFields));
        policy.put("complianceFrameworks", Arrays.asList("GDPR", "DPDP"));
        
        return policy;
    }
    
    public boolean validateDataSharingPolicy(Map<String, Object> policy, 
                                           Map<String, Object> dataToShare) {
        log.info("Validating data sharing policy");
        
        Set<String> allowedFields = new HashSet<>((List<String>) policy.get("allowedFields"));
        LocalDateTime expiryDate = LocalDateTime.parse(policy.get("expiryDate").toString());
        
        // Check if policy is expired
        if (LocalDateTime.now().isAfter(expiryDate)) {
            log.warn("Data sharing policy has expired");
            return false;
        }
        
        // Check if all data fields are allowed
        for (String field : dataToShare.keySet()) {
            if (!allowedFields.contains(field)) {
                log.warn("Field {} is not allowed by the policy", field);
                return false;
            }
        }
        
        return true;
    }
    
    private Set<String> getRequiredFieldsForUseCase(String useCase) {
        switch (useCase.toLowerCase()) {
            case "credit card issuance":
                return Set.of("PAN Card", "Aadhar", "Phone Number", "Address");
            case "kyc verification":
                return Set.of("PAN Card", "Aadhar", "Photo");
            case "loan application":
                return Set.of("PAN Card", "Income Certificate", "Bank Statement");
            case "account opening":
                return Set.of("PAN Card", "Aadhar", "Photo", "Address Proof");
            default:
                return Set.of("PAN Card", "Aadhar"); // Default minimal fields
        }
    }
    
    private Object applyDataMinimization(String field, Object value, String useCase) {
        if (value instanceof String) {
            String stringValue = (String) value;
            
            // Apply field-specific minimization
            switch (field.toLowerCase()) {
                case "phone number":
                    return maskPhoneNumber(stringValue);
                case "aadhar":
                    return maskAadhar(stringValue);
                case "pan card":
                    return maskPAN(stringValue);
                case "address":
                    return generalizeAddress(stringValue);
                default:
                    return stringValue;
            }
        }
        
        return value;
    }
    
    private String maskPhoneNumber(String phoneNumber) {
        if (phoneNumber.length() >= 10) {
            return phoneNumber.substring(0, 3) + "****" + phoneNumber.substring(7);
        }
        return phoneNumber;
    }
    
    private String maskAadhar(String aadhar) {
        if (aadhar.length() >= 12) {
            return aadhar.substring(0, 4) + "****" + aadhar.substring(8);
        }
        return aadhar;
    }
    
    private String maskPAN(String pan) {
        if (pan.length() >= 10) {
            return pan.substring(0, 2) + "****" + pan.substring(6);
        }
        return pan;
    }
    
    private String generalizeAddress(String address) {
        // Generalize address to city level for privacy
        String[] parts = address.split(",");
        if (parts.length > 1) {
            return parts[parts.length - 1].trim(); // Return only city
        }
        return address;
    }
    
    private double generateLaplaceNoise(double scale) {
        SecureRandom random = new SecureRandom();
        double u = random.nextDouble() - 0.5;
        return -scale * Math.signum(u) * Math.log(1 - 2 * Math.abs(u));
    }
    
    private Object applyKAnonymity(Object value) {
        // Simple k-anonymity implementation
        if (value instanceof String) {
            String stringValue = (String) value;
            if (stringValue.length() > 3) {
                return stringValue.substring(0, 3) + "***";
            }
        }
        return value;
    }
    
    private byte[] generateIV() {
        byte[] iv = new byte[GCM_IV_LENGTH];
        new SecureRandom().nextBytes(iv);
        return iv;
    }
    
    private String generateToken() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }
    
    private boolean isSensitiveField(String field) {
        Set<String> sensitiveFields = Set.of(
                "pan card", "aadhar", "phone number", "address", 
                "income", "bank account", "credit card"
        );
        return sensitiveFields.contains(field.toLowerCase());
    }
    
    private String determinePrivacyLevel(Set<String> fields) {
        long sensitiveCount = fields.stream()
                .map(String::toLowerCase)
                .filter(this::isSensitiveField)
                .count();
        
        if (sensitiveCount > 3) return "CONFIDENTIAL";
        if (sensitiveCount > 1) return "PRIVATE";
        return "PUBLIC";
    }
} 
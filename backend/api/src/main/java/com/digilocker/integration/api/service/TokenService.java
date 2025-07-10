package com.digilocker.integration.api.service;

import com.digilocker.integration.api.dto.TokenResponse;
import com.digilocker.integration.api.model.DigiLockerAuth;
import com.digilocker.integration.api.model.DigiLockerIntegration;
import com.digilocker.integration.api.repository.DigiLockerAuthRepository;
import com.digilocker.integration.api.repository.DigiLockerIntegrationRepository;
import com.digilocker.integration.api.util.AesEncryptionUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TokenService {
    private final DigiLockerAuthRepository repository;
    @Value("${digilocker.token.encryption-key}")
    private final byte[] encryptionKey;
    private DigiLockerIntegrationService digiLockerIntegrationService;

    public Optional<String> getAccessToken(String userId) throws Exception {

        if(isTokenExpired(userId)){
            if(!refreshToken(userId)) {
                throw new Exception("Cant be refreshed");
            }
        }
        return repository.findByUserId(userId)
                .map(e -> {
                    try { return AesEncryptionUtil.decrypt(e.getAccessToken(), encryptionKey); } catch (Exception ex) { return null; }
                });
    }

    public Optional<String> getRefreshToken(String userId) throws Exception {
        return repository.findByUserId(userId)
                .map(e -> {
                    try { return AesEncryptionUtil.decrypt(e.getRefreshToken(), encryptionKey); } catch (Exception ex) { return null; }
                });
    }

    public boolean isTokenExpired(String userId) {
        return repository.findByUserId(userId)
                .map(e -> e.getExpiresAt().isBefore(Instant.now()))
                .orElse(true);
    }

    // Implement refresh logic here (call DigiLocker refresh endpoint, update DB)
    public boolean refreshToken(String userId) throws Exception {
        TokenResponse response = digiLockerIntegrationService.refreshToken(userId);
        return response != null;

    }
}

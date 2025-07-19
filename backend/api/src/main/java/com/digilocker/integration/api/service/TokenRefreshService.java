package com.digilocker.integration.api.service;

import com.digilocker.integration.api.model.DigiLockerTokenInfo;
import com.digilocker.integration.api.repository.DigiLockerTokenInfoRepository;
import com.digilocker.integration.api.util.AesEncryptionUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2RefreshToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TokenRefreshService {

    private final DigiLockerTokenInfoRepository tokenInfoRepository;
    private final OAuth2AuthorizedClientService authorizedClientService;
    private final ClientRegistrationRepository clientRegistrationRepository;

    @Value("${digilocker.token.encryption-key}")
    private byte[] encryptionKey;

    private static final String DIGILOCKER_REGISTRATION_ID = "digilocker";

    /**
     * Refresh token if it's expired or about to expire
     */
    @Transactional
    public void refreshTokenIfNeeded(String username) {
        Optional<DigiLockerTokenInfo> tokenInfoOpt = tokenInfoRepository.findActiveByUsername(username);
        if (tokenInfoOpt.isEmpty()) {
            throw new IllegalStateException("No active DigiLocker connection found for user: " + username);
        }

        DigiLockerTokenInfo tokenInfo = tokenInfoOpt.get();
        
        // Check if token is expired or will expire in the next 5 minutes
        if (tokenInfo.getExpiresAt() != null && 
            tokenInfo.getExpiresAt().isBefore(Instant.now().plusSeconds(300))) {
            
            log.info("Token expired or expiring soon for user: {}, refreshing...", username);
            refreshToken(tokenInfo);
        }
    }

    /**
     * Refresh a specific token
     */
    @Transactional
    public void refreshToken(DigiLockerTokenInfo tokenInfo) {
        String username = tokenInfo.getUsername();
        
        try {
            // Get the refresh token
            String refreshTokenValue = AesEncryptionUtil.decrypt(tokenInfo.getEncryptedRefreshToken(), encryptionKey);
            
            // Use Spring Security OAuth2 client to refresh the token
            OAuth2AuthorizedClient authorizedClient = authorizedClientService.loadAuthorizedClient(
                    DIGILOCKER_REGISTRATION_ID, username);

            if (authorizedClient == null) {
                throw new IllegalStateException("No authorized client found for user: " + username);
            }

            OAuth2RefreshToken refreshToken = authorizedClient.getRefreshToken();
            if (refreshToken == null) {
                throw new IllegalStateException("No refresh token available for user: " + username);
            }

            // The OAuth2 client should automatically refresh the token when needed
            // We need to reload the client to get the new tokens
            OAuth2AuthorizedClient refreshedClient = authorizedClientService.loadAuthorizedClient(
                    DIGILOCKER_REGISTRATION_ID, username);

            if (refreshedClient != null) {
                OAuth2AccessToken newAccessToken = refreshedClient.getAccessToken();
                OAuth2RefreshToken newRefreshToken = refreshedClient.getRefreshToken();

                // Update token info with new tokens
                tokenInfo.setEncryptedAccessToken(AesEncryptionUtil.encrypt(newAccessToken.getTokenValue(), encryptionKey));
                tokenInfo.setEncryptedRefreshToken(AesEncryptionUtil.encrypt(newRefreshToken.getTokenValue(), encryptionKey));
                tokenInfo.setExpiresAt(newAccessToken.getExpiresAt());
                tokenInfo.setUpdatedAt(Instant.now());
                tokenInfo.setLastError(null);

                tokenInfoRepository.save(tokenInfo);
                log.info("Successfully refreshed token for user: {}", username);
            } else {
                throw new IllegalStateException("Failed to refresh token for user: " + username);
            }

        } catch (Exception e) {
            log.error("Error refreshing token for user {}: {}", username, e.getMessage());
            tokenInfo.setLastError(e.getMessage());
            tokenInfo.setActive(false);
            tokenInfoRepository.save(tokenInfo);
            throw new RuntimeException("Failed to refresh token: " + e.getMessage());
        }
    }

    /**
     * Scheduled job to refresh expired tokens
     * Runs every 10 minutes
     */
    @Scheduled(fixedRate = 600000) // 10 minutes
    @Transactional
    public void refreshExpiredTokens() {
        log.info("Starting scheduled token refresh job");
        
        Instant threshold = Instant.now().plusSeconds(300); // 5 minutes from now
        List<DigiLockerTokenInfo> expiredTokens = tokenInfoRepository.findExpiredTokens(threshold);
        
        log.info("Found {} expired tokens to refresh", expiredTokens.size());
        
        for (DigiLockerTokenInfo tokenInfo : expiredTokens) {
            try {
                refreshToken(tokenInfo);
            } catch (Exception e) {
                log.error("Failed to refresh token for user {}: {}", tokenInfo.getUsername(), e.getMessage());
            }
        }
        
        log.info("Completed scheduled token refresh job");
    }

    /**
     * Get valid access token for user
     */
    public Optional<String> getValidAccessToken(String username) {
        try {
            refreshTokenIfNeeded(username);
            
            return tokenInfoRepository.findActiveByUsername(username)
                    .map(tokenInfo -> {
                        try {
                            return AesEncryptionUtil.decrypt(tokenInfo.getEncryptedAccessToken(), encryptionKey);
                        } catch (Exception e) {
                            log.error("Failed to decrypt access token for user {}: {}", username, e.getMessage());
                            return null;
                        }
                    });
        } catch (Exception e) {
            log.error("Error getting valid access token for user {}: {}", username, e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Check if token is valid (not expired)
     */
    public boolean isTokenValid(String username) {
        Optional<DigiLockerTokenInfo> tokenInfo = tokenInfoRepository.findActiveByUsername(username);
        if (tokenInfo.isEmpty()) {
            return false;
        }

        DigiLockerTokenInfo token = tokenInfo.get();
        return token.getExpiresAt() != null && token.getExpiresAt().isAfter(Instant.now());
    }
} 
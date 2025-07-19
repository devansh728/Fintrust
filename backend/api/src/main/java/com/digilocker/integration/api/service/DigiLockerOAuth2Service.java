package com.digilocker.integration.api.service;

import com.digilocker.integration.api.model.DigiLockerTokenInfo;
import com.digilocker.integration.api.repository.DigiLockerTokenInfoRepository;
import com.digilocker.integration.api.util.AesEncryptionUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2RefreshToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DigiLockerOAuth2Service {

    private final DigiLockerTokenInfoRepository tokenInfoRepository;
    private final OAuth2AuthorizedClientService authorizedClientService;
    private final ClientRegistrationRepository clientRegistrationRepository;
    private final TokenRefreshService tokenRefreshService;

    @Value("${digilocker.token.encryption-key}")
    private byte[] encryptionKey;

    private static final String DIGILOCKER_REGISTRATION_ID = "digilocker";
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    public String initiateAuthorization(String username) {
        log.info("Initiating DigiLocker OAuth2 authorization for user: {}", username);

        Optional<DigiLockerTokenInfo> existingToken = tokenInfoRepository.findActiveByUsername(username);
        if (existingToken.isPresent()) {
            log.info("User {} already has an active DigiLocker connection", username);
            throw new IllegalStateException("User already connected to DigiLocker");
        }

        String state = generateState();
        String codeVerifier = generateCodeVerifier();
        String codeChallenge = generateCodeChallenge(codeVerifier);

        DigiLockerTokenInfo tokenInfo = DigiLockerTokenInfo.builder()
                .username(username)
                .state(state)
                .codeVerifier(codeVerifier)
                .active(false)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        tokenInfoRepository.save(tokenInfo);

        ClientRegistration clientRegistration = clientRegistrationRepository.findByRegistrationId(DIGILOCKER_REGISTRATION_ID);
        if (clientRegistration == null) {
            throw new IllegalStateException("DigiLocker client registration not found");
        }

        String authorizationUrl = UriComponentsBuilder
                .fromHttpUrl(clientRegistration.getProviderDetails().getAuthorizationUri())
                .queryParam("response_type", "code")
                .queryParam("client_id", clientRegistration.getClientId())
                .queryParam("redirect_uri", clientRegistration.getRedirectUri())
                .queryParam("scope", clientRegistration.getScopes())
                .queryParam("state", state)
                .queryParam("code_challenge", codeChallenge)
                .queryParam("code_challenge_method", "S256")
                .build()
                .toUriString();

        log.info("Generated authorization URL for user {}: {}", username, authorizationUrl);
        return authorizationUrl;
    }

    @Transactional
    public String handleCallback(String code, String state) {
        log.info("Handling OAuth2 callback with code and state");

        DigiLockerTokenInfo tokenInfo = tokenInfoRepository.findByState(state)
                .orElseThrow(() -> new IllegalStateException("Invalid state parameter"));

        String username = tokenInfo.getUsername();
        log.info("Processing callback for user: {}", username);

        try {
            OAuth2AuthorizedClient authorizedClient = authorizedClientService.loadAuthorizedClient(
                    DIGILOCKER_REGISTRATION_ID, username);

            if (authorizedClient == null) {
                throw new IllegalStateException("No authorized client found for user: " + username);
            }

            OAuth2AccessToken accessToken = authorizedClient.getAccessToken();
            OAuth2RefreshToken refreshToken = authorizedClient.getRefreshToken();

            tokenInfo.setEncryptedAccessToken(AesEncryptionUtil.encrypt(accessToken.getTokenValue(), encryptionKey));
            tokenInfo.setEncryptedRefreshToken(AesEncryptionUtil.encrypt(refreshToken.getTokenValue(), encryptionKey));
            tokenInfo.setTokenType(accessToken.getTokenType().getValue());
            tokenInfo.setScope(String.join(" ", accessToken.getScopes()));
            tokenInfo.setExpiresAt(accessToken.getExpiresAt());
            tokenInfo.setActive(true);
            tokenInfo.setUpdatedAt(Instant.now());
            tokenInfo.setState(null);
            tokenInfo.setCodeVerifier(null);

            tokenInfoRepository.save(tokenInfo);

            log.info("Successfully processed OAuth2 callback for user: {}", username);
            return username;

        } catch (Exception e) {
            log.error("Error processing OAuth2 callback for user {}: {}", username, e.getMessage());
            tokenInfo.setLastError(e.getMessage());
            tokenInfo.setActive(false);
            tokenInfoRepository.save(tokenInfo);
            throw new RuntimeException("Failed to process OAuth2 callback: " + e.getMessage());
        }
    }

    public boolean isUserConnected(String username) {
        Optional<DigiLockerTokenInfo> tokenInfo = tokenInfoRepository.findActiveByUsername(username);
        if (tokenInfo.isEmpty()) {
            return false;
        }

        DigiLockerTokenInfo token = tokenInfo.get();
        if (token.getExpiresAt() != null && token.getExpiresAt().isBefore(Instant.now())) {
            log.info("Token expired for user: {}, attempting refresh", username);
            try {
                tokenRefreshService.refreshTokenIfNeeded(username);
                return true;
            } catch (Exception e) {
                log.error("Failed to refresh token for user {}: {}", username, e.getMessage());
                return false;
            }
        }

        return true;
    }

    public Optional<String> getAccessToken(String username) {
        try {
            tokenRefreshService.refreshTokenIfNeeded(username);
            
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
            log.error("Error getting access token for user {}: {}", username, e.getMessage());
            return Optional.empty();
        }
    }

    @Transactional
    public void disconnectUser(String username) {
        log.info("Disconnecting user from DigiLocker: {}", username);
        
        Optional<DigiLockerTokenInfo> tokenInfo = tokenInfoRepository.findByUsername(username);
        if (tokenInfo.isPresent()) {
            tokenInfoRepository.delete(tokenInfo.get());
            log.info("Successfully disconnected user: {}", username);
        } else {
            log.warn("No DigiLocker connection found for user: {}", username);
        }
    }

    private String generateState() {
        byte[] stateBytes = new byte[32];
        SECURE_RANDOM.nextBytes(stateBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(stateBytes);
    }

    private String generateCodeVerifier() {
        byte[] codeVerifierBytes = new byte[32];
        SECURE_RANDOM.nextBytes(codeVerifierBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(codeVerifierBytes);
    }

    private String generateCodeChallenge(String codeVerifier) {
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(codeVerifier.getBytes("UTF-8"));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate code challenge", e);
        }
    }
} 
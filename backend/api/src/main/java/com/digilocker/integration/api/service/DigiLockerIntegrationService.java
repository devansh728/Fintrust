package com.digilocker.integration.api.service;

import com.digilocker.integration.api.config.DigiLockerConfig;
import com.digilocker.integration.api.dto.RefreshTokenRequest;
import com.digilocker.integration.api.dto.TokenRequest;
import com.digilocker.integration.api.dto.TokenResponse;
import com.digilocker.integration.api.model.CodeVerifierEntity;
import com.digilocker.integration.api.model.DigiLockerAuth;
import com.digilocker.integration.api.repository.CodeVerifierEntityRepository;
import com.digilocker.integration.api.repository.DigiLockerAuthRepository;
import com.digilocker.integration.api.util.AesEncryptionUtil;
import com.digilocker.integration.api.util.CodeVerifierGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DigiLockerIntegrationService {

    private final DigiLockerConfig.DigiLockerAuthProperties authProperties;
    private final RestTemplate restTemplate;
    private final DigiLockerAuthRepository authRepository;
    private final CodeVerifierEntityRepository codeVerifierEntityRepository;
    private final CodeVerifierGenerator codeVerifierGenerator;
    @Value("${digilocker.token.encryption-key}")
    private final byte[] encryptionKey;

    public String initiateAuthorization(String userId) {
        String state = UUID.randomUUID().toString();
        String codeVerifier = codeVerifierGenerator.generate();
        String codeChallenge = codeVerifierGenerator.generateChallenge(codeVerifier);
        CodeVerifierEntity entity = new CodeVerifierEntity();
        entity.setCodeVerifier(codeVerifier);
        entity.setState(state);
        entity.setUserId(userId);
        codeVerifierEntityRepository.save(entity);

        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(authProperties.authUrl())
                .queryParam("response_type", "code")
                .queryParam("client_id", authProperties.clientId())
                .queryParam("redirect_uri", authProperties.redirectUri())
                .queryParam("state", state)
                .queryParam("code_challenge", codeChallenge)
                .queryParam("code_challenge_method", "S256");

        return builder.toUriString();
    }

    public TokenResponse exchangeCode(String code, String state) throws Exception {
        CodeVerifierEntity codeEntity = codeVerifierEntityRepository.findByState(state).orElseThrow(()-> new StateNotFoundException("No state found"));


        TokenRequest request = new TokenRequest();
        request.setCode(code);
        request.setClientId(authProperties.clientId());
        request.setClientSecret(authProperties.clientSecret());
        request.setRedirectUri(authProperties.redirectUri());
        request.setCodeVerifier(codeEntity.getCodeVerifier());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("code", request.getCode());
        map.add("grant_type", request.getGrantType());
        map.add("client_id", request.getClientId());
        map.add("client_secret", request.getClientSecret());
        map.add("redirect_uri", request.getRedirectUri());
        map.add("code_verifier", request.getCodeVerifier());

        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(map, headers);

        ResponseEntity<TokenResponse> response = restTemplate.exchange(
                authProperties.tokenUrl(),
                HttpMethod.POST,
                entity,
                TokenResponse.class);

        return saveTokenResponse(Objects.requireNonNull(response.getBody()), codeEntity.getUserId());
    }

    public TokenResponse refreshToken(String userId) throws Exception {
        DigiLockerAuth auth = authRepository.findByUserId(userId)
                .orElseThrow(() -> new AuthNotFoundException("User not connected to DigiLocker"));

        RefreshTokenRequest request = new RefreshTokenRequest();
        request.setRefreshToken(auth.getRefreshToken());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.setBasicAuth(authProperties.clientId(), authProperties.clientSecret());

        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("grant_type", request.getGrantType());
        map.add("refresh_token", request.getRefreshToken());

        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(map, headers);

        ResponseEntity<TokenResponse> response = restTemplate.exchange(
                authProperties.tokenUrl(),
                HttpMethod.POST,
                entity,
                TokenResponse.class);

        return saveTokenResponse(Objects.requireNonNull(response.getBody()),userId);
    }

    private TokenResponse saveTokenResponse(TokenResponse tokenResponse, String UserId) throws Exception {
        DigiLockerAuth auth = new DigiLockerAuth();
        auth.setAccessToken(AesEncryptionUtil.encrypt(tokenResponse.getAccessToken(), encryptionKey));
        auth.setRefreshToken(AesEncryptionUtil.encrypt(tokenResponse.getRefreshToken(), encryptionKey));
        auth.setExpiresAt(Instant.now().plusSeconds(tokenResponse.getExpiresIn()));
        auth.setScope(tokenResponse.getScope());
        auth.setTokenType(tokenResponse.getTokenType());
        auth.setDigiLockerId(tokenResponse.getDigiLockerId());
        auth.setName(tokenResponse.getName());
        auth.setDob(tokenResponse.getDob());
        auth.setGender(tokenResponse.getGender());
        auth.setEaadhaar(tokenResponse.getEaadhaar());
        auth.setReferenceKey(tokenResponse.getReferenceKey());
        auth.setUserId(UserId);

        authRepository.save(auth);
        return tokenResponse;
    }

    public boolean isTokenValid(String userId) {
        return authRepository.findByUserId(userId)
                .map(auth -> auth.getExpiresAt().isAfter(Instant.now()))
                .orElse(false);
    }
}

package com.digilocker.integration.api.service;

import com.digilocker.integration.api.dto.DocumentDownloadResponse;
import com.digilocker.integration.api.dto.DocumentListResponse;
import com.digilocker.integration.api.model.DigiLockerAuth;
import com.digilocker.integration.api.model.DocumentMetadata;
import com.digilocker.integration.api.repository.DigiLockerAuthRepository;
import com.digilocker.integration.api.util.HmacService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DocumentService {
    private final HmacService hmacService;
    private final RestTemplate digiLockerRestTemplate;
    private final DigiLockerOAuth2Service digiLockerOAuth2Service;

    public DocumentListResponse getSelfUploadedDocuments(String accessToken, String folderId) {
        String url = folderId != null ?
                "/public/oauth2/1/files/" + folderId :
                "/public/oauth2/1/files";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        ResponseEntity<DocumentListResponse> response = digiLockerRestTemplate.exchange(
                url,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                DocumentListResponse.class);

        return response.getBody();
    }

    public DocumentListResponse getIssuedDocuments(String username) throws Exception {
        Optional<String> accessToken = digiLockerOAuth2Service.getAccessToken(username);
        if (accessToken.isEmpty()) {
            throw new RuntimeException("No valid DigiLocker access token found for user: " + username);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken.get());

        ResponseEntity<DocumentListResponse> response = digiLockerRestTemplate.exchange(
                "/public/oauth2/2/files/issued",
                HttpMethod.GET,
                new HttpEntity<>(headers),
                DocumentListResponse.class);

        return response.getBody();
    }

    public DocumentDownloadResponse downloadDocument(String username, String uri) throws Exception {
        Optional<String> accessToken = digiLockerOAuth2Service.getAccessToken(username);
        if (accessToken.isEmpty()) {
            throw new RuntimeException("No valid DigiLocker access token found for user: " + username);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken.get());

        ResponseEntity<byte[]> response = digiLockerRestTemplate.exchange(
                "/public/oauth2/1/file/" + uri,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                byte[].class);

        // Verify HMAC
        String receivedHmac = response.getHeaders().getFirst("hmac");
        boolean isValid = hmacService.validateHmac(response.getBody(), receivedHmac);

        if (!isValid) {
            throw new DocumentIntegrityException("HMAC verification failed");
        }

        return new DocumentDownloadResponse(
                response.getBody(),
                response.getHeaders().getContentType(),
                uri
        );
    }

    public static class DocumentIntegrityException extends RuntimeException {
        public DocumentIntegrityException(String message) {
            super(message);
        }
    }
}

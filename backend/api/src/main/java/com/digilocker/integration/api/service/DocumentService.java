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

@Service
@RequiredArgsConstructor
public class DocumentService {
    private final HmacService hmacService;
    private final RestTemplate digiLockerRestTemplate;
    private TokenService tokenService;

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

    public DocumentListResponse getIssuedDocuments(String userId) throws Exception {

        String accessToken = tokenService.getAccessToken(userId).orElseThrow(()-> new RuntimeException("no access token issued"));

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        ResponseEntity<DocumentListResponse> response = digiLockerRestTemplate.exchange(
                "/public/oauth2/2/files/issued",
                HttpMethod.GET,
                new HttpEntity<>(headers),
                DocumentListResponse.class);

        return response.getBody();
    }

    public DocumentDownloadResponse downloadDocument(String userId, String uri) throws Exception {

        String accessToken = tokenService.getAccessToken(userId).orElseThrow(()-> new RuntimeException("no access token issued"));

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

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
}

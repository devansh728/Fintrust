package com.thirdparty.user.request.service;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.concurrent.CompletableFuture;

@Service
public class AsyncBlockchainService {

    private final RestTemplate restTemplate;

    public AsyncBlockchainService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Async
    public CompletableFuture<Void> submitToBlockchainAsync(String id, String minimizedJson) {
        try {
            String blockchainUrl = "http://localhost:8089/api/requests" + id + "/submitToBlockChain";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> requestEntity = new HttpEntity<>(minimizedJson, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(
                    blockchainUrl,
                    requestEntity,
                    String.class
            );

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("Blockchain API request failed: " + response.getBody());
            }

            return CompletableFuture.completedFuture(null);
        } catch (Exception e) {
            CompletableFuture<Void> future = new CompletableFuture<>();
            future.completeExceptionally(e);
            return future;
        }
    }
}
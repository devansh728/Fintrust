package com.digilocker.integration.api.config;

import com.digilocker.integration.api.util.HmacService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestTemplate;

@Configuration
public class DigiLockerConfig {

    @Value("${digilocker.api.base-url}")
    private String baseUrl;

    @Value("${digilocker.api.client-secret}")
    private String clientSecret;

    @Value("${digilocker.client-id}")
    private String clientId;

    @Value("${digilocker.redirect-uri}")
    private String redirectUri;

    @Value("${digilocker.auth-url}")
    private String authUrl;

    @Value("${digilocker.token-url}")
    private String tokenUrl;

    @Bean
    public RestTemplate digiLockerRestTemplate() {
        return new RestTemplateBuilder()
            .rootUri(baseUrl)
            .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
            .errorHandler(new DigiLockerErrorHandler())
            .build();
    }

    @Bean
    public RestTemplate digiLockerRestTemplate0() {
        return new RestTemplate();
    }

    @Bean
    public DigiLockerAuthProperties digiLockerAuthProperties() {
        return new DigiLockerAuthProperties(clientId, clientSecret, redirectUri, authUrl, tokenUrl);
    }

    @Bean
    public HmacService hmacUtil() {
        return new HmacService(clientSecret);
    }

    public record DigiLockerAuthProperties(
            String clientId,
            String clientSecret,
            String redirectUri,
            String authUrl,
            String tokenUrl
    ) {}
}

package com.digilocker.integration.api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;
import com.digilocker.integration.api.util.RateLimiter;

@Configuration
public class RateLimitingConfig {
    @Bean
    public RateLimiter rateLimiter() {
        return new RateLimiter(10, 60); // 10 requests per 60 seconds per user
    }
}

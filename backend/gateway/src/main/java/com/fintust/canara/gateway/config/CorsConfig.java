package com.fintust.canara.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOriginPattern("*"); // Allow all origins
        config.addAllowedMethod("*"); // Allow all methods
        config.addAllowedHeader("*"); // Allow all headers
        config.setExposedHeaders(List.of("*")); // Expose all headers
        config.setAllowCredentials(true); // Allow credentials
        config.setMaxAge(3600L); // Cache for 1 hour

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsWebFilter(source);
    }
}
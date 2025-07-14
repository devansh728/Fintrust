package com.fintust.canara.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
@EnableReactiveMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        http
            .csrf(ServerHttpSecurity.CsrfSpec::disable)
            .cors(ServerHttpSecurity.CorsSpec::disable) // Disable built-in CORS as we have our own filter
            .authorizeExchange(exchanges -> exchanges
                // Public endpoints
                .pathMatchers(
                    "/actuator/**",
                    "/api/auth/**",
                    "/api/digilocker/public/**"
                ).permitAll()
                
                // Allow OPTIONS requests for CORS preflight
                .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                
                // Authenticated endpoints
                .pathMatchers("/api/user/**").authenticated()
                .pathMatchers("/api/digilocker/**").authenticated()
                .pathMatchers("/api/requests/**").authenticated()
                
                // All other requests
                .anyExchange().authenticated()
            )
            .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
            .formLogin(ServerHttpSecurity.FormLoginSpec::disable);
        
        return http.build();
    }
}
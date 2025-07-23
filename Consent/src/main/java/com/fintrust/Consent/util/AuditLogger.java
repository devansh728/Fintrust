package com.fintrust.Consent.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import java.time.Instant;

@Slf4j
@Component
public class AuditLogger {
    public void log(String action, String userId, String details) {
        log.info("AUDIT | {} | userId={} | {} | at {}", action, userId, details, Instant.now());
    }
}

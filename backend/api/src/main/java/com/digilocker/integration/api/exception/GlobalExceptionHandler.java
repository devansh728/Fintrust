package com.digilocker.integration.api.exception;

import com.digilocker.integration.api.util.HmacService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import lombok.extern.slf4j.Slf4j;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(HmacService.HmacValidationException.class)
    public ResponseEntity<ErrorResponse> handleHmacValidationException(
            HmacService.HmacValidationException ex) {
        log.warn("HMAC validation failed: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("HMAC_VALIDATION_FAILED", ex.getMessage()));
    }

    @ExceptionHandler(DocumentIntegrityException.class)
    public ResponseEntity<ErrorResponse> handleDocumentIntegrityException(
            DocumentIntegrityException ex) {
        log.warn("Document integrity failed: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("DOCUMENT_INTEGRITY_FAILED", ex.getMessage()));
    }
    @ExceptionHandler(AuthNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleAuthNotFound(AuthNotFoundException ex) {
        log.warn("Auth not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("AUTH_NOT_FOUND", ex.getMessage()));
    }

    @ExceptionHandler(TokenRefreshException.class)
    public ResponseEntity<ErrorResponse> handleTokenRefresh(TokenRefreshException ex) {
        log.warn("Token refresh failed: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse("TOKEN_REFRESH_FAILED", ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleException(Exception ex) {
        log.error("Unhandled exception: {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal server error", "details", ex.getMessage()));
    }
}

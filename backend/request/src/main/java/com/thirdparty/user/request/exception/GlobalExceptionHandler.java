package com.thirdparty.user.request.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ConsentNotGivenException.class)
    public ResponseEntity<?> handleConsentNotGiven(ConsentNotGivenException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
    }
    @ExceptionHandler(DocumentValidationException.class)
    public ResponseEntity<?> handleDocValidation(DocumentValidationException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
    @ExceptionHandler(BlockchainSubmissionException.class)
    public ResponseEntity<?> handleBlockchain(BlockchainSubmissionException ex) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(ex.getMessage());
    }
    @ExceptionHandler(RequestNotCompleteException.class)
    public ResponseEntity<?> handleRequestNotComplete(RequestNotCompleteException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleOther(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal error: " + ex.getMessage());
    }
}

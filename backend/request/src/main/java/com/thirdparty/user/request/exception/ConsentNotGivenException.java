package com.thirdparty.user.request.exception;

public class ConsentNotGivenException extends RuntimeException {
    public ConsentNotGivenException(String message) {
        super(message);
    }
}

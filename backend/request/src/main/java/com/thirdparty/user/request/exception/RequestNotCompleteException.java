package com.thirdparty.user.request.exception;

public class RequestNotCompleteException extends RuntimeException {
    public RequestNotCompleteException(String message) {
        super(message);
    }
}

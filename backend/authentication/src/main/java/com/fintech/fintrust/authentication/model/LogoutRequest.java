package com.fintech.fintrust.authentication.model;

import lombok.Data;

@Data
public class LogoutRequest {
    private String refreshToken;
}

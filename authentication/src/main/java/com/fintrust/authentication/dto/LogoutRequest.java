package com.fintrust.authentication.dto;

import lombok.Data;

@Data
public class LogoutRequest {
    private String refreshToken;
}
package com.fintrust.authentication.dto;

import lombok.Data;

@Data
public class RefreshRequest {
    private String refreshToken;
}

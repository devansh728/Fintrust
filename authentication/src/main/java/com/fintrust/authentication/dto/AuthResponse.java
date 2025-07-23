package com.fintrust.authentication.dto;

import com.fintrust.authentication.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private User user;
}

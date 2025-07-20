package com.thirdparty.user.request.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    private String id;
    private String username;
    private String userId;
    private String password; // BCrypt hashed
    private List<String> roles;
    private String digilockerId; // Unique identifier for DigiLocker integration
    private String refreshToken; // Store the latest refresh token for rotation
}

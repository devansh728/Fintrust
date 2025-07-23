package com.fintrust.Consent.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "user_profiles")
public class UserProfile {
    @Id
    private String id;
    private String userId; // from Auth MS
    private String fullName;
    private String email;
    private String phone;
    private String profilePhoto;
    private String address;
    private String accountNumber; // New field for bank account number
    private String bank; // New field for bank name
    private String birthYear; // New field for date of birth
    private String aadhar;
    private String panCard;
    private String kycStatus;
    private Instant createdAt;
    private Instant updatedAt;
}

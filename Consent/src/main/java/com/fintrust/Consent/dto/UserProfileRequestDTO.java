package com.fintrust.Consent.dto;

import lombok.Data;

@Data
public class UserProfileRequestDTO {
    private String fullName;
    private String email;
    private String phone;
    private String profilePhoto;
    private String address;
    private String accountNumber;
    private String bank;
    private String birthYear;
    private String aadhar;
    private String panCard;
    private String kycStatus;
}


package com.fintrust.Consent.service.impl;

import com.fintrust.Consent.dto.UserProfileRequestDTO;
import com.fintrust.Consent.dto.UserProfileResponseDTO;
import com.fintrust.Consent.model.UserProfile;
import com.fintrust.Consent.repository.UserProfileRepository;
import com.fintrust.Consent.service.UserProfileService;
import com.fintrust.Consent.util.MaskingUtil;
import com.fintrust.Consent.security.util.AuthServiceTokenValidator;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserProfileServiceImpl implements UserProfileService {
    private final UserProfileRepository userProfileRepository;
    private final MaskingUtil maskingUtil;
    private final AuthServiceTokenValidator authServiceTokenValidator;

    @Override
    public UserProfileResponseDTO createProfile(UserProfileRequestDTO dto) {
        // Example: Assume JWT is passed in a custom field for demo; in real use, get from context/header
        String jwt = dto.getEmail(); // Replace with actual JWT extraction
        if (!authServiceTokenValidator.validateTokenWithAuthService(jwt)) {
            throw new RuntimeException("Invalid or expired token");
        }
        UserProfile profile = UserProfile.builder()
                .userId(dto.getEmail()) // Should be set from Auth context in real use
                .fullName(dto.getFullName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .profilePhoto(dto.getProfilePhoto())
                .address(dto.getAddress())
                .accountNumber(dto.getAccountNumber())
                .bank(dto.getBank())
                .birthYear(dto.getBirthYear())
                .aadhar(dto.getAadhar())
                .panCard(dto.getPanCard())
                .kycStatus(dto.getKycStatus())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        profile = userProfileRepository.save(profile);
        return toResponseDTO(profile);
    }

    @Override
    public UserProfileResponseDTO updateProfile(UserProfileRequestDTO dto) {
        String jwt = dto.getEmail(); // Replace with actual JWT extraction
        if (!authServiceTokenValidator.validateTokenWithAuthService(jwt)) {
            throw new RuntimeException("Invalid or expired token");
        }
        UserProfile profile = userProfileRepository.findByUserId(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        profile.setFullName(dto.getFullName());
        profile.setPhone(dto.getPhone());
        profile.setProfilePhoto(dto.getProfilePhoto());
        profile.setAddress(dto.getAddress());
        profile.setAccountNumber(dto.getAccountNumber());
        profile.setBank(dto.getBank());
        profile.setBirthYear(dto.getBirthYear());
        profile.setAadhar(dto.getAadhar());
        profile.setPanCard(dto.getPanCard());
        profile.setKycStatus(dto.getKycStatus());
        profile.setUpdatedAt(Instant.now());
        profile = userProfileRepository.save(profile);
        return toResponseDTO(profile);
    }

    @Override
    public UserProfileResponseDTO getProfile(String userId) {
        // In real use, extract JWT from context/header and validate
        String jwt = userId; // Replace with actual JWT extraction in real use
        if (!authServiceTokenValidator.validateTokenWithAuthService(jwt)) {
            throw new RuntimeException("Invalid or expired token");
        }
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        // Mask sensitive fields
        profile.setAadhar(maskingUtil.maskAadhar(profile.getAadhar()));
        profile.setPanCard(maskingUtil.maskPan(profile.getPanCard()));
        profile.setPhone(maskingUtil.maskPhone(profile.getPhone()));
        profile.setAccountNumber(maskingUtil.maskAccount(profile.getAccountNumber()));
        return toResponseDTO(profile);
    }

    private UserProfileResponseDTO toResponseDTO(UserProfile profile) {
        UserProfileResponseDTO dto = new UserProfileResponseDTO();
        dto.setId(profile.getId());
        dto.setUserId(profile.getUserId());
        dto.setFullName(profile.getFullName());
        dto.setEmail(profile.getEmail());
        dto.setPhone(profile.getPhone());
        dto.setProfilePhoto(profile.getProfilePhoto());
        dto.setAddress(profile.getAddress());
        dto.setAccountNumber(profile.getAccountNumber());
        dto.setBank(profile.getBank());
        dto.setBirthYear(profile.getBirthYear());
        dto.setAadhar(profile.getAadhar());
        dto.setPanCard(profile.getPanCard());
        dto.setKycStatus(profile.getKycStatus());
        dto.setCreatedAt(profile.getCreatedAt() != null ? profile.getCreatedAt().toString() : null);
        dto.setUpdatedAt(profile.getUpdatedAt() != null ? profile.getUpdatedAt().toString() : null);
        return dto;
    }
}

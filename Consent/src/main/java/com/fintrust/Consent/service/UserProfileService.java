package com.fintrust.Consent.service;

import com.fintrust.Consent.dto.UserProfileRequestDTO;
import com.fintrust.Consent.dto.UserProfileResponseDTO;

public interface UserProfileService {
    UserProfileResponseDTO createProfile(UserProfileRequestDTO dto);
    UserProfileResponseDTO updateProfile(UserProfileRequestDTO dto);
    UserProfileResponseDTO getProfile(String userId);
}

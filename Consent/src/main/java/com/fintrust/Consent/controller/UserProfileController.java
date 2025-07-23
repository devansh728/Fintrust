package com.fintrust.Consent.controller;

import com.fintrust.Consent.dto.UserProfileRequestDTO;
import com.fintrust.Consent.dto.UserProfileResponseDTO;
import com.fintrust.Consent.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user/profile")
@RequiredArgsConstructor
public class UserProfileController {
    private final UserProfileService userProfileService;

    @PostMapping
    public ResponseEntity<UserProfileResponseDTO> createProfile(@RequestBody UserProfileRequestDTO dto) {
        return ResponseEntity.ok(userProfileService.createProfile(dto));
    }

    @PutMapping
    public ResponseEntity<UserProfileResponseDTO> updateProfile(@RequestBody UserProfileRequestDTO dto) {
        return ResponseEntity.ok(userProfileService.updateProfile(dto));
    }

    @GetMapping
    public ResponseEntity<UserProfileResponseDTO> getProfile(@RequestParam String userId) {
        return ResponseEntity.ok(userProfileService.getProfile(userId));
    }
}

package com.thirdparty.user.request.service;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "digilocker-service", url = "${digilocker.service.url}")
public interface DigiLockerClient {
    @GetMapping("/api/digilocker/document")
    byte[] getDocument(@RequestParam("documentId") String documentId, @RequestHeader("Authorization") String token);
}

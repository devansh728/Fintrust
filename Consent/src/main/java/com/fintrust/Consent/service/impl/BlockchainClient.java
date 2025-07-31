package com.fintrust.Consent.service.impl;

import com.fintrust.Consent.dto.BlockchainResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "blockchain-service", url = "${blockchain.service.url}")
public interface BlockchainClient {
    @PostMapping("api/third-party/authorize-local")
    BlockchainResponse authorizeTpp(@RequestBody Map<String, String> request);
}

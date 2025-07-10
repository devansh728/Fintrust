package com.thirdparty.user.request.service;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "blockchain-service", url = "${blockchain.service.url}")
public interface BlockchainClient {
    @PostMapping("/api/blockchain/submit")
    String submitToBlockchain(@RequestBody String smartContractData);
}

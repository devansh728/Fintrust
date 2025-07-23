package com.fintrust.Consent.controller;

import com.fintrust.Consent.dto.ThirdPartyRequestDTO;
import com.fintrust.Consent.service.ThirdPartyRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/thirdparty")
@RequiredArgsConstructor
public class ThirdPartyController {
    private static final Logger logger = LoggerFactory.getLogger(ThirdPartyController.class);
    private final ThirdPartyRequestService thirdPartyRequestService;

    @PostMapping("/request/{reqId}")
    public ResponseEntity<?> createRequest(@RequestBody ThirdPartyRequestDTO dto, @PathVariable String reqId) {
        logger.info("ThirdPartyController: Received createRequest for reqId: {}, dto: {}", reqId, dto);
        Object result = thirdPartyRequestService.createRequest(dto, reqId);
        logger.info("ThirdPartyController: createRequest result: {}", result);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllRequests() {
        logger.info("ThirdPartyController: Received getAllRequests");
        Object result = thirdPartyRequestService.getAllRequests();
        logger.info("ThirdPartyController: getAllRequests result: {}", result);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/all/pending")
    public ResponseEntity<?> getAllRequestsPending() {
        logger.info("ThirdPartyController: Received getAllRequestsPending");
        Object result = thirdPartyRequestService.getAllRequestsPending();
        logger.info("ThirdPartyController: getAllRequestsPending result: {}", result);
        return ResponseEntity.ok(result);
    }
}

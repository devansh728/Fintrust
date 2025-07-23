package com.fintrust.Consent.service.impl;

import com.fintrust.Consent.dto.ThirdPartyRequestDTO;
import com.fintrust.Consent.model.ThirdPartyRequest;
import com.fintrust.Consent.model.DynamicFormField;
import com.fintrust.Consent.repository.ThirdPartyRequestRepository;
import com.fintrust.Consent.service.ThirdPartyRequestService;
import com.fintrust.Consent.dto.DynamicFormFieldDTO;
import java.time.Instant;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Collections;
import java.util.List;
import com.fintrust.Consent.security.util.AuthServiceTokenValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
public class ThirdPartyRequestServiceImpl implements ThirdPartyRequestService {
    private static final Logger logger = LoggerFactory.getLogger(ThirdPartyRequestServiceImpl.class);
    private final ThirdPartyRequestRepository thirdPartyRequestRepository;
    private final AuthServiceTokenValidator authServiceTokenValidator;

    @Override
    public Object createRequest(ThirdPartyRequestDTO dto, String reqId) {
        logger.info("ThirdPartyRequestServiceImpl: Creating request for reqId: {}, dto: {}", reqId, dto);
        ThirdPartyRequest req = ThirdPartyRequest.builder()
                .userId(dto.getUserId())
                .thirdPartyName(dto.getThirdPartyName())
                .purpose(dto.getPurpose())
                .officialEmail(dto.getOfficialEmail())
                .organization(dto.getOrganization())
                .useCase(dto.getUseCase())
                .description(dto.getDescription())
                .dynamicFields(dto.getDynamicFields() != null ? dto.getDynamicFields().stream().map(this::toModelField).collect(Collectors.toList()) : null)
                .status("PENDING")
                .createdAt(Instant.now())
                .requestId(reqId)
                .build();
        req = thirdPartyRequestRepository.save(req);
        logger.info("ThirdPartyRequestServiceImpl: Saved request: {}", req);
        return req;
    }

    @Override
    public List<ThirdPartyRequest> getAllRequests() {
        logger.info("ThirdPartyRequestServiceImpl: Fetching all requests");
        List<ThirdPartyRequest> result = thirdPartyRequestRepository.findAll();
        logger.info("ThirdPartyRequestServiceImpl: getAllRequests result count: {}", result.size());
        return result;
    }

    @Override
    public List<?> getAllRequestsPending() {
        logger.info("ThirdPartyRequestServiceImpl: Fetching all pending requests");
        List<ThirdPartyRequest> request = thirdPartyRequestRepository.findAll();
        List<?> pending = request.stream().filter(r -> "PENDING".equals(r.getStatus())).collect(Collectors.toList());
        logger.info("ThirdPartyRequestServiceImpl: getAllRequestsPending result count: {}", pending.size());
        return pending;
    }

    private DynamicFormField toModelField(DynamicFormFieldDTO dto) {
        logger.info("ThirdPartyRequestServiceImpl: Mapping DynamicFormFieldDTO to model: {}", dto);
        return DynamicFormField.builder()
                .key(dto.getKey())
                .type(dto.getType())
                .value(dto.getValue())
                .required(dto.isRequired())
                .build();
    }
}

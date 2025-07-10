package com.thirdparty.user.request.dto;

import lombok.Data;

@Data
public class BlockchainSubmitDto {
    private String requestId;
    private String smartContractData;
}

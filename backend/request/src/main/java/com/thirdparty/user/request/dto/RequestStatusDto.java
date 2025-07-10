package com.thirdparty.user.request.dto;

import lombok.Data;

@Data
public class RequestStatusDto {
    private String requestId;
    private String status;
    private String blockchainTxId;
}

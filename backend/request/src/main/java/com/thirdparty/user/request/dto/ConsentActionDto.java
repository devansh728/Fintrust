package com.thirdparty.user.request.dto;

import lombok.Data;

@Data
public class ConsentActionDto {
    private String userId;
    private String action; // approve, reject, delete
    private String reason;
}

package com.thirdparty.user.request.dto;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class ConsentActionFieldDto {
    private String userId;
    private String action; // approve, reject, delete
    private String reason;
    private String field;
}

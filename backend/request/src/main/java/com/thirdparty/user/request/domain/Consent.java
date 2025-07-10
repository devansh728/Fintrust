package com.thirdparty.user.request.domain;

import lombok.*;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Consent {
    private String userId;
    private String action; // approve, reject, delete
    private String reason;
    private Instant timestamp;
}

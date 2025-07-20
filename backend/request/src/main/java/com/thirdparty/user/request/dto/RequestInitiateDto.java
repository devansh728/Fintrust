package com.thirdparty.user.request.dto;

import lombok.Builder;
import lombok.Data;
import java.util.Map;

@Data
@Builder
public class RequestInitiateDto {
    private String title;
    private String name;
    private String description;
    private Map<String, Object> dynamicFields;
    private String requestedBy;
}
//'payload={
//        "use_case": "Credit Card Issuance",
//        "third_party": {
//        "name": "BankCorp",
//        "purpose": "KYC Verification",
//        "requested_fields": ["PAN Card", "Aadhar", "Phone Number"]
//        },
//        "user_consent": {
//        "approved_fields": ["PAN Card", "Phone Number"],
//        "consent_type": "Granular",
//        "consent_time": "2024-06-01T12:00:00Z"
//        },
//        "form_data": {
//        "text_fields": {"Phone Number": "9876543210"},
//        "file_uploads": {}
//        }
//        }' \
//  -F 'PAN_Card=@/path/to/pan.pdf' \
//  -F 'Aadhar=@/path/to/aadhar.jpg'
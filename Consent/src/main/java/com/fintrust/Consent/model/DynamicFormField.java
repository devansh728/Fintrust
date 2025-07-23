package com.fintrust.Consent.model;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DynamicFormField {
    private String key;
    private String type;
    private Object value;
    private boolean required;
}

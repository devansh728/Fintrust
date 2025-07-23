package com.fintrust.Consent.dto;

import lombok.Data;

@Data
public class DynamicFormFieldDTO {
    private String key;
    private String type;
    private Object value;
    private boolean required;
}

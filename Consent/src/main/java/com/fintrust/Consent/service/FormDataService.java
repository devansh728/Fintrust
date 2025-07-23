package com.fintrust.Consent.service;

import com.fintrust.Consent.dto.FormDataSubmissionDTO;

public interface FormDataService {
    Object submitForm(FormDataSubmissionDTO dto);
}

package com.fintrust.Consent.repository;

import com.fintrust.Consent.model.FormDataSubmission;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface FormDataSubmissionRepository extends MongoRepository<FormDataSubmission, String> {
}

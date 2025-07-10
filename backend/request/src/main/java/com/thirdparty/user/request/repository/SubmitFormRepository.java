package com.thirdparty.user.request.repository;

import com.thirdparty.user.request.domain.SubmitFrom;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface SubmitFormRepository extends MongoRepository<SubmitFrom,String> {
    Optional<SubmitFrom> findByRequestId(String requestId);
}

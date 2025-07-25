package com.thirdparty.user.request.repository;

import com.thirdparty.user.request.domain.Request;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface RequestRepository extends MongoRepository<Request, String> {
}

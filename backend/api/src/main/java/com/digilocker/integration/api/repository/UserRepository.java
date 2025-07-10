package com.digilocker.integration.api.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findById(String id);
}
// Note: Replace 'User' with your actual User entity class.

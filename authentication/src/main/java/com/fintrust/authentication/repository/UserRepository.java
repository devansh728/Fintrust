package com.fintrust.authentication.repository;

import com.fintrust.authentication.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query("{ 'email' : ?0 }")
    void updateRefreshToken(String email, String refreshToken);
}

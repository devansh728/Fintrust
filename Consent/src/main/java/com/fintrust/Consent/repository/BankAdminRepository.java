package com.fintrust.Consent.repository;

import com.fintrust.Consent.model.BankAdmin;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for BankAdmin documents.
 * Provides standard CRUD operations and custom query methods for bank administrators.
 */
@Repository
public interface BankAdminRepository extends MongoRepository<BankAdmin, String> {

    /**
     * Finds a BankAdmin by their email address.
     * @param email The email address to search for.
     * @return An Optional containing the BankAdmin if found, otherwise empty.
     */
    Optional<BankAdmin> findByEmail(String email);

    /**
     * Finds a BankAdmin by their public key.
     * @param publicKey The public key to search for.
     * @return An Optional containing the BankAdmin if found, otherwise empty.
     */
    Optional<BankAdmin> findByPublicKey(String publicKey);

    /**
     * Finds a BankAdmin by their admin ID.
     * Although findById(String id) is available from MongoRepository,
     * this specific method can be useful for clarity or if custom logic
     * were to be added around finding by adminId specifically.
     * @param adminId The unique identifier of the bank admin.
     * @return An Optional containing the BankAdmin if found, otherwise empty.
     */
    Optional<BankAdmin> findByAdminId(String adminId);

    /**
     * Checks if a BankAdmin exists with the given email address.
     * @param email The email address to check.
     * @return true if a BankAdmin with the email exists, false otherwise.
     */
    boolean existsByEmail(String email);
}
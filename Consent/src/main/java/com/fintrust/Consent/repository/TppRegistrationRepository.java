package com.fintrust.Consent.repository;
import com.fintrust.Consent.model.TppRegistration;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TppRegistrationRepository extends MongoRepository<TppRegistration, String> {

    /**
     * Finds TPP registrations by their status.
     * @param status The status to search for (e.g., "APPROVED", "PENDING_KYC").
     * @return A list of TppRegistration objects matching the given status.
     */
    List<TppRegistration> findByStatus(String status);

    /**
     * Finds a TPP registration by its unique TPP ID and status.
     * @param tppId The unique identifier of the TPP.
     * @param status The status of the TPP registration.
     * @return An Optional containing the TppRegistration if found, otherwise empty.
     */
    Optional<TppRegistration> findByTppIdAndStatus(String tppId, String status);

    /**
     * Finds TPP registrations based on their jurisdiction.
     * @param jurisdiction The jurisdiction to search for.
     * @return A list of TppRegistration objects registered in the specified jurisdiction.
     */
    List<TppRegistration> findByJurisdiction(String jurisdiction);

    /**
     * Finds TPP registrations that contain a specific KYC hash in their kycHashes list.
     * @param kycHash The KYC hash to search for within the list.
     * @return A list of TppRegistration objects containing the specified KYC hash.
     */
    List<TppRegistration> findByKycHashesContaining(String kycHash);

    /**
     * Finds TPP registrations whose expiry date is before the given LocalDateTime.
     * Useful for identifying expired registrations.
     * @param dateTime The LocalDateTime to compare against the expiryDate.
     * @return A list of TppRegistration objects with an expiryDate before the given dateTime.
     */
    List<TppRegistration> findByExpiryDateBefore(LocalDateTime dateTime);

    /**
     * Finds TPP registrations that have requested a specific scope.
     * @param scope The scope string to search for within the requestedScopes list.
     * @return A list of TppRegistration objects that have requested the specified scope.
     */
    List<TppRegistration> findByRequestedScopesContaining(String scope);

    /**
     * Finds TPP registrations by name, ignoring case.
     * @param name The name to search for.
     * @return A list of TppRegistration objects matching the given name.
     */
    List<TppRegistration> findByNameIgnoreCase(String name);

    /**
     * Finds TPP registrations with a status other than the one provided.
     * @param status The status to exclude.
     * @return A list of TppRegistration objects whose status does not match the given status.
     */
    List<TppRegistration> findByStatusNot(String status);
}


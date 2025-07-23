# Consent Microservice

This project is a Java Spring Boot-based Consent microservice.

## Project Structure

- **Spring Boot Version:** 3.5.3
- **Java Version:** 17
- **Main Dependencies:**
  - spring-boot-starter-data-mongodb
  - spring-boot-starter-oauth2-client
  - spring-boot-starter-security
  - spring-boot-starter-validation
  - spring-boot-starter-web
  - jjwt (Java JWT)
  - lombok
  - jackson-databind


-## Models
- UserProfile: id, userId (from Auth MS), fullName, email, phone, profilePhoto, address, bankDetails, aadhar, panCard, kycStatus, createdAt, updatedAt
- ThirdPartyRequest: id, userId, thirdPartyName, purpose, officialEmail, organization, useCase, description, dynamicFields (list of required fields), status (PENDING/APPROVED/REJECTED), createdAt
- UserConsent: id, userId, thirdPartyRequestId, status (APPROVED/REJECTED), decisionDate
- FormDataSubmission: id, thirdPartyRequestId, userId, submittedFields (text + documents), privacyLevel (differential score), maskedData, forwarded (boolean), forwardedAt
- DynamicFormField: key, type, value, required


## DTOs
- UserProfileRequestDTO
- UserProfileResponseDTO
- ThirdPartyRequestDTO
- ConsentDecisionDTO
- DynamicFormFieldDTO
- FormDataSubmissionDTO

-## Repositories
- UserProfileRepository
- ThirdPartyRequestRepository
- UserConsentRepository
- FormDataSubmissionRepository


-## Services
- UserProfileService, UserProfileServiceImpl
- ThirdPartyRequestService, ThirdPartyRequestServiceImpl
- ConsentService, ConsentServiceImpl
- FormDataService, FormDataServiceImpl


## Security
- JwtSecurityConfig (Spring Security config)
- JwtTokenFilter (JWT validation filter)
- JwtUtil (JWT validation and extraction)

## Privacy Utilities


## Auth Microservice Integration

## Business Logic

## Next Steps
## Async Forwarding & Audit Logging
 Form data submissions are forwarded asynchronously to external APIs.
 All sensitive actions are logged using AuditLogger for audit trail.

## Next Steps

---

This README will be updated as the project evolves.

## Notes
- This service may connect to the User model in the Authentication microservice (MongoDB).
- The README will be updated as the project evolves.

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title PrivacyFramework
 * @dev AI-Driven Decentralized Data Privacy Framework for Fintech Ecosystems
 * 
 * Features:
 * - Consent Management
 * - Access Control
 * - Audit Trails
 * - Data Sharing Logs
 * - Anomaly Detection Support
 * - Compliance Enforcement
 */
contract PrivacyFramework is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;

    // Structs
    struct Consent {
        address userAddress;
        string dataHash;
        string useCase;
        uint256 timestamp;
        bool isActive;
        uint256 expiryTime;
        string thirdPartyId;
        string dataType;
        bool isRevoked;
    }

    struct AccessLog {
        address requester;
        string dataHash;
        string purpose;
        uint256 timestamp;
        bool wasGranted;
        string reason;
        string ipAddress;
        string deviceFingerprint;
    }

    struct AnomalyAlert {
        address userAddress;
        string dataHash;
        string anomalyType;
        uint256 timestamp;
        string description;
        bool isResolved;
    }

    // State Variables
    Counters.Counter private _consentIds;
    Counters.Counter private _accessLogIds;
    Counters.Counter private _anomalyIds;

    // Mappings
    mapping(uint256 => Consent) public consents;
    mapping(uint256 => AccessLog) public accessLogs;
    mapping(uint256 => AnomalyAlert) public anomalies;
    
    // User consent tracking
    mapping(address => uint256[]) public userConsents;
    mapping(address => mapping(string => bool)) public userConsentStatus;
    
    // Third party tracking
    mapping(string => bool) public authorizedThirdParties;
    mapping(string => uint256[]) public thirdPartyAccessLogs;

    // Mapping from file hash (bytes32) to owner address
    mapping(bytes32 => address) public fileOwners;

    // Mapping from file hash to authorized third parties
    mapping(bytes32 => mapping(address => bool)) public fileAccess;

    // Events
    event ConsentGranted(
        uint256 indexed consentId,
        address indexed userAddress,
        string dataHash,
        string useCase,
        uint256 timestamp,
        uint256 expiryTime
    );

    event ConsentRevoked(
        uint256 indexed consentId,
        address indexed userAddress,
        string dataHash,
        uint256 timestamp
    );

    event AccessRequested(
        uint256 indexed logId,
        address indexed requester,
        string dataHash,
        string purpose,
        uint256 timestamp
    );

    event AccessGranted(
        uint256 indexed logId,
        address indexed requester,
        string dataHash,
        uint256 timestamp
    );

    event AccessDenied(
        uint256 indexed logId,
        address indexed requester,
        string dataHash,
        string reason,
        uint256 timestamp
    );

    event AnomalyDetected(
        uint256 indexed anomalyId,
        address indexed userAddress,
        string dataHash,
        string anomalyType,
        string description,
        uint256 timestamp
    );

    event ThirdPartyAuthorized(
        string thirdPartyId,
        address authorizedBy,
        uint256 timestamp
    );

    event ThirdPartyRevoked(
        string thirdPartyId,
        address revokedBy,
        uint256 timestamp
    );

    // Event for file registration
    event FileRegistered(bytes32 indexed fileHash, address indexed owner);

    // Event for third party authorization
    event ThirdPartyAuthorized(bytes32 indexed fileHash, address indexed thirdParty);

    // Modifiers
    modifier onlyAuthorizedThirdParty(string memory thirdPartyId) {
        require(authorizedThirdParties[thirdPartyId], "Third party not authorized");
        _;
    }

    modifier onlyValidConsent(uint256 consentId) {
        require(consentId > 0 && consentId <= _consentIds.current(), "Invalid consent ID");
        require(consents[consentId].isActive, "Consent not active");
        require(!consents[consentId].isRevoked, "Consent revoked");
        require(consents[consentId].expiryTime > block.timestamp, "Consent expired");
        _;
    }

    // Constructor
    constructor() {
        _consentIds.increment(); // Start from 1
        _accessLogIds.increment();
        _anomalyIds.increment();
    }

    /**
     * @dev Grant consent for data sharing
     * @param dataHash Hash of the data being consented to
     * @param useCase Purpose of data usage
     * @param thirdPartyId Identifier for the third party
     * @param dataType Type of data being shared
     * @param durationInSeconds How long the consent is valid
     */
    function grantConsent(
        string memory dataHash,
        string memory useCase,
        string memory thirdPartyId,
        string memory dataType,
        uint256 durationInSeconds
    ) external nonReentrant {
        require(bytes(dataHash).length > 0, "Data hash cannot be empty");
        require(bytes(useCase).length > 0, "Use case cannot be empty");
        require(durationInSeconds > 0, "Duration must be positive");
        require(authorizedThirdParties[thirdPartyId], "Third party not authorized");

        uint256 consentId = _consentIds.current();
        
        consents[consentId] = Consent({
            userAddress: msg.sender,
            dataHash: dataHash,
            useCase: useCase,
            timestamp: block.timestamp,
            isActive: true,
            expiryTime: block.timestamp + durationInSeconds,
            thirdPartyId: thirdPartyId,
            dataType: dataType,
            isRevoked: false
        });

        userConsents[msg.sender].push(consentId);
        userConsentStatus[msg.sender][dataHash] = true;

        _consentIds.increment();

        emit ConsentGranted(
            consentId,
            msg.sender,
            dataHash,
            useCase,
            block.timestamp,
            block.timestamp + durationInSeconds
        );
    }

    /**
     * @dev Revoke consent
     * @param consentId ID of the consent to revoke
     */
    function revokeConsent(uint256 consentId) external onlyValidConsent(consentId) {
        Consent storage consent = consents[consentId];
        require(consent.userAddress == msg.sender, "Only consent owner can revoke");
        
        consent.isRevoked = true;
        consent.isActive = false;
        userConsentStatus[msg.sender][consent.dataHash] = false;

        emit ConsentRevoked(
            consentId,
            msg.sender,
            consent.dataHash,
            block.timestamp
        );
    }

    /**
     * @dev Request access to data
     * @param dataHash Hash of the data being requested
     * @param purpose Purpose of the access request
     * @param thirdPartyId Identifier for the third party
     * @param ipAddress IP address of the requester
     * @param deviceFingerprint Device fingerprint for security
     */
    function requestAccess(
        string memory dataHash,
        string memory purpose,
        string memory thirdPartyId,
        string memory ipAddress,
        string memory deviceFingerprint
    ) external onlyAuthorizedThirdParty(thirdPartyId) nonReentrant returns (bool) {
        require(bytes(dataHash).length > 0, "Data hash cannot be empty");
        require(bytes(purpose).length > 0, "Purpose cannot be empty");

        uint256 logId = _accessLogIds.current();
        
        // Check if user has active consent for this data
        bool hasConsent = userConsentStatus[msg.sender][dataHash];
        bool accessGranted = false;
        string memory reason = "";

        if (hasConsent) {
            // Find the specific consent
            uint256[] memory userConsentList = userConsents[msg.sender];
            for (uint256 i = 0; i < userConsentList.length; i++) {
                Consent storage consent = consents[userConsentList[i]];
                if (
                    keccak256(bytes(consent.dataHash)) == keccak256(bytes(dataHash)) &&
                    consent.isActive &&
                    !consent.isRevoked &&
                    consent.expiryTime > block.timestamp &&
                    keccak256(bytes(consent.thirdPartyId)) == keccak256(bytes(thirdPartyId))
                ) {
                    accessGranted = true;
                    break;
                }
            }
        }

        if (!accessGranted) {
            reason = "No valid consent found";
        }

        accessLogs[logId] = AccessLog({
            requester: msg.sender,
            dataHash: dataHash,
            purpose: purpose,
            timestamp: block.timestamp,
            wasGranted: accessGranted,
            reason: reason,
            ipAddress: ipAddress,
            deviceFingerprint: deviceFingerprint
        });

        thirdPartyAccessLogs[thirdPartyId].push(logId);
        _accessLogIds.increment();

        emit AccessRequested(
            logId,
            msg.sender,
            dataHash,
            purpose,
            block.timestamp
        );

        if (accessGranted) {
            emit AccessGranted(
                logId,
                msg.sender,
                dataHash,
                block.timestamp
            );
        } else {
            emit AccessDenied(
                logId,
                msg.sender,
                dataHash,
                reason,
                block.timestamp
            );
        }

        return accessGranted;
    }

    /**
     * @dev Report anomaly detected by AI system
     * @param userAddress Address of the user involved
     * @param dataHash Hash of the data involved
     * @param anomalyType Type of anomaly detected
     * @param description Description of the anomaly
     */
    function reportAnomaly(
        address userAddress,
        string memory dataHash,
        string memory anomalyType,
        string memory description
    ) external onlyOwner {
        require(userAddress != address(0), "Invalid user address");
        require(bytes(anomalyType).length > 0, "Anomaly type cannot be empty");

        uint256 anomalyId = _anomalyIds.current();
        
        anomalies[anomalyId] = AnomalyAlert({
            userAddress: userAddress,
            dataHash: dataHash,
            anomalyType: anomalyType,
            timestamp: block.timestamp,
            description: description,
            isResolved: false
        });

        _anomalyIds.increment();

        emit AnomalyDetected(
            anomalyId,
            userAddress,
            dataHash,
            anomalyType,
            description,
            block.timestamp
        );
    }

    /**
     * @dev Resolve an anomaly
     * @param anomalyId ID of the anomaly to resolve
     */
    function resolveAnomaly(uint256 anomalyId) external onlyOwner {
        require(anomalyId > 0 && anomalyId < _anomalyIds.current(), "Invalid anomaly ID");
        require(!anomalies[anomalyId].isResolved, "Anomaly already resolved");
        
        anomalies[anomalyId].isResolved = true;
    }

    /**
     * @dev Authorize a third party
     * @param thirdPartyId Identifier for the third party
     */
    function authorizeThirdParty(string memory thirdPartyId) external onlyOwner {
        require(bytes(thirdPartyId).length > 0, "Third party ID cannot be empty");
        require(!authorizedThirdParties[thirdPartyId], "Third party already authorized");
        
        authorizedThirdParties[thirdPartyId] = true;
        
        emit ThirdPartyAuthorized(
            thirdPartyId,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @dev Revoke third party authorization
     * @param thirdPartyId Identifier for the third party
     */
    function revokeThirdParty(string memory thirdPartyId) external onlyOwner {
        require(authorizedThirdParties[thirdPartyId], "Third party not authorized");
        
        authorizedThirdParties[thirdPartyId] = false;
        
        emit ThirdPartyRevoked(
            thirdPartyId,
            msg.sender,
            block.timestamp
        );
    }

    // Register a file with its hash and owner
    function registerFile(bytes32 fileHash, address owner) public {
        require(fileOwners[fileHash] == address(0), "File already registered");
        require(owner != address(0), "Invalid owner address");
        fileOwners[fileHash] = owner;
        emit FileRegistered(fileHash, owner);
    }

    // Authorize a third party for a specific file
    function authorizeThirdPartyForFile(bytes32 fileHash, address thirdParty) public {
        require(fileOwners[fileHash] == msg.sender, "Only file owner can authorize");
        require(thirdParty != address(0), "Invalid third party address");
        fileAccess[fileHash][thirdParty] = true;
        emit ThirdPartyAuthorized(fileHash, thirdParty);
    }

    // Check if a user is authorized for a file
    function isAuthorizedForFile(bytes32 fileHash, address user) public view returns (bool) {
        return fileOwners[fileHash] == user || fileAccess[fileHash][user];
    }

    // View Functions

    /**
     * @dev Get consent details
     * @param consentId ID of the consent
     */
    function getConsent(uint256 consentId) external view returns (Consent memory) {
        require(consentId > 0 && consentId < _consentIds.current(), "Invalid consent ID");
        return consents[consentId];
    }

    /**
     * @dev Get user's consents
     * @param userAddress Address of the user
     */
    function getUserConsents(address userAddress) external view returns (uint256[] memory) {
        return userConsents[userAddress];
    }

    /**
     * @dev Get access log details
     * @param logId ID of the access log
     */
    function getAccessLog(uint256 logId) external view returns (AccessLog memory) {
        require(logId > 0 && logId < _accessLogIds.current(), "Invalid log ID");
        return accessLogs[logId];
    }

    /**
     * @dev Get third party access logs
     * @param thirdPartyId Identifier for the third party
     */
    function getThirdPartyAccessLogs(string memory thirdPartyId) external view returns (uint256[] memory) {
        return thirdPartyAccessLogs[thirdPartyId];
    }

    /**
     * @dev Get anomaly details
     * @param anomalyId ID of the anomaly
     */
    function getAnomaly(uint256 anomalyId) external view returns (AnomalyAlert memory) {
        require(anomalyId > 0 && anomalyId < _anomalyIds.current(), "Invalid anomaly ID");
        return anomalies[anomalyId];
    }

    /**
     * @dev Check if third party is authorized
     * @param thirdPartyId Identifier for the third party
     */
    function isThirdPartyAuthorized(string memory thirdPartyId) external view returns (bool) {
        return authorizedThirdParties[thirdPartyId];
    }

    /**
     * @dev Get contract statistics
     */
    function getContractStats() external view returns (
        uint256 totalConsents,
        uint256 totalAccessLogs,
        uint256 totalAnomalies
    ) {
        return (
            _consentIds.current() - 1,
            _accessLogIds.current() - 1,
            _anomalyIds.current() - 1
        );
    }
} 
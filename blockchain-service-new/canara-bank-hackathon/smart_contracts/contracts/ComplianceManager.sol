// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ComplianceManager
 * @dev Smart contract for managing compliance with data protection regulations
 * 
 * Features:
 * - GDPR compliance tracking
 * - DPDP (India) compliance
 * - Data residency requirements
 * - Automated compliance reporting
 * - Regulatory audit trails
 * - Consent lifecycle management
 */
contract ComplianceManager is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;

    // Structs
    struct ComplianceRecord {
        address userAddress;
        string regulation;
        string complianceType;
        uint256 timestamp;
        bool isCompliant;
        string details;
        string region;
        uint256 expiryTime;
    }

    struct DataResidency {
        string dataHash;
        string region;
        string jurisdiction;
        uint256 timestamp;
        bool isCompliant;
        string complianceDetails;
    }

    struct RegulatoryReport {
        string reportId;
        string regulation;
        string reportType;
        uint256 timestamp;
        string reportHash;
        bool isSubmitted;
        address submittedBy;
    }

    struct ConsentLifecycle {
        address userAddress;
        string dataHash;
        uint256 consentGrantedAt;
        uint256 consentRevokedAt;
        uint256 dataRetentionExpiry;
        bool isRetentionCompliant;
        string retentionPolicy;
    }

    // State Variables
    Counters.Counter private _complianceIds;
    Counters.Counter private _residencyIds;
    Counters.Counter private _reportIds;
    Counters.Counter private _lifecycleIds;

    // Mappings
    mapping(uint256 => ComplianceRecord) public complianceRecords;
    mapping(uint256 => DataResidency) public dataResidency;
    mapping(uint256 => RegulatoryReport) public regulatoryReports;
    mapping(uint256 => ConsentLifecycle) public consentLifecycles;
    
    // User compliance tracking
    mapping(address => uint256[]) public userComplianceRecords;
    mapping(address => mapping(string => bool)) public userRegulationCompliance;
    
    // Data residency tracking
    mapping(string => uint256) public hashToResidencyId;
    
    // Report tracking
    mapping(string => uint256) public reportIdToReport;
    mapping(string => uint256[]) public regulationReports;

    // Supported regulations
    mapping(string => bool) public supportedRegulations;
    
    // Data retention policies
    mapping(string => uint256) public retentionPolicies;

    // Events
    event ComplianceRecorded(
        uint256 indexed recordId,
        address indexed userAddress,
        string regulation,
        string complianceType,
        bool isCompliant,
        string region,
        uint256 timestamp
    );

    event DataResidencyRecorded(
        uint256 indexed residencyId,
        string dataHash,
        string region,
        string jurisdiction,
        bool isCompliant,
        uint256 timestamp
    );

    event RegulatoryReportGenerated(
        uint256 indexed reportId,
        string reportIdString,
        string regulation,
        string reportType,
        string reportHash,
        address indexed submittedBy,
        uint256 timestamp
    );

    event ConsentLifecycleRecorded(
        uint256 indexed lifecycleId,
        address indexed userAddress,
        string dataHash,
        uint256 consentGrantedAt,
        uint256 dataRetentionExpiry,
        string retentionPolicy,
        uint256 timestamp
    );

    event RetentionPolicyUpdated(
        string dataType,
        uint256 newRetentionPeriod,
        address indexed updatedBy,
        uint256 timestamp
    );

    event RegulationSupported(
        string regulation,
        bool isSupported,
        address indexed updatedBy,
        uint256 timestamp
    );

    // Modifiers
    modifier onlySupportedRegulation(string memory regulation) {
        require(supportedRegulations[regulation], "Regulation not supported");
        _;
    }

    modifier onlyValidComplianceRecord(uint256 recordId) {
        require(recordId > 0 && recordId <= _complianceIds.current(), "Invalid compliance record ID");
        _;
    }

    // Constructor
    constructor() {
        _complianceIds.increment();
        _residencyIds.increment();
        _reportIds.increment();
        _lifecycleIds.increment();
        
        // Initialize supported regulations
        supportedRegulations["GDPR"] = true;
        supportedRegulations["DPDP"] = true;
        supportedRegulations["CCPA"] = true;
        supportedRegulations["LGPD"] = true;
        
        // Initialize retention policies (in seconds)
        retentionPolicies["personal_data"] = 365 days;
        retentionPolicies["financial_data"] = 7 * 365 days;
        retentionPolicies["transaction_data"] = 5 * 365 days;
        retentionPolicies["consent_data"] = 10 * 365 days;
    }

    /**
     * @dev Record compliance for a user
     * @param userAddress Address of the user
     * @param regulation Regulation being complied with
     * @param complianceType Type of compliance
     * @param isCompliant Whether the user is compliant
     * @param details Details of compliance
     * @param region Geographic region
     * @param durationInSeconds How long this compliance record is valid
     */
    function recordCompliance(
        address userAddress,
        string memory regulation,
        string memory complianceType,
        bool isCompliant,
        string memory details,
        string memory region,
        uint256 durationInSeconds
    ) external onlyOwner onlySupportedRegulation(regulation) nonReentrant {
        require(userAddress != address(0), "Invalid user address");
        require(bytes(complianceType).length > 0, "Compliance type cannot be empty");
        require(durationInSeconds > 0, "Duration must be positive");

        uint256 recordId = _complianceIds.current();
        
        complianceRecords[recordId] = ComplianceRecord({
            userAddress: userAddress,
            regulation: regulation,
            complianceType: complianceType,
            timestamp: block.timestamp,
            isCompliant: isCompliant,
            details: details,
            region: region,
            expiryTime: block.timestamp + durationInSeconds
        });

        userComplianceRecords[userAddress].push(recordId);
        userRegulationCompliance[userAddress][regulation] = isCompliant;

        _complianceIds.increment();

        emit ComplianceRecorded(
            recordId,
            userAddress,
            regulation,
            complianceType,
            isCompliant,
            region,
            block.timestamp
        );
    }

    /**
     * @dev Record data residency information
     * @param dataHash Hash of the data
     * @param region Geographic region where data is stored
     * @param jurisdiction Legal jurisdiction
     * @param isCompliant Whether residency requirements are met
     * @param complianceDetails Details of compliance
     */
    function recordDataResidency(
        string memory dataHash,
        string memory region,
        string memory jurisdiction,
        bool isCompliant,
        string memory complianceDetails
    ) external onlyOwner nonReentrant {
        require(bytes(dataHash).length > 0, "Data hash cannot be empty");
        require(bytes(region).length > 0, "Region cannot be empty");

        uint256 residencyId = _residencyIds.current();
        
        dataResidency[residencyId] = DataResidency({
            dataHash: dataHash,
            region: region,
            jurisdiction: jurisdiction,
            timestamp: block.timestamp,
            isCompliant: isCompliant,
            complianceDetails: complianceDetails
        });

        hashToResidencyId[dataHash] = residencyId;
        _residencyIds.increment();

        emit DataResidencyRecorded(
            residencyId,
            dataHash,
            region,
            jurisdiction,
            isCompliant,
            block.timestamp
        );
    }

    /**
     * @dev Generate regulatory report
     * @param reportId Unique identifier for the report
     * @param regulation Regulation the report is for
     * @param reportType Type of report
     * @param reportHash Hash of the report content
     */
    function generateRegulatoryReport(
        string memory reportId,
        string memory regulation,
        string memory reportType,
        string memory reportHash
    ) external onlyOwner onlySupportedRegulation(regulation) nonReentrant {
        require(bytes(reportId).length > 0, "Report ID cannot be empty");
        require(bytes(reportType).length > 0, "Report type cannot be empty");
        require(bytes(reportHash).length > 0, "Report hash cannot be empty");
        require(reportIdToReport[reportId] == 0, "Report ID already exists");

        uint256 reportIndex = _reportIds.current();
        
        regulatoryReports[reportIndex] = RegulatoryReport({
            reportId: reportId,
            regulation: regulation,
            reportType: reportType,
            timestamp: block.timestamp,
            reportHash: reportHash,
            isSubmitted: true,
            submittedBy: msg.sender
        });

        reportIdToReport[reportId] = reportIndex;
        regulationReports[regulation].push(reportIndex);
        _reportIds.increment();

        emit RegulatoryReportGenerated(
            reportIndex,
            reportId,
            regulation,
            reportType,
            reportHash,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @dev Record consent lifecycle
     * @param userAddress Address of the user
     * @param dataHash Hash of the data
     * @param consentGrantedAt When consent was granted
     * @param dataType Type of data for retention policy
     */
    function recordConsentLifecycle(
        address userAddress,
        string memory dataHash,
        uint256 consentGrantedAt,
        string memory dataType
    ) external onlyOwner nonReentrant {
        require(userAddress != address(0), "Invalid user address");
        require(bytes(dataHash).length > 0, "Data hash cannot be empty");
        require(consentGrantedAt > 0, "Invalid consent timestamp");

        uint256 lifecycleId = _lifecycleIds.current();
        uint256 retentionPeriod = retentionPolicies[dataType];
        require(retentionPeriod > 0, "No retention policy for data type");
        
        consentLifecycles[lifecycleId] = ConsentLifecycle({
            userAddress: userAddress,
            dataHash: dataHash,
            consentGrantedAt: consentGrantedAt,
            consentRevokedAt: 0,
            dataRetentionExpiry: consentGrantedAt + retentionPeriod,
            isRetentionCompliant: true,
            retentionPolicy: dataType
        });

        _lifecycleIds.increment();

        emit ConsentLifecycleRecorded(
            lifecycleId,
            userAddress,
            dataHash,
            consentGrantedAt,
            consentGrantedAt + retentionPeriod,
            dataType,
            block.timestamp
        );
    }

    /**
     * @dev Update retention policy
     * @param dataType Type of data
     * @param retentionPeriodInSeconds New retention period
     */
    function updateRetentionPolicy(
        string memory dataType,
        uint256 retentionPeriodInSeconds
    ) external onlyOwner {
        require(bytes(dataType).length > 0, "Data type cannot be empty");
        require(retentionPeriodInSeconds > 0, "Retention period must be positive");
        
        retentionPolicies[dataType] = retentionPeriodInSeconds;
        
        emit RetentionPolicyUpdated(
            dataType,
            retentionPeriodInSeconds,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @dev Add or remove supported regulation
     * @param regulation Regulation name
     * @param isSupported Whether to support this regulation
     */
    function setRegulationSupport(
        string memory regulation,
        bool isSupported
    ) external onlyOwner {
        require(bytes(regulation).length > 0, "Regulation cannot be empty");
        
        supportedRegulations[regulation] = isSupported;
        
        emit RegulationSupported(
            regulation,
            isSupported,
            msg.sender,
            block.timestamp
        );
    }

    // View Functions

    /**
     * @dev Get compliance record
     * @param recordId ID of the compliance record
     */
    function getComplianceRecord(uint256 recordId) external view onlyValidComplianceRecord(recordId) returns (ComplianceRecord memory) {
        return complianceRecords[recordId];
    }

    /**
     * @dev Get user's compliance records
     * @param userAddress Address of the user
     */
    function getUserComplianceRecords(address userAddress) external view returns (uint256[] memory) {
        return userComplianceRecords[userAddress];
    }

    /**
     * @dev Check if user is compliant with a regulation
     * @param userAddress Address of the user
     * @param regulation Regulation to check
     */
    function isUserCompliant(address userAddress, string memory regulation) external view returns (bool) {
        return userRegulationCompliance[userAddress][regulation];
    }

    /**
     * @dev Get data residency information
     * @param dataHash Hash of the data
     */
    function getDataResidency(string memory dataHash) external view returns (DataResidency memory) {
        uint256 residencyId = hashToResidencyId[dataHash];
        require(residencyId > 0, "No residency record found");
        return dataResidency[residencyId];
    }

    /**
     * @dev Get regulatory report
     * @param reportId Report ID
     */
    function getRegulatoryReport(string memory reportId) external view returns (RegulatoryReport memory) {
        uint256 reportIndex = reportIdToReport[reportId];
        require(reportIndex > 0, "Report not found");
        return regulatoryReports[reportIndex];
    }

    /**
     * @dev Get reports for a regulation
     * @param regulation Regulation name
     */
    function getRegulationReports(string memory regulation) external view returns (uint256[] memory) {
        return regulationReports[regulation];
    }

    /**
     * @dev Get consent lifecycle
     * @param lifecycleId ID of the lifecycle record
     */
    function getConsentLifecycle(uint256 lifecycleId) external view returns (ConsentLifecycle memory) {
        require(lifecycleId > 0 && lifecycleId < _lifecycleIds.current(), "Invalid lifecycle ID");
        return consentLifecycles[lifecycleId];
    }

    /**
     * @dev Get retention policy for data type
     * @param dataType Type of data
     */
    function getRetentionPolicy(string memory dataType) external view returns (uint256) {
        return retentionPolicies[dataType];
    }

    /**
     * @dev Check if regulation is supported
     * @param regulation Regulation name
     */
    function isRegulationSupported(string memory regulation) external view returns (bool) {
        return supportedRegulations[regulation];
    }

    /**
     * @dev Get contract statistics
     */
    function getContractStats() external view returns (
        uint256 totalComplianceRecords,
        uint256 totalResidencyRecords,
        uint256 totalReports,
        uint256 totalLifecycles
    ) {
        return (
            _complianceIds.current() - 1,
            _residencyIds.current() - 1,
            _reportIds.current() - 1,
            _lifecycleIds.current() - 1
        );
    }
} 
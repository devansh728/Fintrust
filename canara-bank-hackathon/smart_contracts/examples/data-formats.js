const { ethers } = require("hardhat");

/**
 * Data Format Examples for AI-Driven Privacy Framework
 * This shows exactly how data flows in and out of your smart contracts
 */

async function demonstrateDataFormats() {
  console.log("📊 DATA FORMATS FOR PRIVACY FRAMEWORK");
  console.log("=====================================\n");

  // Get signers
  const [owner, user1, user2, thirdParty] = await ethers.getSigners();
  
  // Deploy contracts
  const PrivacyFramework = await ethers.getContractFactory("PrivacyFramework");
  const privacyFramework = await PrivacyFramework.deploy();
  await privacyFramework.waitForDeployment();

  const DataTokenization = await ethers.getContractFactory("DataTokenization");
  const dataTokenization = await DataTokenization.deploy();
  await dataTokenization.waitForDeployment();

  const ComplianceManager = await ethers.getContractFactory("ComplianceManager");
  const complianceManager = await ComplianceManager.deploy();
  await complianceManager.waitForDeployment();

  console.log("🏗️ CONTRACTS DEPLOYED");
  console.log("PrivacyFramework:", await privacyFramework.getAddress());
  console.log("DataTokenization:", await dataTokenization.getAddress());
  console.log("ComplianceManager:", await complianceManager.getAddress());
  console.log("");

  // ============================================================================
  // 1. THIRD PARTY AUTHORIZATION
  // ============================================================================
  console.log("🔐 1. THIRD PARTY AUTHORIZATION");
  console.log("--------------------------------");

  // INPUT FORMAT
  const thirdPartyId = "loan_provider_001";
  console.log("📥 INPUT:");
  console.log("  thirdPartyId:", JSON.stringify(thirdPartyId));
  console.log("  Type: string");
  console.log("");

  // FUNCTION CALL
  await privacyFramework.authorizeThirdParty(thirdPartyId);

  // OUTPUT FORMAT
  const isAuthorized = await privacyFramework.isThirdPartyAuthorized(thirdPartyId);
  console.log("📤 OUTPUT:");
  console.log("  isAuthorized:", isAuthorized);
  console.log("  Type: boolean");
  console.log("");

  // ============================================================================
  // 2. CONSENT MANAGEMENT
  // ============================================================================
  console.log("✅ 2. CONSENT MANAGEMENT");
  console.log("------------------------");

  // INPUT FORMAT
  const consentData = {
    dataHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    useCase: "loan_approval",
    thirdPartyId: "loan_provider_001",
    dataType: "financial_data",
    durationInSeconds: 30 * 24 * 60 * 60 // 30 days
  };
  console.log("📥 INPUT:");
  console.log("  dataHash:", JSON.stringify(consentData.dataHash));
  console.log("  useCase:", JSON.stringify(consentData.useCase));
  console.log("  thirdPartyId:", JSON.stringify(consentData.thirdPartyId));
  console.log("  dataType:", JSON.stringify(consentData.dataType));
  console.log("  durationInSeconds:", consentData.durationInSeconds);
  console.log("  Types: string, string, string, string, uint256");
  console.log("");

  // FUNCTION CALL
  await privacyFramework.connect(user1).grantConsent(
    consentData.dataHash,
    consentData.useCase,
    consentData.thirdPartyId,
    consentData.dataType,
    consentData.durationInSeconds
  );

  // OUTPUT FORMAT - Get Consent Details
  const consentId = 1;
  const consent = await privacyFramework.getConsent(consentId);
  console.log("📤 OUTPUT (Consent Object):");
  console.log("  consent.userAddress:", consent.userAddress);
  console.log("  consent.dataHash:", consent.dataHash);
  console.log("  consent.useCase:", consent.useCase);
  console.log("  consent.timestamp:", consent.timestamp.toString());
  console.log("  consent.isActive:", consent.isActive);
  console.log("  consent.expiryTime:", consent.expiryTime.toString());
  console.log("  consent.thirdPartyId:", consent.thirdPartyId);
  console.log("  consent.dataType:", consent.dataType);
  console.log("  consent.isRevoked:", consent.isRevoked);
  console.log("  Types: address, string, string, uint256, bool, uint256, string, string, bool");
  console.log("");

  // ============================================================================
  // 3. ACCESS CONTROL
  // ============================================================================
  console.log("🔓 3. ACCESS CONTROL");
  console.log("-------------------");

  // INPUT FORMAT
  const accessRequest = {
    dataHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    purpose: "loan_approval",
    thirdPartyId: "loan_provider_001",
    ipAddress: "192.168.1.100",
    deviceFingerprint: "device_xyz_123"
  };
  console.log("📥 INPUT:");
  console.log("  dataHash:", JSON.stringify(accessRequest.dataHash));
  console.log("  purpose:", JSON.stringify(accessRequest.purpose));
  console.log("  thirdPartyId:", JSON.stringify(accessRequest.thirdPartyId));
  console.log("  ipAddress:", JSON.stringify(accessRequest.ipAddress));
  console.log("  deviceFingerprint:", JSON.stringify(accessRequest.deviceFingerprint));
  console.log("  Types: string, string, string, string, string");
  console.log("");

  // FUNCTION CALL
  const accessTx = await privacyFramework.connect(user1).requestAccess(
    accessRequest.dataHash,
    accessRequest.purpose,
    accessRequest.thirdPartyId,
    accessRequest.ipAddress,
    accessRequest.deviceFingerprint
  );

  // OUTPUT FORMAT - Get Access Log
  const accessLogId = 1;
  const accessLog = await privacyFramework.getAccessLog(accessLogId);
  console.log("📤 OUTPUT (Access Log Object):");
  console.log("  accessLog.requester:", accessLog.requester);
  console.log("  accessLog.dataHash:", accessLog.dataHash);
  console.log("  accessLog.purpose:", accessLog.purpose);
  console.log("  accessLog.timestamp:", accessLog.timestamp.toString());
  console.log("  accessLog.wasGranted:", accessLog.wasGranted);
  console.log("  accessLog.reason:", accessLog.reason);
  console.log("  accessLog.ipAddress:", accessLog.ipAddress);
  console.log("  accessLog.deviceFingerprint:", accessLog.deviceFingerprint);
  console.log("  Types: address, string, string, uint256, bool, string, string, string");
  console.log("");

  // ============================================================================
  // 4. ANOMALY DETECTION
  // ============================================================================
  console.log("🚨 4. ANOMALY DETECTION");
  console.log("----------------------");

  // INPUT FORMAT
  const anomalyData = {
    userAddress: user1.address,
    dataHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    anomalyType: "suspicious_access",
    description: "Multiple access attempts from different IP addresses"
  };
  console.log("📥 INPUT:");
  console.log("  userAddress:", anomalyData.userAddress);
  console.log("  dataHash:", JSON.stringify(anomalyData.dataHash));
  console.log("  anomalyType:", JSON.stringify(anomalyData.anomalyType));
  console.log("  description:", JSON.stringify(anomalyData.description));
  console.log("  Types: address, string, string, string");
  console.log("");

  // FUNCTION CALL
  await privacyFramework.reportAnomaly(
    anomalyData.userAddress,
    anomalyData.dataHash,
    anomalyData.anomalyType,
    anomalyData.description
  );

  // OUTPUT FORMAT - Get Anomaly Details
  const anomalyId = 1;
  const anomaly = await privacyFramework.getAnomaly(anomalyId);
  console.log("📤 OUTPUT (Anomaly Object):");
  console.log("  anomaly.userAddress:", anomaly.userAddress);
  console.log("  anomaly.dataHash:", anomaly.dataHash);
  console.log("  anomaly.anomalyType:", anomaly.anomalyType);
  console.log("  anomaly.timestamp:", anomaly.timestamp.toString());
  console.log("  anomaly.description:", anomaly.description);
  console.log("  anomaly.isResolved:", anomaly.isResolved);
  console.log("  Types: address, string, string, uint256, string, bool");
  console.log("");

  // ============================================================================
  // 5. DATA TOKENIZATION
  // ============================================================================
  console.log("🪙 5. DATA TOKENIZATION");
  console.log("----------------------");

  // INPUT FORMAT
  const tokenizationData = {
    originalDataHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    token: "0xtoken1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    encryptionKeyHash: "0xkey1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    dataType: "financial_data",
    durationInSeconds: 30 * 24 * 60 * 60 // 30 days
  };
  console.log("📥 INPUT:");
  console.log("  originalDataHash:", JSON.stringify(tokenizationData.originalDataHash));
  console.log("  token:", JSON.stringify(tokenizationData.token));
  console.log("  encryptionKeyHash:", JSON.stringify(tokenizationData.encryptionKeyHash));
  console.log("  dataType:", JSON.stringify(tokenizationData.dataType));
  console.log("  durationInSeconds:", tokenizationData.durationInSeconds);
  console.log("  Types: string, string, string, string, uint256");
  console.log("");

  // FUNCTION CALL
  await dataTokenization.connect(user1).tokenizeData(
    tokenizationData.originalDataHash,
    tokenizationData.token,
    tokenizationData.encryptionKeyHash,
    tokenizationData.dataType,
    tokenizationData.durationInSeconds
  );

  // OUTPUT FORMAT - Validate Token
  const [isValid, tokenId] = await dataTokenization.validateToken(tokenizationData.token);
  console.log("📤 OUTPUT (Token Validation):");
  console.log("  isValid:", isValid);
  console.log("  tokenId:", tokenId.toString());
  console.log("  Types: bool, uint256");
  console.log("");

  // OUTPUT FORMAT - Get Tokenized Data
  const tokenizedData = await dataTokenization.getTokenizedDataByToken(tokenizationData.token);
  console.log("📤 OUTPUT (Tokenized Data Object):");
  console.log("  tokenizedData.originalDataHash:", tokenizedData.originalDataHash);
  console.log("  tokenizedData.token:", tokenizedData.token);
  console.log("  tokenizedData.encryptionKeyHash:", tokenizedData.encryptionKeyHash);
  console.log("  tokenizedData.timestamp:", tokenizedData.timestamp.toString());
  console.log("  tokenizedData.owner:", tokenizedData.owner);
  console.log("  tokenizedData.isActive:", tokenizedData.isActive);
  console.log("  tokenizedData.dataType:", tokenizedData.dataType);
  console.log("  tokenizedData.expiryTime:", tokenizedData.expiryTime.toString());
  console.log("  Types: string, string, string, uint256, address, bool, string, uint256");
  console.log("");

  // ============================================================================
  // 6. COMPLIANCE MANAGEMENT
  // ============================================================================
  console.log("📋 6. COMPLIANCE MANAGEMENT");
  console.log("--------------------------");

  // INPUT FORMAT
  const complianceData = {
    userAddress: user1.address,
    regulation: "GDPR",
    complianceType: "consent_management",
    isCompliant: true,
    details: "User has granted explicit consent for data processing",
    region: "EU",
    durationInSeconds: 365 * 24 * 60 * 60 // 1 year
  };
  console.log("📥 INPUT:");
  console.log("  userAddress:", complianceData.userAddress);
  console.log("  regulation:", JSON.stringify(complianceData.regulation));
  console.log("  complianceType:", JSON.stringify(complianceData.complianceType));
  console.log("  isCompliant:", complianceData.isCompliant);
  console.log("  details:", JSON.stringify(complianceData.details));
  console.log("  region:", JSON.stringify(complianceData.region));
  console.log("  durationInSeconds:", complianceData.durationInSeconds);
  console.log("  Types: address, string, string, bool, string, string, uint256");
  console.log("");

  // FUNCTION CALL
  await complianceManager.recordCompliance(
    complianceData.userAddress,
    complianceData.regulation,
    complianceData.complianceType,
    complianceData.isCompliant,
    complianceData.details,
    complianceData.region,
    complianceData.durationInSeconds
  );

  // OUTPUT FORMAT - Get Compliance Record
  const complianceRecordId = 1;
  const complianceRecord = await complianceManager.getComplianceRecord(complianceRecordId);
  console.log("📤 OUTPUT (Compliance Record Object):");
  console.log("  complianceRecord.userAddress:", complianceRecord.userAddress);
  console.log("  complianceRecord.regulation:", complianceRecord.regulation);
  console.log("  complianceRecord.complianceType:", complianceRecord.complianceType);
  console.log("  complianceRecord.timestamp:", complianceRecord.timestamp.toString());
  console.log("  complianceRecord.isCompliant:", complianceRecord.isCompliant);
  console.log("  complianceRecord.details:", complianceRecord.details);
  console.log("  complianceRecord.region:", complianceRecord.region);
  console.log("  complianceRecord.expiryTime:", complianceRecord.expiryTime.toString());
  console.log("  Types: address, string, string, uint256, bool, string, string, uint256");
  console.log("");

  // ============================================================================
  // 7. STATISTICS AND QUERIES
  // ============================================================================
  console.log("📊 7. STATISTICS AND QUERIES");
  console.log("----------------------------");

  // Get Contract Statistics
  const privacyStats = await privacyFramework.getContractStats();
  console.log("📤 Privacy Framework Stats:");
  console.log("  totalConsents:", privacyStats.totalConsents.toString());
  console.log("  totalAccessLogs:", privacyStats.totalAccessLogs.toString());
  console.log("  totalAnomalies:", privacyStats.totalAnomalies.toString());
  console.log("  Types: uint256, uint256, uint256");
  console.log("");

  const tokenizationStats = await dataTokenization.getContractStats();
  console.log("📤 Data Tokenization Stats:");
  console.log("  totalTokens:", tokenizationStats.totalTokens.toString());
  console.log("  totalKeys:", tokenizationStats.totalKeys.toString());
  console.log("  Types: uint256, uint256");
  console.log("");

  const complianceStats = await complianceManager.getContractStats();
  console.log("📤 Compliance Manager Stats:");
  console.log("  totalComplianceRecords:", complianceStats.totalComplianceRecords.toString());
  console.log("  totalResidencyRecords:", complianceStats.totalResidencyRecords.toString());
  console.log("  totalReports:", complianceStats.totalReports.toString());
  console.log("  Types: uint256, uint256, uint256");
  console.log("");

  // Get User Consents (Array)
  const userConsents = await privacyFramework.getUserConsents(user1.address);
  console.log("📤 User Consents Array:");
  console.log("  userConsents:", userConsents.map(id => id.toString()));
  console.log("  Type: uint256[]");
  console.log("");

  // Get Third Party Access Logs (Array)
  const thirdPartyLogs = await privacyFramework.getThirdPartyAccessLogs("loan_provider_001");
  console.log("📤 Third Party Access Logs Array:");
  console.log("  thirdPartyLogs:", thirdPartyLogs.map(id => id.toString()));
  console.log("  Type: uint256[]");
  console.log("");

  // ============================================================================
  // 8. EVENT DATA FORMATS
  // ============================================================================
  console.log("📡 8. EVENT DATA FORMATS");
  console.log("-----------------------");

  console.log("📤 ConsentGranted Event:");
  console.log("  event.consentId: uint256");
  console.log("  event.userAddress: address");
  console.log("  event.dataHash: string");
  console.log("  event.useCase: string");
  console.log("  event.timestamp: uint256");
  console.log("  event.expiryTime: uint256");
  console.log("");

  console.log("📤 AccessRequested Event:");
  console.log("  event.logId: uint256");
  console.log("  event.requester: address");
  console.log("  event.dataHash: string");
  console.log("  event.purpose: string");
  console.log("  event.timestamp: uint256");
  console.log("");

  console.log("📤 AnomalyDetected Event:");
  console.log("  event.anomalyId: uint256");
  console.log("  event.userAddress: address");
  console.log("  event.dataHash: string");
  console.log("  event.anomalyType: string");
  console.log("  event.description: string");
  console.log("  event.timestamp: uint256");
  console.log("");

  console.log("🎉 DATA FORMAT DEMONSTRATION COMPLETE!");
  console.log("All functions are working with proper input/output formats.");
}

// Run the demonstration
demonstrateDataFormats()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  }); 
const { ethers } = require("hardhat");

/**
 * Example integration script showing how to interact with the Privacy Framework contracts
 * This demonstrates the complete flow from consent to data access
 */
async function main() {
  console.log("🔗 Privacy Framework Integration Example");
  console.log("========================================");

  // Get signers
  const [owner, user, thirdParty] = await ethers.getSigners();
  
  console.log("👤 Owner:", owner.address);
  console.log("👤 User:", user.address);
  console.log("🏢 Third Party:", thirdParty.address);

  // Deploy contracts
  console.log("\n📋 Deploying contracts...");
  
  const PrivacyFramework = await ethers.getContractFactory("PrivacyFramework");
  const privacyFramework = await PrivacyFramework.deploy();
  await privacyFramework.deployed();
  console.log("✅ PrivacyFramework deployed to:", privacyFramework.address);

  const DataTokenization = await ethers.getContractFactory("DataTokenization");
  const dataTokenization = await DataTokenization.deploy();
  await dataTokenization.deployed();
  console.log("✅ DataTokenization deployed to:", dataTokenization.address);

  const ComplianceManager = await ethers.getContractFactory("ComplianceManager");
  const complianceManager = await ComplianceManager.deploy();
  await complianceManager.deployed();
  console.log("✅ ComplianceManager deployed to:", complianceManager.address);

  // Initialize system
  console.log("\n🔧 Initializing system...");
  
  // Authorize third party
  await privacyFramework.authorizeThirdParty("loan_provider_001");
  console.log("✅ Third party 'loan_provider_001' authorized");

  // Create encryption key
  await dataTokenization.createEncryptionKey(
    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "AES-256-GCM"
  );
  console.log("✅ Encryption key created");

  // Record compliance
  await complianceManager.recordCompliance(
    user.address,
    "GDPR",
    "consent_management",
    true,
    "User has granted explicit consent",
    "EU",
    365 * 24 * 60 * 60 // 1 year
  );
  console.log("✅ GDPR compliance recorded");

  // Simulate user granting consent
  console.log("\n👤 User granting consent...");
  const dataHash = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
  const useCase = "loan_approval";
  const thirdPartyId = "loan_provider_001";
  const dataType = "financial_data";
  const duration = 30 * 24 * 60 * 60; // 30 days

  await privacyFramework.connect(user).grantConsent(
    dataHash,
    useCase,
    thirdPartyId,
    dataType,
    duration
  );
  console.log("✅ Consent granted for loan approval");

  // Tokenize the data
  console.log("\n🔐 Tokenizing data...");
  const token = "0xtoken1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
  const encryptionKeyHash = "0xkey1234567890abcdef1234567890abcdef1234567890abcdef1234567890";

  await dataTokenization.connect(user).tokenizeData(
    dataHash,
    token,
    encryptionKeyHash,
    dataType,
    duration
  );
  console.log("✅ Data tokenized");

  // Simulate third party requesting access
  console.log("\n🏢 Third party requesting access...");
  const accessResult = await privacyFramework.connect(user).requestAccess(
    dataHash,
    "loan_approval",
    thirdPartyId,
    "192.168.1.100",
    "device_fingerprint_xyz"
  );
  
  if (accessResult) {
    console.log("✅ Access granted to third party");
  } else {
    console.log("❌ Access denied to third party");
  }

  // Validate token
  console.log("\n🔍 Validating token...");
  const [isValid, tokenId] = await dataTokenization.validateToken(token);
  console.log("Token valid:", isValid);
  console.log("Token ID:", tokenId.toString());

  // Record data residency
  console.log("\n🌍 Recording data residency...");
  await complianceManager.recordDataResidency(
    dataHash,
    "EU",
    "GDPR",
    true,
    "Data stored in EU-compliant data center"
  );
  console.log("✅ Data residency recorded");

  // Generate compliance report
  console.log("\n📊 Generating compliance report...");
  await complianceManager.generateRegulatoryReport(
    "GDPR_Q1_2024",
    "GDPR",
    "Quarterly Compliance Report",
    "0xreport1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
  );
  console.log("✅ Compliance report generated");

  // Get user's consents
  console.log("\n📋 Getting user consents...");
  const userConsents = await privacyFramework.getUserConsents(user.address);
  console.log("User has", userConsents.length, "consents");

  // Get contract statistics
  console.log("\n📈 Contract Statistics:");
  const privacyStats = await privacyFramework.getContractStats();
  const tokenizationStats = await dataTokenization.getContractStats();
  const complianceStats = await complianceManager.getContractStats();

  console.log("Privacy Framework:");
  console.log("  - Total Consents:", privacyStats.totalConsents.toString());
  console.log("  - Total Access Logs:", privacyStats.totalAccessLogs.toString());
  console.log("  - Total Anomalies:", privacyStats.totalAnomalies.toString());

  console.log("Data Tokenization:");
  console.log("  - Total Tokens:", tokenizationStats.totalTokens.toString());
  console.log("  - Total Keys:", tokenizationStats.totalKeys.toString());

  console.log("Compliance Manager:");
  console.log("  - Total Compliance Records:", complianceStats.totalComplianceRecords.toString());
  console.log("  - Total Residency Records:", complianceStats.totalResidencyRecords.toString());
  console.log("  - Total Reports:", complianceStats.totalReports.toString());

  console.log("\n🎉 Integration example completed successfully!");
  console.log("\n📋 Contract Addresses:");
  console.log("PrivacyFramework:", privacyFramework.address);
  console.log("DataTokenization:", dataTokenization.address);
  console.log("ComplianceManager:", complianceManager.address);
}

// Example of how to interact with contracts from a frontend
async function frontendExample() {
  console.log("\n🌐 Frontend Integration Example");
  console.log("===============================");

  // This would typically be in a frontend application
  const exampleCode = `
// Frontend integration example
import { ethers } from 'ethers';

// Connect to wallet
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

// Contract addresses (from deployment)
const PRIVACY_FRAMEWORK_ADDRESS = "0x...";
const DATA_TOKENIZATION_ADDRESS = "0x...";
const COMPLIANCE_MANAGER_ADDRESS = "0x...";

// Contract ABIs (from compilation)
const PRIVACY_FRAMEWORK_ABI = [...];
const DATA_TOKENIZATION_ABI = [...];
const COMPLIANCE_MANAGER_ABI = [...];

// Initialize contracts
const privacyFramework = new ethers.Contract(
  PRIVACY_FRAMEWORK_ADDRESS,
  PRIVACY_FRAMEWORK_ABI,
  signer
);

const dataTokenization = new ethers.Contract(
  DATA_TOKENIZATION_ADDRESS,
  DATA_TOKENIZATION_ABI,
  signer
);

// Example: User grants consent
async function grantConsent() {
  try {
    const dataHash = "0x..."; // Hash of user's data
    const useCase = "loan_approval";
    const thirdPartyId = "loan_provider_001";
    const dataType = "financial_data";
    const duration = 30 * 24 * 60 * 60; // 30 days

    const tx = await privacyFramework.grantConsent(
      dataHash,
      useCase,
      thirdPartyId,
      dataType,
      duration
    );

    await tx.wait();
    console.log("Consent granted successfully!");
  } catch (error) {
    console.error("Error granting consent:", error);
  }
}

// Example: Third party requests access
async function requestAccess() {
  try {
    const dataHash = "0x...";
    const purpose = "loan_approval";
    const thirdPartyId = "loan_provider_001";
    const ipAddress = "192.168.1.100";
    const deviceFingerprint = "device_xyz";

    const accessGranted = await privacyFramework.requestAccess(
      dataHash,
      purpose,
      thirdPartyId,
      ipAddress,
      deviceFingerprint
    );

    if (accessGranted) {
      console.log("Access granted!");
    } else {
      console.log("Access denied!");
    }
  } catch (error) {
    console.error("Error requesting access:", error);
  }
}

// Example: Validate token
async function validateToken(token) {
  try {
    const [isValid, tokenId] = await dataTokenization.validateToken(token);
    console.log("Token valid:", isValid);
    console.log("Token ID:", tokenId.toString());
    return isValid;
  } catch (error) {
    console.error("Error validating token:", error);
    return false;
  }
}
  `;

  console.log(exampleCode);
}

// Example of how to monitor events
async function eventMonitoringExample() {
  console.log("\n📡 Event Monitoring Example");
  console.log("============================");

  const monitoringCode = `
// Event monitoring example
const provider = new ethers.providers.Web3Provider(window.ethereum);
const privacyFramework = new ethers.Contract(
  PRIVACY_FRAMEWORK_ADDRESS,
  PRIVACY_FRAMEWORK_ABI,
  provider
);

// Listen for consent events
privacyFramework.on("ConsentGranted", (consentId, userAddress, dataHash, useCase, timestamp, event) => {
  console.log("New consent granted:");
  console.log("  Consent ID:", consentId.toString());
  console.log("  User:", userAddress);
  console.log("  Data Hash:", dataHash);
  console.log("  Use Case:", useCase);
  console.log("  Timestamp:", new Date(timestamp * 1000).toISOString());
});

// Listen for access events
privacyFramework.on("AccessRequested", (logId, requester, dataHash, purpose, timestamp, event) => {
  console.log("Access requested:");
  console.log("  Log ID:", logId.toString());
  console.log("  Requester:", requester);
  console.log("  Data Hash:", dataHash);
  console.log("  Purpose:", purpose);
  console.log("  Timestamp:", new Date(timestamp * 1000).toISOString());
});

// Listen for anomaly events
privacyFramework.on("AnomalyDetected", (anomalyId, userAddress, dataHash, anomalyType, description, timestamp, event) => {
  console.log("Anomaly detected:");
  console.log("  Anomaly ID:", anomalyId.toString());
  console.log("  User:", userAddress);
  console.log("  Data Hash:", dataHash);
  console.log("  Type:", anomalyType);
  console.log("  Description:", description);
  console.log("  Timestamp:", new Date(timestamp * 1000).toISOString());
  
  // Send alert to admin
  sendAlertToAdmin(anomalyId, userAddress, anomalyType, description);
});

// Listen for compliance events
complianceManager.on("ComplianceRecorded", (recordId, userAddress, regulation, complianceType, isCompliant, region, timestamp, event) => {
  console.log("Compliance recorded:");
  console.log("  Record ID:", recordId.toString());
  console.log("  User:", userAddress);
  console.log("  Regulation:", regulation);
  console.log("  Type:", complianceType);
  console.log("  Compliant:", isCompliant);
  console.log("  Region:", region);
  console.log("  Timestamp:", new Date(timestamp * 1000).toISOString());
});
  `;

  console.log(monitoringCode);
}

main()
  .then(() => {
    frontendExample();
    eventMonitoringExample();
  })
  .catch((error) => {
    console.error("❌ Integration example failed:", error);
    process.exit(1);
  }); 
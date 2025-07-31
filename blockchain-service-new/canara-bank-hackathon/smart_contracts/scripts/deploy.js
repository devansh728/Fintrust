const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment of AI-Driven Privacy Framework...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy PrivacyFramework contract
  console.log("\n📋 Deploying PrivacyFramework...");
  const PrivacyFramework = await ethers.getContractFactory("PrivacyFramework");
  const privacyFramework = await PrivacyFramework.deploy();
  await privacyFramework.waitForDeployment();
  const privacyFrameworkAddress = await privacyFramework.getAddress();
  console.log("✅ PrivacyFramework deployed to:", privacyFrameworkAddress);

  // Deploy DataTokenization contract
  console.log("\n🔐 Deploying DataTokenization...");
  const DataTokenization = await ethers.getContractFactory("DataTokenization");
  const dataTokenization = await DataTokenization.deploy();
  await dataTokenization.waitForDeployment();
  const dataTokenizationAddress = await dataTokenization.getAddress();
  console.log("✅ DataTokenization deployed to:", dataTokenizationAddress);

  // Deploy ComplianceManager contract
  console.log("\n📊 Deploying ComplianceManager...");
  const ComplianceManager = await ethers.getContractFactory("ComplianceManager");
  const complianceManager = await ComplianceManager.deploy();
  await complianceManager.waitForDeployment();
  const complianceManagerAddress = await complianceManager.getAddress();
  console.log("✅ ComplianceManager deployed to:", complianceManagerAddress);

  // Initialize the system
  console.log("\n🔧 Initializing system...");

  // Authorize some third parties in PrivacyFramework
  await privacyFramework.authorizeThirdParty("loan_provider_001");
  await privacyFramework.authorizeThirdParty("insurance_company_002");
  await privacyFramework.authorizeThirdParty("credit_bureau_003");
  console.log("✅ Third parties authorized");

  // Set up retention policies in ComplianceManager
  await complianceManager.updateRetentionPolicy("personal_data", 365 * 24 * 60 * 60); // 1 year
  await complianceManager.updateRetentionPolicy("financial_data", 7 * 365 * 24 * 60 * 60); // 7 years
  await complianceManager.updateRetentionPolicy("transaction_data", 5 * 365 * 24 * 60 * 60); // 5 years
  console.log("✅ Retention policies configured");

  // Create some encryption keys in DataTokenization
  await dataTokenization.createEncryptionKey(
    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "AES-256-GCM"
  );
  await dataTokenization.createEncryptionKey(
    "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
    "ChaCha20-Poly1305"
  );
  console.log("✅ Encryption keys created");

  // Generate initial compliance report
  await complianceManager.generateRegulatoryReport(
    "GDPR_2024_Q1",
    "GDPR",
    "Quarterly Compliance Report",
    "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
  );
  console.log("✅ Initial compliance report generated");

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📋 Contract Addresses:");
  console.log("PrivacyFramework:", privacyFrameworkAddress);
  console.log("DataTokenization:", dataTokenizationAddress);
  console.log("ComplianceManager:", complianceManagerAddress);

  console.log("\n🔗 Network Information:");
  const network = await ethers.provider.getNetwork();
  console.log("Chain ID:", network.chainId.toString());
  console.log("Network Name:", network.name);

  // Save deployment info to file
  const fs = require("fs");
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    contracts: {
      PrivacyFramework: privacyFrameworkAddress,
      DataTokenization: dataTokenizationAddress,
      ComplianceManager: complianceManagerAddress
    },
    deploymentTime: new Date().toISOString(),
    thirdParties: ["loan_provider_001", "insurance_company_002", "credit_bureau_003"],
    retentionPolicies: {
      personal_data: "1 year",
      financial_data: "7 years",
      transaction_data: "5 years"
    }
  };

  fs.writeFileSync(
    `deployment-${network.name}-${Date.now()}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n💾 Deployment info saved to file");

  console.log("\n🚀 Your AI-Driven Privacy Framework is ready!");
  console.log("🔗 View on Etherscan: https://sepolia.etherscan.io/");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PrivacyFramework", function () {
  let privacyFramework;
  let owner;
  let user1;
  let user2;
  let thirdParty;

  beforeEach(async function () {
    [owner, user1, user2, thirdParty] = await ethers.getSigners();
    
    const PrivacyFramework = await ethers.getContractFactory("PrivacyFramework");
    privacyFramework = await PrivacyFramework.deploy();
    await privacyFramework.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await privacyFramework.owner()).to.equal(owner.address);
    });

    it("Should initialize counters correctly", async function () {
      const stats = await privacyFramework.getContractStats();
      expect(stats.totalConsents).to.equal(0);
      expect(stats.totalAccessLogs).to.equal(0);
      expect(stats.totalAnomalies).to.equal(0);
    });
  });

  describe("Third Party Management", function () {
    it("Should authorize third party", async function () {
      await privacyFramework.authorizeThirdParty("test_third_party");
      expect(await privacyFramework.isThirdPartyAuthorized("test_third_party")).to.be.true;
    });

    it("Should revoke third party authorization", async function () {
      await privacyFramework.authorizeThirdParty("test_third_party");
      await privacyFramework.revokeThirdParty("test_third_party");
      expect(await privacyFramework.isThirdPartyAuthorized("test_third_party")).to.be.false;
    });

    it("Should only allow owner to authorize third parties", async function () {
      await expect(
        privacyFramework.connect(user1).authorizeThirdParty("test_third_party")
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Consent Management", function () {
    beforeEach(async function () {
      await privacyFramework.authorizeThirdParty("test_third_party");
    });

    it("Should grant consent", async function () {
      const dataHash = "0x1234567890abcdef";
      const useCase = "loan_approval";
      const thirdPartyId = "test_third_party";
      const dataType = "financial_data";
      const duration = 86400; // 1 day

      await privacyFramework.connect(user1).grantConsent(
        dataHash,
        useCase,
        thirdPartyId,
        dataType,
        duration
      );

      const consent = await privacyFramework.getConsent(1);
      expect(consent.userAddress).to.equal(user1.address);
      expect(consent.dataHash).to.equal(dataHash);
      expect(consent.useCase).to.equal(useCase);
      expect(consent.isActive).to.be.true;
      expect(consent.isRevoked).to.be.false;
    });

    it("Should not grant consent for unauthorized third party", async function () {
      const dataHash = "0x1234567890abcdef";
      const useCase = "loan_approval";
      const thirdPartyId = "unauthorized_party";
      const dataType = "financial_data";
      const duration = 86400;

      await expect(
        privacyFramework.connect(user1).grantConsent(
          dataHash,
          useCase,
          thirdPartyId,
          dataType,
          duration
        )
      ).to.be.revertedWith("Third party not authorized");
    });

    it("Should revoke consent", async function () {
      const dataHash = "0x1234567890abcdef";
      const useCase = "loan_approval";
      const thirdPartyId = "test_third_party";
      const dataType = "financial_data";
      const duration = 86400;

      await privacyFramework.connect(user1).grantConsent(
        dataHash,
        useCase,
        thirdPartyId,
        dataType,
        duration
      );

      await privacyFramework.connect(user1).revokeConsent(1);

      const consent = await privacyFramework.getConsent(1);
      expect(consent.isRevoked).to.be.true;
      expect(consent.isActive).to.be.false;
    });

    it("Should only allow consent owner to revoke", async function () {
      const dataHash = "0x1234567890abcdef";
      const useCase = "loan_approval";
      const thirdPartyId = "test_third_party";
      const dataType = "financial_data";
      const duration = 86400;

      await privacyFramework.connect(user1).grantConsent(
        dataHash,
        useCase,
        thirdPartyId,
        dataType,
        duration
      );

      await expect(
        privacyFramework.connect(user2).revokeConsent(1)
      ).to.be.revertedWith("Only consent owner can revoke");
    });
  });

  describe("Access Control", function () {
    beforeEach(async function () {
      await privacyFramework.authorizeThirdParty("test_third_party");
      
      // Grant consent first
      await privacyFramework.connect(user1).grantConsent(
        "0x1234567890abcdef",
        "loan_approval",
        "test_third_party",
        "financial_data",
        86400
      );
    });

    it("Should grant access with valid consent", async function () {
      const tx = await privacyFramework.connect(user1).requestAccess(
        "0x1234567890abcdef",
        "loan_approval",
        "test_third_party",
        "192.168.1.1",
        "device_fingerprint_123"
      );

      // Check that the transaction was successful (no revert)
      await expect(tx).to.not.be.reverted;
      
      // Verify access was granted by checking the access log
      const accessLog = await privacyFramework.getAccessLog(1);
      expect(accessLog.wasGranted).to.be.true;
    });

    it("Should deny access without valid consent", async function () {
      const tx = await privacyFramework.connect(user2).requestAccess(
        "0x1234567890abcdef",
        "loan_approval",
        "test_third_party",
        "192.168.1.1",
        "device_fingerprint_123"
      );

      // Check that the transaction was successful (no revert)
      await expect(tx).to.not.be.reverted;
      
      // Verify access was denied by checking the access log
      const accessLog = await privacyFramework.getAccessLog(1);
      expect(accessLog.wasGranted).to.be.false;
    });

    it("Should deny access for unauthorized third party", async function () {
      await expect(
        privacyFramework.connect(user1).requestAccess(
          "0x1234567890abcdef",
          "loan_approval",
          "unauthorized_party",
          "192.168.1.1",
          "device_fingerprint_123"
        )
      ).to.be.revertedWith("Third party not authorized");
    });
  });

  describe("Anomaly Detection", function () {
    it("Should report anomaly", async function () {
      await privacyFramework.reportAnomaly(
        user1.address,
        "0x1234567890abcdef",
        "suspicious_access",
        "Multiple access attempts from different IPs"
      );

      const anomaly = await privacyFramework.getAnomaly(1);
      expect(anomaly.userAddress).to.equal(user1.address);
      expect(anomaly.dataHash).to.equal("0x1234567890abcdef");
      expect(anomaly.anomalyType).to.equal("suspicious_access");
      expect(anomaly.isResolved).to.be.false;
    });

    it("Should resolve anomaly", async function () {
      await privacyFramework.reportAnomaly(
        user1.address,
        "0x1234567890abcdef",
        "suspicious_access",
        "Multiple access attempts from different IPs"
      );

      await privacyFramework.resolveAnomaly(1);

      const anomaly = await privacyFramework.getAnomaly(1);
      expect(anomaly.isResolved).to.be.true;
    });

    it("Should only allow owner to report anomalies", async function () {
      await expect(
        privacyFramework.connect(user1).reportAnomaly(
          user1.address,
          "0x1234567890abcdef",
          "suspicious_access",
          "Test anomaly"
        )
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await privacyFramework.authorizeThirdParty("test_third_party");
      
      // Grant consent
      await privacyFramework.connect(user1).grantConsent(
        "0x1234567890abcdef",
        "loan_approval",
        "test_third_party",
        "financial_data",
        86400
      );

      // Request access
      await privacyFramework.connect(user1).requestAccess(
        "0x1234567890abcdef",
        "loan_approval",
        "test_third_party",
        "192.168.1.1",
        "device_fingerprint_123"
      );

      // Report anomaly
      await privacyFramework.reportAnomaly(
        user1.address,
        "0x1234567890abcdef",
        "suspicious_access",
        "Test anomaly"
      );
    });

    it("Should get user consents", async function () {
      const userConsents = await privacyFramework.getUserConsents(user1.address);
      expect(userConsents.length).to.equal(1);
      expect(userConsents[0]).to.equal(1);
    });

    it("Should get access log", async function () {
      const accessLog = await privacyFramework.getAccessLog(1);
      expect(accessLog.requester).to.equal(user1.address);
      expect(accessLog.dataHash).to.equal("0x1234567890abcdef");
      expect(accessLog.wasGranted).to.be.true;
    });

    it("Should get third party access logs", async function () {
      const accessLogs = await privacyFramework.getThirdPartyAccessLogs("test_third_party");
      expect(accessLogs.length).to.equal(1);
      expect(accessLogs[0]).to.equal(1);
    });

    it("Should get anomaly", async function () {
      const anomaly = await privacyFramework.getAnomaly(1);
      expect(anomaly.userAddress).to.equal(user1.address);
      expect(anomaly.anomalyType).to.equal("suspicious_access");
    });

    it("Should get contract stats", async function () {
      const stats = await privacyFramework.getContractStats();
      expect(stats.totalConsents).to.equal(1);
      expect(stats.totalAccessLogs).to.equal(1);
      expect(stats.totalAnomalies).to.equal(1);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle empty data hash", async function () {
      await privacyFramework.authorizeThirdParty("test_third_party");
      
      await expect(
        privacyFramework.connect(user1).grantConsent(
          "",
          "loan_approval",
          "test_third_party",
          "financial_data",
          86400
        )
      ).to.be.revertedWith("Data hash cannot be empty");
    });

    it("Should handle zero duration", async function () {
      await privacyFramework.authorizeThirdParty("test_third_party");
      
      await expect(
        privacyFramework.connect(user1).grantConsent(
          "0x1234567890abcdef",
          "loan_approval",
          "test_third_party",
          "financial_data",
          0
        )
      ).to.be.revertedWith("Duration must be positive");
    });

    it("Should handle invalid consent ID", async function () {
      await expect(
        privacyFramework.getConsent(999)
      ).to.be.revertedWith("Invalid consent ID");
    });

    it("Should handle invalid access log ID", async function () {
      await expect(
        privacyFramework.getAccessLog(999)
      ).to.be.revertedWith("Invalid log ID");
    });

    it("Should handle invalid anomaly ID", async function () {
      await expect(
        privacyFramework.getAnomaly(999)
      ).to.be.revertedWith("Invalid anomaly ID");
    });
  });
}); 
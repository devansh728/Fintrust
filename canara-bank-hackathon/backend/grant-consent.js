require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

const abiPath = path.join(__dirname, '../smart_contracts/artifacts/contracts/PrivacyFramework.sol/PrivacyFramework.json');
const deploymentPath = path.join(__dirname, '../smart_contracts/deployment-sepolia-1751744300537.json');
const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8')).abi;
const contractAddresses = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
const address = contractAddresses.contracts.PrivacyFramework;

const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/df6abec20f0a4f7f9e5d580ceeed3f8b');

// Use the private key of the user who is granting consent
const privateKey = process.env.USER_PRIVATE_KEY; // <-- Set this in your .env file!
if (!privateKey) {
  throw new Error('USER_PRIVATE_KEY not set in .env file');
}
const wallet = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(address, abi, wallet);

async function main() {
  const dataHash = "0x1234567890abcdef"; // Replace with your data hash
  const useCase = "loan_approval";
  const thirdPartyId = "bank_001";
  const dataType = "financial_data";
  const durationInSeconds = 86400; // 1 day

  // Set higher gas price to avoid replacement transaction underpriced error
  const feeData = await provider.getFeeData();
  const tx = await contract.grantConsent(
    dataHash,
    useCase,
    thirdPartyId,
    dataType,
    durationInSeconds,
    {
      maxFeePerGas: feeData.maxFeePerGas ? feeData.maxFeePerGas * 2n : ethers.parseUnits('50', 'gwei'),
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? feeData.maxPriorityFeePerGas * 2n : ethers.parseUnits('2', 'gwei')
    }
  );
  console.log("Transaction sent! Hash:", tx.hash);
  await tx.wait();
  console.log("Consent granted to bank_001!");
}
main(); 
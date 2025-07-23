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

// Use the owner's private key
const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
if (!privateKey) {
  throw new Error('DEPLOYER_PRIVATE_KEY not set in .env file');
}
const wallet = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(address, abi, wallet);

const thirdParties = ["bank_001", "XYZ NBFC", "fintech_001", "demo_001", "canara_bank"];

async function main() {
  for (const id of thirdParties) {
    const isAlready = await contract.isThirdPartyAuthorized(id);
    if (isAlready) {
      console.log(`${id} is already authorized.`);
      continue;
    }
    // Set higher gas price to avoid replacement transaction underpriced error
    const feeData = await provider.getFeeData();
    const tx = await contract.authorizeThirdParty(id, {
      maxFeePerGas: feeData.maxFeePerGas ? feeData.maxFeePerGas * 2n : ethers.parseUnits('50', 'gwei'),
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? feeData.maxPriorityFeePerGas * 2n : ethers.parseUnits('2', 'gwei')
    });
    console.log(`Authorizing ${id}... Tx hash: ${tx.hash}`);
    await tx.wait();
    console.log(`${id} authorized!`);
  }
}
main(); 
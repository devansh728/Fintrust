const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Load ABI and contract address
const abiPath = path.join(__dirname, '../smart_contracts/artifacts/contracts/PrivacyFramework.sol/PrivacyFramework.json');
const deploymentPath = path.join(__dirname, '../smart_contracts/deployment-sepolia-1751744300537.json');
const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8')).abi;
const contractAddresses = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
const address = contractAddresses.contracts.PrivacyFramework;

// Setup provider and wallet
const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/df6abec20f0a4f7f9e5d580ceeed3f8b');
const PRIVATE_KEY = 'ead0841e29777b1f4ce07df3c9fc802ca5893445155d4ede905c95ba6f94bf75'; // Use your owner key!
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Connect to contract
const contract = new ethers.Contract(address, abi, wallet);

async function main() {
  const thirdPartyId = 'XYZ NBFC'; // Use the exact value from your test
  const isAuthorized = await contract.isThirdPartyAuthorized(thirdPartyId);
  console.log(`Is "${thirdPartyId}" authorized?`, isAuthorized);
}
main(); 
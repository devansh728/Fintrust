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
const contract = new ethers.Contract(address, abi, provider);

async function main() {
  const ids = ["bank_001", "XYZ NBFC", "fintech_001", "demo_001", "canara_bank"];
  for (const id of ids) {
    const isAuthorized = await contract.isThirdPartyAuthorized(id);
    console.log(`Is ${id} authorized?`, isAuthorized);
  }
}
main(); 
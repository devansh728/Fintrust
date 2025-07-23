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

// Load deployer private key from environment variable
const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
if (!privateKey) {
  throw new Error('DEPLOYER_PRIVATE_KEY not set in .env file');
}
const wallet = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(address, abi, wallet);

async function main() {
  const owner = await contract.owner();
  console.log('Current contract owner:', owner);

  // Authorize bank_001 as a third party
  const feeData = await provider.getFeeData();
  const tx = await contract.authorizeThirdParty('bank_001', {
    maxFeePerGas: feeData.maxFeePerGas ? feeData.maxFeePerGas * 2n : ethers.parseUnits('50', 'gwei'),
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? feeData.maxPriorityFeePerGas * 2n : ethers.parseUnits('2', 'gwei')
  });
  console.log('Transaction sent! Hash:', tx.hash);
  await tx.wait();
  console.log('bank_001 authorized as third party!');

  const isAuthorized = await contract.isThirdPartyAuthorized("bank_001");
  console.log("Is bank_001 authorized?", isAuthorized);
}
main(); 
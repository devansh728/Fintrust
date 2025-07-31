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
const privateKey = process.env.DEPLOYER_PRIVATE_KEY || 'ead0841e29777b1f4ce07df3c9fc802ca5893445155d4ede905c95ba6f94bf75';
const wallet = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(address, abi, wallet);

async function main() {
  console.log('🔍 Checking CANRARAA authorization status...');
  
  // Check if CANRARAA is authorized
  const isAuthorized = await contract.isThirdPartyAuthorized('CANRARAA');
  console.log(`Is CANRARAA authorized? ${isAuthorized}`);
  
  if (!isAuthorized) {
    console.log('❌ CANRARAA is not authorized. Authorizing now...');
    
    try {
      // Set higher gas price to avoid replacement transaction underpriced error
      const feeData = await provider.getFeeData();
      const tx = await contract.authorizeThirdParty('CANRARAA', {
        maxFeePerGas: feeData.maxFeePerGas ? feeData.maxFeePerGas * 2n : ethers.parseUnits('50', 'gwei'),
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? feeData.maxPriorityFeePerGas * 2n : ethers.parseUnits('2', 'gwei')
      });
      console.log(`🔐 Authorizing CANRARAA... Tx hash: ${tx.hash}`);
      await tx.wait();
      console.log('✅ CANRARAA authorized successfully!');
      
      // Verify authorization
      const isNowAuthorized = await contract.isThirdPartyAuthorized('CANRARAA');
      console.log(`🔍 Verification: Is CANRARAA authorized? ${isNowAuthorized}`);
    } catch (error) {
      console.error('❌ Failed to authorize CANRARAA:', error.message);
    }
  } else {
    console.log('✅ CANRARAA is already authorized!');
  }
  
  // Also check other common third party IDs
  console.log('\n📋 Checking other third party IDs...');
  const otherIds = ['bank_001', 'XYZ NBFC', 'fintech_001', 'demo_001', 'canara_bank', 'Devansh', 'UIDAI'];
  
  for (const id of otherIds) {
    const auth = await contract.isThirdPartyAuthorized(id);
    console.log(`${id}: ${auth ? '✅' : '❌'}`);
  }
}

main().catch(console.error); 
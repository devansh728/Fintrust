const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Load the same configuration as the blockchain service
const abiPath = path.join(__dirname, '../smart_contracts/artifacts/contracts/PrivacyFramework.sol/PrivacyFramework.json');
const deploymentPath = path.join(__dirname, '../smart_contracts/deployment-sepolia-1751744300537.json');
const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8')).abi;
const contractAddresses = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
const address = contractAddresses.contracts.PrivacyFramework;

const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/df6abec20f0a4f7f9e5d580ceeed3f8b');
const PRIVATE_KEY = 'ead0841e29777b1f4ce07df3c9fc802ca5893445155d4ede905c95ba6f94bf75';
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(address, abi, wallet);

async function testBlockchainService() {
  console.log('🔍 Testing Blockchain Service...');
  console.log('Contract Address:', address);
  console.log('Wallet Address:', wallet.address);
  
  try {
    // Test 1: Check if contract is accessible
    console.log('\n📋 Test 1: Contract Accessibility');
    const owner = await contract.owner();
    console.log('Contract Owner:', owner);
    
    // Test 2: Check if CANRARAA is authorized
    console.log('\n📋 Test 2: CANRARAA Authorization');
    const isAuthorized = await contract.isThirdPartyAuthorized('CANRARAA');
    console.log('Is CANRARAA authorized?', isAuthorized);
    
    // Test 3: Try to grant consent (this should work if CANRARAA is authorized)
    console.log('\n📋 Test 3: Grant Consent Test');
    const testDataHash = '0x' + Buffer.from('test-data-' + Date.now()).toString('hex').substr(0, 64);
    const testUseCase = 'test-use-case';
    const testThirdPartyId = 'CANRARAA';
    const testDataType = 'test-data';
    const testDuration = 3600; // 1 hour
    
    console.log('Test Parameters:');
    console.log('  Data Hash:', testDataHash);
    console.log('  Use Case:', testUseCase);
    console.log('  Third Party ID:', testThirdPartyId);
    console.log('  Data Type:', testDataType);
    console.log('  Duration:', testDuration);
    
    try {
      const tx = await contract.grantConsent(testDataHash, testUseCase, testThirdPartyId, testDataType, testDuration);
      console.log('✅ Consent granted successfully!');
      console.log('Transaction Hash:', tx.hash);
      await tx.wait();
      console.log('✅ Transaction confirmed!');
    } catch (error) {
      console.log('❌ Failed to grant consent:', error.message);
      console.log('Error details:', error);
    }
    
    // Test 4: Check contract stats
    console.log('\n📋 Test 4: Contract Statistics');
    const stats = await contract.getContractStats();
    console.log('Total Consents:', stats[0].toString());
    console.log('Total Access Logs:', stats[1].toString());
    console.log('Total Anomalies:', stats[2].toString());
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

testBlockchainService().catch(console.error); 
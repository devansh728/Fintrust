const { blockchainService, initializeBlockchainService } = require('./blockchain-service');

async function debugBlockchainService() {
  console.log('🔍 Debugging Blockchain Service...');
  
  try {
    // Initialize the blockchain service
    await initializeBlockchainService();
    console.log('✅ Blockchain service initialized');
    
    // Check if contracts are loaded
    console.log('\n📋 Contract Status:');
    console.log('PrivacyFramework contract:', blockchainService.contracts.privacyFramework ? '✅ Loaded' : '❌ Not loaded');
    console.log('DataTokenization contract:', blockchainService.contracts.dataTokenization ? '✅ Loaded' : '❌ Not loaded');
    console.log('ComplianceManager contract:', blockchainService.contracts.complianceManager ? '✅ Loaded' : '❌ Not loaded');
    
    if (blockchainService.contracts.privacyFramework) {
      console.log('\n📋 PrivacyFramework Contract Details:');
      console.log('Address:', blockchainService.contracts.privacyFramework.target);
      console.log('ABI loaded:', blockchainService.contracts.privacyFramework.interface ? '✅' : '❌');
      
      // Test if we can call a simple method
      try {
        const owner = await blockchainService.contracts.privacyFramework.owner();
        console.log('Contract Owner:', owner);
      } catch (error) {
        console.log('❌ Failed to get owner:', error.message);
      }
      
      // Test if CANRARAA is authorized
      try {
        const isAuthorized = await blockchainService.contracts.privacyFramework.isThirdPartyAuthorized('CANRARAA');
        console.log('Is CANRARAA authorized?', isAuthorized);
      } catch (error) {
        console.log('❌ Failed to check authorization:', error.message);
      }
    }
    
    // Test the grantConsent method
    console.log('\n📋 Testing grantConsent method...');
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
      const result = await blockchainService.grantConsent(testDataHash, testUseCase, testThirdPartyId, testDataType, testDuration);
      console.log('✅ grantConsent result:', result);
    } catch (error) {
      console.log('❌ grantConsent failed:', error.message);
      console.log('Full error:', error);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error('Full error:', error);
  }
}

debugBlockchainService().catch(console.error); 
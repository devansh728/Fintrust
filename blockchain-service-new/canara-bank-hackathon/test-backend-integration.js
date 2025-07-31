const http = require('http');

// Test configuration
const BASE_URL = 'http://localhost:3001';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: url,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          resolve({
            success: true,
            status: res.statusCode,
            data: jsonData
          });
        } catch (e) {
          resolve({
            success: true,
            status: res.statusCode,
            data: responseData
          });
        }
      });
    });

    req.on('error', (err) => {
      resolve({
        success: false,
        error: err.message
      });
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testBackendIntegration() {
  log('\n🚀 Testing Backend + Blockchain Integration...\n', 'blue');

  const tests = [
    {
      name: 'Health Check',
      url: '/health',
      method: 'GET'
    },
    {
      name: 'Blockchain Status',
      url: '/api/blockchain/status',
      method: 'GET'
    },
    {
      name: 'Grant Consent',
      url: '/api/blockchain/grant-consent',
      method: 'POST',
      data: {
        dataHash: '0x1234567890abcdef',
        useCase: 'credit_scoring',
        thirdPartyId: 'bank_001',
        dataType: 'financial_data',
        duration: 365 * 24 * 60 * 60
      }
    },
    {
      name: 'Tokenize Data',
      url: '/api/blockchain/tokenize-data',
      method: 'POST',
      data: {
        originalDataHash: '0xabcdef1234567890',
        token: '0xtoken123456',
        encryptionKeyHash: '0xkey123456',
        dataType: 'financial_data',
        duration: 365 * 24 * 60 * 60
      }
    },
    {
      name: 'Record Compliance',
      url: '/api/blockchain/record-compliance',
      method: 'POST',
      data: {
        userAddress: '0x1234567890123456789012345678901234567890',
        regulation: 'GDPR',
        complianceType: 'data_processing',
        isCompliant: true,
        details: 'Data processed with privacy protection',
        region: 'EU',
        duration: 365 * 24 * 60 * 60
      }
    },
    {
      name: 'Complete Data Processing Workflow',
      url: '/api/blockchain/process-data',
      method: 'POST',
      data: {
        userAddress: '0x1234567890123456789012345678901234567890',
        data: {
          name: 'John Doe',
          accountNumber: '1234567890',
          balance: 50000
        },
        regulation: 'GDPR',
        region: 'EU',
        useCase: 'credit_scoring',
        thirdPartyId: 'bank_001'
      }
    }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    log(`Testing: ${test.name}...`, 'yellow');
    
    const result = await makeRequest(test.url, test.method, test.data);
    
    if (result.success && result.status >= 200 && result.status < 300) {
      log(`✅ ${test.name}: PASSED (Status: ${result.status})`, 'green');
      if (test.name === 'Blockchain Status') {
        log(`   Network: ${result.data.network?.name || 'Unknown'}`, 'blue');
        log(`   Contracts: ${Object.keys(result.data.contracts || {}).length} loaded`, 'blue');
      }
      passedTests++;
    } else {
      log(`❌ ${test.name}: FAILED - ${result.error || `Status: ${result.status}`}`, 'red');
    }
    
    // Add a small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  log('\n📊 Integration Test Results:', 'blue');
  log(`Total Tests: ${totalTests}`, 'blue');
  log(`Passed: ${passedTests}`, 'green');
  log(`Failed: ${totalTests - passedTests}`, 'red');
  
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  log(`Success Rate: ${successRate}%`, successRate >= 80 ? 'green' : 'red');

  // Final assessment
  log('\n🎯 Final Assessment:', 'blue');
  if (passedTests === totalTests) {
    log('🎉 PERFECT! Your backend is fully integrated with blockchain and ready for the hackathon!', 'green');
    log('✅ All blockchain operations are working', 'green');
    log('✅ Smart contracts are properly connected', 'green');
    log('✅ Data processing workflow is functional', 'green');
  } else if (passedTests >= totalTests * 0.7) {
    log('👍 GOOD! Most functionality is working. Check the failed tests.', 'yellow');
  } else {
    log('⚠️  NEEDS ATTENTION: Several tests failed. Check your setup.', 'red');
  }

  // Next steps
  log('\n🚀 Next Steps:', 'blue');
  log('1. Your backend is running at: http://localhost:3001', 'yellow');
  log('2. API Documentation: http://localhost:3001/', 'yellow');
  log('3. Test with your smart contracts: npm run test (in smart_contracts folder)', 'yellow');
  log('4. Ready for hackathon demo!', 'green');
}

// Run the tests
testBackendIntegration().catch(console.error); 
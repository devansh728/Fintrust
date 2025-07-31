const http = require('http');

// Test configuration
const WALLET_ADDRESS = '0x6FEA87B2B06204da691d388163E15E56392DB9A8';

// Sample data for testing
const SAMPLE_DATA = {
  userData: {
    name: "John Doe",
    accountNumber: "1234567890",
    balance: 50000,
    creditScore: 750,
    transactionHistory: [
      { date: "2024-01-15", amount: 1000, type: "credit" },
      { date: "2024-01-20", amount: 500, type: "debit" }
    ]
  },
  consentData: {
    dataHash: "0x" + Math.random().toString(16).substr(2, 64),
    useCase: "credit_scoring",
    thirdPartyId: "bank_001",
    dataType: "financial_data",
    duration: 365 * 24 * 60 * 60 // 1 year
  },
  tokenizationData: {
    originalDataHash: "0x" + Math.random().toString(16).substr(2, 64),
    token: "0xtoken" + Date.now(),
    encryptionKeyHash: "0xkey" + Date.now(),
    dataType: "financial_data",
    duration: 365 * 24 * 60 * 60
  },
  complianceData: {
    userAddress: WALLET_ADDRESS,
    regulation: "GDPR",
    complianceType: "data_processing",
    isCompliant: true,
    details: "Data processed with privacy protection and blockchain verification",
    region: "EU",
    duration: 365 * 24 * 60 * 60
  },
  workflowData: {
    userAddress: WALLET_ADDRESS,
    data: {
      customerId: "CUST001",
      accountType: "Savings",
      monthlyIncome: 8000,
      riskProfile: "Moderate",
      kycStatus: "Verified"
    },
    regulation: "DPDP",
    region: "India",
    useCase: "loan_processing",
    thirdPartyId: "fintech_001"
  }
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
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

async function comprehensiveTest() {
  log('\n🚀 COMPREHENSIVE BACKEND + SMART CONTRACT TEST', 'magenta');
  log('='.repeat(70), 'cyan');
  log(`🎯 Testing with Wallet: ${WALLET_ADDRESS}`, 'yellow');
  log('='.repeat(70), 'cyan');

  const tests = [
    // Basic Health Checks
    {
      name: 'Backend Health Check',
      url: '/health',
      method: 'GET',
      category: 'Basic',
      critical: true
    },
    {
      name: 'API Documentation',
      url: '/',
      method: 'GET',
      category: 'Basic',
      critical: false
    },

    // Blockchain Integration Tests
    {
      name: 'Blockchain Status Check',
      url: '/api/blockchain/status',
      method: 'GET',
      category: 'Blockchain',
      critical: true
    },
    {
      name: 'Wallet Balance Check',
      url: '/api/blockchain/wallet',
      method: 'GET',
      category: 'Blockchain',
      critical: true
    },

    // Smart Contract Operations
    {
      name: 'Grant Consent (Smart Contract)',
      url: '/api/blockchain/grant-consent',
      method: 'POST',
      data: SAMPLE_DATA.consentData,
      category: 'Smart Contracts',
      critical: true
    },
    {
      name: 'Tokenize Data (Smart Contract)',
      url: '/api/blockchain/tokenize-data',
      method: 'POST',
      data: SAMPLE_DATA.tokenizationData,
      category: 'Smart Contracts',
      critical: true
    },
    {
      name: 'Record Compliance (Smart Contract)',
      url: '/api/blockchain/record-compliance',
      method: 'POST',
      data: SAMPLE_DATA.complianceData,
      category: 'Smart Contracts',
      critical: true
    },

    // Complete Workflow Test
    {
      name: 'Complete Data Processing Workflow',
      url: '/api/blockchain/process-data',
      method: 'POST',
      data: SAMPLE_DATA.workflowData,
      category: 'Workflow',
      critical: true
    },

    // Loan Approval Workflow Test (Custom Sample)
    {
      name: 'Loan Approval Workflow (Custom Sample)',
      url: '/api/blockchain/process-data',
      method: 'POST',
      data: {
        userAddress: WALLET_ADDRESS,
        data: {
          userId: "user_88231",
          monthlyIncome: 85000,
          transactionHistory: [
            {
              date: "2025-06-01",
              amount: 10000,
              type: "debit",
              merchant: "Amazon"
            },
            {
              date: "2025-05-25",
              amount: 50000,
              type: "credit",
              merchant: "Salary"
            }
          ],
          creditScore: 732,
          loanRepaymentHistory: "No defaults in past 2 years"
        },
        regulation: "DPDP",
        region: "Maharashtra",
        useCase: "loanApproval",
        thirdPartyId: "XYZ NBFC"
      },
      category: 'Workflow',
      critical: true
    },

    // Loan Approval Workflow Test (Automated Sepolia Transaction)
    {
      name: 'Loan Approval Workflow (Automated Sepolia Transaction)',
      url: '/api/blockchain/process-data',
      method: 'POST',
      data: {
        userAddress: '0x6FEA87B2B06204da691d388163E15E56392DB9A8',
        data: {
          userId: 'user_88231',
          monthlyIncome: 85000,
          transactionHistory: [
            { date: '2025-06-01', amount: 10000, type: 'debit', merchant: 'Amazon' },
            { date: '2025-05-25', amount: 50000, type: 'credit', merchant: 'Salary' }
          ],
          creditScore: 732,
          loanRepaymentHistory: 'No defaults in past 2 years'
        },
        regulation: 'DPDP',
        region: 'India',
        useCase: 'loanApproval',
        thirdPartyId: 'XYZ NBFC'
      },
      category: 'Workflow',
      critical: true,
      preTest: async (axios) => {
        // Get wallet balance before
        const res = await axios.get('http://localhost:3001/api/blockchain/wallet');
        return { balanceBefore: res.data.wallet.balance };
      },
      postTest: async (axios, response, preTestResult) => {
        // Get wallet balance after
        const res = await axios.get('http://localhost:3001/api/blockchain/wallet');
        const balanceAfter = res.data.wallet.balance;
        const balanceBefore = preTestResult.balanceBefore;
        const txHashes = [];
        if (response.data) {
          if (response.data.tokenizationResult && response.data.tokenizationResult.transactionHash) txHashes.push(response.data.tokenizationResult.transactionHash);
          if (response.data.consentResult && response.data.consentResult.transactionHash) txHashes.push(response.data.consentResult.transactionHash);
          if (response.data.complianceResult && response.data.complianceResult.transactionHash) txHashes.push(response.data.complianceResult.transactionHash);
        }
        return {
          balanceBefore,
          balanceAfter,
          txHashes
        };
      }
    },

    // Integration Tests
    {
      name: 'AI Engine Status',
      url: '/api/ai/status',
      method: 'GET',
      category: 'Integration',
      critical: false
    },
    {
      name: 'Java Backend Status',
      url: '/api/java/status',
      method: 'GET',
      category: 'Integration',
      critical: false
    }
  ];

  let passedTests = 0;
  let totalTests = tests.length;
  let criticalTests = 0;
  let totalCriticalTests = 0;
  let categoryResults = {};

  for (const test of tests) {
    log(`\n🔍 Testing: ${test.name}`, 'blue');
    log(`   Category: ${test.category}`, 'cyan');
    
    const result = await makeRequest(test.url, test.method, test.data);
    
    if (result.success && result.status >= 200 && result.status < 300) {
      log(`✅ ${test.name}: PASSED (Status: ${result.status})`, 'green');
      
      // Display specific information based on test type
      if (test.name === 'Wallet Balance Check' && result.data.wallet) {
        log(`   💰 Balance: ${result.data.wallet.balance} ETH`, 'cyan');
        log(`   📍 Address: ${result.data.wallet.address}`, 'cyan');
      } else if (test.name === 'Blockchain Status Check' && result.data.wallet) {
        log(`   🔗 Network: ${result.data.network?.name || 'Sepolia Testnet'}`, 'cyan');
        log(`   📊 Contracts: ${Object.keys(result.data.contracts || {}).length} loaded`, 'cyan');
      } else if (test.name.includes('Grant Consent') && result.data.success) {
        log(`   📝 Transaction Hash: ${result.data.transactionHash}`, 'cyan');
        log(`   🎯 Use Case: ${result.data.useCase}`, 'cyan');
      } else if (test.name.includes('Tokenize Data') && result.data.success) {
        log(`   🔐 Token: ${result.data.token}`, 'cyan');
        log(`   📄 Data Hash: ${result.data.originalDataHash}`, 'cyan');
      } else if (test.name.includes('Record Compliance') && result.data.success) {
        log(`   📋 Regulation: ${result.data.regulation}`, 'cyan');
        log(`   ✅ Compliant: ${result.data.isCompliant}`, 'cyan');
      } else if (test.name.includes('Complete Workflow') && result.data.success) {
        log(`   🔄 Workflow: COMPLETED`, 'cyan');
        log(`   🎯 Token: ${result.data.workflow?.tokenization?.transactionHash}`, 'cyan');
        log(`   📝 Consent: ${result.data.workflow?.consent?.transactionHash}`, 'cyan');
        log(`   📋 Compliance: ${result.data.workflow?.compliance?.transactionHash}`, 'cyan');
      }
      
      passedTests++;
      if (test.critical) {
        criticalTests++;
        totalCriticalTests++;
      }

      // Track category results
      if (!categoryResults[test.category]) {
        categoryResults[test.category] = { passed: 0, total: 0 };
      }
      categoryResults[test.category].passed++;
      categoryResults[test.category].total++;
      
    } else {
      log(`❌ ${test.name}: FAILED - ${result.error || `Status: ${result.status}`}`, 'red');
      if (test.critical) {
        totalCriticalTests++;
      }

      // Track category results
      if (!categoryResults[test.category]) {
        categoryResults[test.category] = { passed: 0, total: 0 };
      }
      categoryResults[test.category].total++;
    }
    
    // Add delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  log('\n' + '='.repeat(70), 'cyan');
  log('📊 COMPREHENSIVE TEST RESULTS', 'magenta');
  log('='.repeat(70), 'cyan');
  
  log(`\n🎯 Overall Results:`, 'blue');
  log(`Total Tests: ${totalTests}`, 'blue');
  log(`Passed: ${passedTests}`, 'green');
  log(`Failed: ${totalTests - passedTests}`, 'red');
  log(`Critical Tests Passed: ${criticalTests}/${totalCriticalTests}`, criticalTests === totalCriticalTests ? 'green' : 'yellow');
  
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  log(`Success Rate: ${successRate}%`, successRate >= 80 ? 'green' : 'red');

  // Category Breakdown
  log(`\n📋 Category Breakdown:`, 'blue');
  for (const [category, results] of Object.entries(categoryResults)) {
    const categoryRate = ((results.passed / results.total) * 100).toFixed(1);
    log(`${category}: ${results.passed}/${results.total} (${categoryRate}%)`, 
        categoryRate >= 80 ? 'green' : categoryRate >= 60 ? 'yellow' : 'red');
  }

  // Final Assessment
  log('\n🎯 FINAL ASSESSMENT', 'magenta');
  log('='.repeat(70), 'cyan');
  
  if (criticalTests === totalCriticalTests && passedTests === totalTests) {
    log('🏆 PERFECT SUCCESS!', 'green');
    log('✅ All critical functionality working', 'green');
    log('✅ Smart contract integration complete', 'green');
    log('✅ Backend + blockchain fully operational', 'green');
    log('✅ Ready for hackathon demo!', 'green');
  } else if (criticalTests === totalCriticalTests) {
    log('🎉 EXCELLENT!', 'green');
    log('✅ All critical functionality working', 'green');
    log('✅ Smart contract integration complete', 'green');
    log('✅ Ready for hackathon demo!', 'green');
    log('⚠️  Minor non-critical issues (can be ignored)', 'yellow');
  } else {
    log('⚠️  NEEDS ATTENTION', 'red');
    log('❌ Critical functionality issues detected', 'red');
    log('🔧 Check blockchain connection and smart contracts', 'red');
  }

  // Sample Data Summary
  log('\n📊 Sample Data Used:', 'blue');
  log(`User Data: ${JSON.stringify(SAMPLE_DATA.userData, null, 2)}`, 'cyan');
  log(`Consent Data: ${JSON.stringify(SAMPLE_DATA.consentData, null, 2)}`, 'cyan');
  log(`Tokenization Data: ${JSON.stringify(SAMPLE_DATA.tokenizationData, null, 2)}`, 'cyan');
  log(`Compliance Data: ${JSON.stringify(SAMPLE_DATA.complianceData, null, 2)}`, 'cyan');
  // Add summary for the custom loan approval sample
  log(`Loan Approval Workflow Data: ${JSON.stringify({
    userAddress: WALLET_ADDRESS,
    data: {
      userId: "user_88231",
      monthlyIncome: 85000,
      transactionHistory: [
        {
          date: "2025-06-01",
          amount: 10000,
          type: "debit",
          merchant: "Amazon"
        },
        {
          date: "2025-05-25",
          amount: 50000,
          type: "credit",
          merchant: "Salary"
        }
      ],
      creditScore: 732,
      loanRepaymentHistory: "No defaults in past 2 years"
    },
    regulation: "DPDP",
    region: "Maharashtra",
    useCase: "loanApproval",
    thirdPartyId: "XYZ NBFC"
  }, null, 2)}`, 'cyan');

  // Demo Commands
  log('\n🚀 HACKATHON DEMO COMMANDS', 'magenta');
  log('='.repeat(70), 'cyan');
  log('1. Show wallet balance:', 'yellow');
  log('   curl http://localhost:3001/api/blockchain/wallet', 'cyan');
  log('\n2. Show blockchain status:', 'yellow');
  log('   curl http://localhost:3001/api/blockchain/status', 'cyan');
  log('\n3. Test complete workflow:', 'yellow');
  log('   curl -X POST http://localhost:3001/api/blockchain/process-data \\', 'cyan');
  log('   -H "Content-Type: application/json" \\', 'cyan');
  log('   -d \'{"userAddress":"' + WALLET_ADDRESS + '","data":{"test":"data"},"regulation":"GDPR","region":"EU","useCase":"demo","thirdPartyId":"hackathon"}\'', 'cyan');
  log('\n4. Show API documentation:', 'yellow');
  log('   curl http://localhost:3001/', 'cyan');

  // Next Steps
  log('\n🎯 Next Steps:', 'blue');
  if (criticalTests === totalCriticalTests) {
    log('✅ Your backend is fully integrated with smart contracts!', 'green');
    log('✅ All blockchain operations are working!', 'green');
    log('✅ Ready for hackathon presentation!', 'green');
    log('✅ You can demonstrate real blockchain integration!', 'green');
  } else {
    log('🔧 Fix critical issues before hackathon', 'red');
    log('🔧 Check blockchain connection', 'red');
    log('🔧 Verify smart contract deployment', 'red');
  }

  log('\n🎉 CONGRATULATIONS! Your comprehensive test is complete! 🏆', 'magenta');
  log('='.repeat(70), 'cyan');
}

// Run the comprehensive test
comprehensiveTest().catch(console.error); 
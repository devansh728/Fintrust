const http = require('http');

// Test configuration
const WALLET_ADDRESS = '0x6FEA87B2B06204da691d388163E15E56392DB9A8';

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
      port: url.includes('3001') ? 3001 : url.includes('3000') ? 3000 : url.includes('8080') ? 8080 : 8000,
      path: url.includes('localhost') ? url.split('localhost')[1] : url,
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

async function hackathonStatusCheck() {
  log('\n🎯 HACKATHON STATUS CHECK - COMPREHENSIVE TEST', 'magenta');
  log('='.repeat(70), 'cyan');
  log(`🎯 Wallet Address: ${WALLET_ADDRESS}`, 'yellow');
  log('='.repeat(70), 'cyan');

  const tests = [
    // Core Backend Services
    {
      name: 'Node.js Backend (Port 3001)',
      url: '/health',
      method: 'GET',
      category: 'Backend',
      critical: true
    },
    {
      name: 'Java Backend (Port 8080)',
      url: 'http://localhost:8080/actuator/health',
      method: 'GET',
      category: 'Backend',
      critical: false
    },
    {
      name: 'AI Engine (Port 8000)',
      url: 'http://localhost:8000/health',
      method: 'GET',
      category: 'AI',
      critical: false
    },
    {
      name: 'React Frontend (Port 3000)',
      url: 'http://localhost:3000',
      method: 'GET',
      category: 'Frontend',
      critical: false
    },

    // Blockchain Integration
    {
      name: 'Blockchain Status',
      url: '/api/blockchain/status',
      method: 'GET',
      category: 'Blockchain',
      critical: true
    },
    {
      name: 'Wallet Balance',
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
      data: {
        dataHash: "0x" + Math.random().toString(16).substr(2, 64),
        useCase: "hackathon_demo",
        thirdPartyId: "demo_001",
        dataType: "financial_data",
        duration: 365 * 24 * 60 * 60
      },
      category: 'Smart Contracts',
      critical: true
    },
    {
      name: 'Tokenize Data (Smart Contract)',
      url: '/api/blockchain/tokenize-data',
      method: 'POST',
      data: {
        originalDataHash: "0x" + Math.random().toString(16).substr(2, 64),
        token: "0xtoken" + Date.now(),
        encryptionKeyHash: "0xkey" + Date.now(),
        dataType: "financial_data",
        duration: 365 * 24 * 60 * 60
      },
      category: 'Smart Contracts',
      critical: true
    },

    // Complete Workflow
    {
      name: 'Complete Data Processing Workflow',
      url: '/api/blockchain/process-data',
      method: 'POST',
      data: {
        userAddress: WALLET_ADDRESS,
        data: {
          customerId: "HACKATHON001",
          accountType: "Demo",
          balance: 10000,
          riskProfile: "Low"
        },
        regulation: "GDPR",
        region: "EU",
        useCase: "hackathon_demo",
        thirdPartyId: "canara_bank"
      },
      category: 'Workflow',
      critical: true
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
      
      // Display specific information
      if (test.name === 'Wallet Balance' && result.data.wallet) {
        log(`   💰 Balance: ${result.data.wallet.balance} ETH`, 'cyan');
        log(`   📍 Address: ${result.data.wallet.address}`, 'cyan');
      } else if (test.name === 'Blockchain Status' && result.data.status) {
        log(`   🔗 Status: ${result.data.status}`, 'cyan');
        log(`   📊 Contracts: ${Object.keys(result.data.contracts || {}).length} loaded`, 'cyan');
      } else if (test.name.includes('Grant Consent') && result.data.success) {
        log(`   📝 Transaction: ${result.data.transactionHash ? 'SUCCESS' : 'PENDING'}`, 'cyan');
      } else if (test.name.includes('Tokenize Data') && result.data.success) {
        log(`   🔐 Token: ${result.data.token ? 'GENERATED' : 'PENDING'}`, 'cyan');
      } else if (test.name.includes('Complete Workflow') && result.data.success) {
        log(`   🔄 Workflow: COMPLETED`, 'cyan');
        log(`   📝 Data Hash: ${result.data.workflow?.dataHash}`, 'cyan');
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
  log('📊 HACKATHON STATUS SUMMARY', 'magenta');
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

  // Hackathon Readiness Assessment
  log('\n🎯 HACKATHON READINESS ASSESSMENT', 'magenta');
  log('='.repeat(70), 'cyan');
  
  if (criticalTests === totalCriticalTests && passedTests >= totalTests * 0.8) {
    log('🏆 EXCELLENT! READY FOR HACKATHON!', 'green');
    log('✅ All critical functionality working', 'green');
    log('✅ Smart contract integration complete', 'green');
    log('✅ Backend + blockchain fully operational', 'green');
    log('✅ Ready for demo presentation!', 'green');
  } else if (criticalTests === totalCriticalTests) {
    log('🎉 GOOD! MOSTLY READY FOR HACKATHON!', 'green');
    log('✅ All critical functionality working', 'green');
    log('✅ Smart contract integration complete', 'green');
    log('✅ Ready for demo presentation!', 'green');
    log('⚠️  Some non-critical services need attention', 'yellow');
  } else {
    log('⚠️  NEEDS ATTENTION BEFORE HACKATHON', 'red');
    log('❌ Critical functionality issues detected', 'red');
    log('🔧 Check blockchain connection and smart contracts', 'red');
  }

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

  // Service Status
  log('\n🔧 SERVICE STATUS', 'magenta');
  log('='.repeat(70), 'cyan');
  log('Node.js Backend (Port 3001): ' + (categoryResults['Backend']?.passed > 0 ? '✅ RUNNING' : '❌ NOT RUNNING'), 
      categoryResults['Backend']?.passed > 0 ? 'green' : 'red');
  log('Java Backend (Port 8080): ' + (categoryResults['Backend']?.passed > 1 ? '✅ RUNNING' : '❌ NOT RUNNING'), 
      categoryResults['Backend']?.passed > 1 ? 'green' : 'red');
  log('AI Engine (Port 8000): ' + (categoryResults['AI']?.passed > 0 ? '✅ RUNNING' : '❌ NOT RUNNING'), 
      categoryResults['AI']?.passed > 0 ? 'green' : 'red');
  log('React Frontend (Port 3000): ' + (categoryResults['Frontend']?.passed > 0 ? '✅ RUNNING' : '❌ NOT RUNNING'), 
      categoryResults['Frontend']?.passed > 0 ? 'green' : 'red');

  // Next Steps
  log('\n🎯 Next Steps:', 'blue');
  if (criticalTests === totalCriticalTests) {
    log('✅ Your core functionality is working!', 'green');
    log('✅ You can demonstrate blockchain integration!', 'green');
    log('✅ Ready for hackathon presentation!', 'green');
    log('✅ Focus on showcasing the working features!', 'green');
  } else {
    log('🔧 Start the missing services:', 'red');
    log('   - Java Backend: cd java-backend && mvn spring-boot:run', 'yellow');
    log('   - AI Engine: cd ai_engine && python -m uvicorn main:app --port 8000', 'yellow');
    log('   - Frontend: cd frontend && npm start', 'yellow');
  }

  log('\n🎉 HACKATHON STATUS CHECK COMPLETE! 🏆', 'magenta');
  log('='.repeat(70), 'cyan');
}

// Run the status check
hackathonStatusCheck().catch(console.error); 
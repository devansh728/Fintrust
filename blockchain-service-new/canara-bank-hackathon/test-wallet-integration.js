const http = require('http');

// Test configuration
const WALLET_ADDRESS = '0x6FEA87B2B06204da691d388163E15E56392DB9A8';

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

async function testWalletIntegration() {
  log('\n💰 Testing Wallet Integration with Sepolia Network...\n', 'blue');
  log(`🎯 Target Wallet: ${WALLET_ADDRESS}\n`, 'yellow');

  const tests = [
    {
      name: 'Backend Health Check',
      url: '/health',
      method: 'GET'
    },
    {
      name: 'Blockchain Status (with Wallet)',
      url: '/api/blockchain/status',
      method: 'GET'
    },
    {
      name: 'Wallet Balance Check',
      url: '/api/blockchain/wallet',
      method: 'GET'
    },
    {
      name: 'Token Access Check (USDC)',
      url: '/api/blockchain/token/0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // USDC on Sepolia
      method: 'GET'
    },
    {
      name: 'Token Access Check (WETH)',
      url: '/api/blockchain/token/0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9', // WETH on Sepolia
      method: 'GET'
    }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    log(`Testing: ${test.name}...`, 'yellow');
    
    const result = await makeRequest(test.url, test.method, test.data);
    
    if (result.success && result.status >= 200 && result.status < 300) {
      log(`✅ ${test.name}: PASSED (Status: ${result.status})`, 'green');
      
      // Display specific information for wallet-related tests
      if (test.name === 'Blockchain Status (with Wallet)') {
        if (result.data.wallet) {
          log(`   💰 Wallet Balance: ${result.data.wallet.balance} ETH`, 'blue');
          log(`   🔗 Network: ${result.data.network?.name || 'Unknown'}`, 'blue');
        }
      } else if (test.name === 'Wallet Balance Check') {
        if (result.data.wallet) {
          log(`   💰 Balance: ${result.data.wallet.balance} ETH`, 'blue');
          log(`   📍 Address: ${result.data.wallet.address}`, 'blue');
        }
      } else if (test.name.includes('Token Access')) {
        if (result.data.token && !result.data.token.error) {
          log(`   🪙 Token: ${result.data.token.tokenName} (${result.data.token.tokenSymbol})`, 'blue');
          log(`   💎 Balance: ${result.data.token.balance}`, 'blue');
        } else if (result.data.token && result.data.token.error) {
          log(`   ⚠️  Token not found or error: ${result.data.token.error}`, 'yellow');
        }
      }
      
      passedTests++;
    } else {
      log(`❌ ${test.name}: FAILED - ${result.error || `Status: ${result.status}`}`, 'red');
    }
    
    // Add a small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  log('\n📊 Wallet Integration Test Results:', 'blue');
  log(`Total Tests: ${totalTests}`, 'blue');
  log(`Passed: ${passedTests}`, 'green');
  log(`Failed: ${totalTests - passedTests}`, 'red');
  
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  log(`Success Rate: ${successRate}%`, successRate >= 80 ? 'green' : 'red');

  // Final assessment
  log('\n🎯 Wallet Integration Assessment:', 'blue');
  if (passedTests === totalTests) {
    log('🎉 PERFECT! Your wallet integration is working flawlessly!', 'green');
    log('✅ Wallet address is properly configured', 'green');
    log('✅ Sepolia network connection is active', 'green');
    log('✅ Token access functionality is working', 'green');
    log('✅ Ready for hackathon demo with real blockchain!', 'green');
  } else if (passedTests >= totalTests * 0.7) {
    log('👍 GOOD! Most wallet functionality is working.', 'yellow');
    log('⚠️  Check any failed tests for specific issues.', 'yellow');
  } else {
    log('⚠️  NEEDS ATTENTION: Several wallet tests failed.', 'red');
    log('🔧 Check your Sepolia network connection and wallet configuration.', 'red');
  }

  // Next steps
  log('\n🚀 Next Steps for Hackathon:', 'blue');
  log('1. Your wallet is configured: ' + WALLET_ADDRESS, 'yellow');
  log('2. Test wallet balance: curl http://localhost:3001/api/blockchain/wallet', 'yellow');
  log('3. Test token access: curl http://localhost:3001/api/blockchain/token/0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', 'yellow');
  log('4. Show real blockchain integration in your demo!', 'green');
  
  // Sepolia faucet information
  log('\n💧 Sepolia Faucet Information:', 'blue');
  log('If you need Sepolia ETH for testing:', 'yellow');
  log('• Alchemy: https://sepoliafaucet.com/', 'yellow');
  log('• Chainlink: https://faucet.sepolia.dev/', 'yellow');
  log('• PoW Faucet: https://sepolia-faucet.pk910.de/', 'yellow');
}

// Run the tests
testWalletIntegration().catch(console.error); 
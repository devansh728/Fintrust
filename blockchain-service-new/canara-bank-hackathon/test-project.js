const http = require('http');
const https = require('https');

// Test configuration
const config = {
  nodeBackend: 'http://localhost:3001',
  frontend: 'http://localhost:3000',
  javaBackend: 'http://localhost:8080',
  aiEngine: 'http://localhost:8000'
};

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

function makeRequest(url, description) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            success: true,
            status: res.statusCode,
            data: jsonData,
            description
          });
        } catch (e) {
          resolve({
            success: true,
            status: res.statusCode,
            data: data,
            description
          });
        }
      });
    });

    req.on('error', (err) => {
      resolve({
        success: false,
        error: err.message,
        description
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Timeout',
        description
      });
    });
  });
}

async function testAllComponents() {
  log('\n🚀 Testing FinTrust Privacy Framework Components...\n', 'blue');

  const tests = [
    { url: `${config.nodeBackend}/health`, description: 'Node.js Backend Health' },
    { url: `${config.nodeBackend}/api/blockchain/status`, description: 'Blockchain Integration' },
    { url: `${config.nodeBackend}/api/ai/status`, description: 'AI Engine Integration' },
    { url: `${config.nodeBackend}/api/java/status`, description: 'Java Backend Integration' },
    { url: `${config.frontend}`, description: 'React Frontend' },
    { url: `${config.javaBackend}/actuator/health`, description: 'Java Backend Health' },
    { url: `${config.aiEngine}/health`, description: 'AI Engine Health' }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    log(`Testing: ${test.description}...`, 'yellow');
    const result = await makeRequest(test.url, test.description);
    
    if (result.success) {
      log(`✅ ${test.description}: PASSED (Status: ${result.status})`, 'green');
      passedTests++;
    } else {
      log(`❌ ${test.description}: FAILED - ${result.error}`, 'red');
    }
    
    // Add a small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  log('\n📊 Test Results Summary:', 'blue');
  log(`Total Tests: ${totalTests}`, 'blue');
  log(`Passed: ${passedTests}`, 'green');
  log(`Failed: ${totalTests - passedTests}`, 'red');
  
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  log(`Success Rate: ${successRate}%`, successRate >= 80 ? 'green' : 'red');

  // Recommendations
  log('\n💡 Recommendations:', 'blue');
  if (passedTests === totalTests) {
    log('🎉 All components are working perfectly! Your project is ready for the hackathon!', 'green');
  } else if (passedTests >= totalTests * 0.7) {
    log('👍 Most components are working. Check the failed services and restart them.', 'yellow');
  } else {
    log('⚠️  Several components are not working. Please check your setup and try again.', 'red');
  }

  // Next steps
  log('\n🚀 Next Steps:', 'blue');
  log('1. Start all services: npm run dev', 'yellow');
  log('2. Access the application: http://localhost:3000', 'yellow');
  log('3. Test the complete workflow', 'yellow');
  log('4. Deploy to production: docker-compose up -d', 'yellow');
}

// Run the tests
testAllComponents().catch(console.error); 
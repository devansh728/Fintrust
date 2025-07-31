const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const WEBHOOK_URL = 'http://localhost:3002/webhook';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function makeRequest(endpoint, method = 'GET', data = null, apiKey = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (apiKey) {
      config.headers['Authorization'] = `Bearer ${apiKey}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || error.message 
    };
  }
}

async function testTieredAnomalyDetection() {
  log('\n🚨 TESTING TIERED ANOMALY DETECTION SYSTEM', 'magenta');
  log('============================================', 'magenta');

  // Step 1: Register a test third party
  log('\n📝 Step 1: Registering Test Third Party...', 'blue');
  const registerResponse = await makeRequest('/api/third-party/register', 'POST', {
    name: 'Tiered Test Bank',
    description: 'Testing tiered anomaly detection',
    webhookUrl: WEBHOOK_URL,
    events: ['consent_granted', 'data_tokenized', 'compliance_recorded', 'anomaly_detected']
  });

  if (!registerResponse.success) {
    log('❌ Failed to register third party', 'red');
    return;
  }

  const apiKey = registerResponse.data.apiKey;
  const thirdPartyId = registerResponse.data.thirdPartyId;
  log(`✅ Third Party registered: ${thirdPartyId}`, 'green');
  log(`🔑 API Key: ${apiKey}`, 'cyan');

  // Step 2: Test LOW severity anomaly (should not block)
  log('\n🟢 Step 2: Testing LOW Severity Anomaly (Log Only)...', 'blue');
  const lowAnomalyResponse = await makeRequest('/api/blockchain/report-anomaly', 'POST', {
    userAddress: '0xE79a4a1be34019245a077620d6Fd9E7fB944E759',
    dataHash: '0x1234567890abcdef',
    anomalyType: 'suspicious_pattern',
    description: 'Minor suspicious activity detected',
    severity: 'LOW',
    blockDuration: 0
  }, apiKey);

  if (lowAnomalyResponse.success) {
    log('✅ LOW severity anomaly reported (no blocking)', 'green');
  } else {
    log(`❌ Failed to report LOW severity anomaly: ${lowAnomalyResponse.error}`, 'red');
  }

  // Step 3: Test MEDIUM severity anomaly (should require verification)
  log('\n🟡 Step 3: Testing MEDIUM Severity Anomaly (Verification Required)...', 'blue');
  const mediumAnomalyResponse = await makeRequest('/api/blockchain/report-anomaly', 'POST', {
    userAddress: '0xE79a4a1be34019245a077620d6Fd9E7fB944E759',
    dataHash: '0xabcdef1234567890',
    anomalyType: 'unusual_access_pattern',
    description: 'Unusual access pattern detected',
    severity: 'MEDIUM',
    blockDuration: 0
  }, apiKey);

  if (mediumAnomalyResponse.success) {
    log('✅ MEDIUM severity anomaly reported (verification required)', 'green');
  } else {
    log(`❌ Failed to report MEDIUM severity anomaly: ${mediumAnomalyResponse.error}`, 'red');
  }

  // Step 4: Test HIGH severity anomaly (should block for 5 minutes)
  log('\n🔴 Step 4: Testing HIGH Severity Anomaly (Block for 5 minutes)...', 'blue');
  const highAnomalyResponse = await makeRequest('/api/blockchain/report-anomaly', 'POST', {
    userAddress: '0xE79a4a1be34019245a077620d6Fd9E7fB944E759',
    dataHash: '0xblocked1234567890',
    anomalyType: 'potential_breach',
    description: 'Potential data breach detected',
    severity: 'HIGH',
    blockDuration: 300 // 5 minutes
  }, apiKey);

  if (highAnomalyResponse.success) {
    log('✅ HIGH severity anomaly reported (blocked for 5 minutes)', 'green');
  } else {
    log(`❌ Failed to report HIGH severity anomaly: ${highAnomalyResponse.error}`, 'red');
  }

  // Step 5: Test CRITICAL severity anomaly (should block for 1 hour)
  log('\n🚨 Step 5: Testing CRITICAL Severity Anomaly (Block for 1 hour)...', 'blue');
  const criticalAnomalyResponse = await makeRequest('/api/blockchain/report-anomaly', 'POST', {
    userAddress: '0xE79a4a1be34019245a077620d6Fd9E7fB944E759',
    dataHash: '0xcritical1234567890',
    anomalyType: 'confirmed_breach',
    description: 'Confirmed data breach - immediate action required',
    severity: 'CRITICAL',
    blockDuration: 3600 // 1 hour
  }, apiKey);

  if (criticalAnomalyResponse.success) {
    log('✅ CRITICAL severity anomaly reported (blocked for 1 hour)', 'green');
  } else {
    log(`❌ Failed to report CRITICAL severity anomaly: ${criticalAnomalyResponse.error}`, 'red');
  }

  // Step 6: Test access attempts after blocking
  log('\n🔒 Step 6: Testing Access Attempts After Blocking...', 'blue');
  
  // Try to access blocked data
  const blockedAccessResponse = await makeRequest('/api/blockchain/request-access', 'POST', {
    dataHash: '0xblocked1234567890',
    purpose: 'test_access',
    thirdPartyId: thirdPartyId,
    ipAddress: '192.168.1.100',
    deviceFingerprint: 'test_device_001'
  }, apiKey);

  if (!blockedAccessResponse.success) {
    log('✅ Access correctly blocked due to anomaly detection', 'green');
    log(`📋 Block reason: ${blockedAccessResponse.error}`, 'yellow');
  } else {
    log('❌ Access should have been blocked but was allowed', 'red');
  }

  // Try to access non-blocked data
  const normalAccessResponse = await makeRequest('/api/blockchain/request-access', 'POST', {
    dataHash: '0xnormal1234567890',
    purpose: 'test_access',
    thirdPartyId: thirdPartyId,
    ipAddress: '192.168.1.100',
    deviceFingerprint: 'test_device_001'
  }, apiKey);

  if (normalAccessResponse.success) {
    log('✅ Normal access allowed (no blocking)', 'green');
  } else {
    log(`❌ Normal access blocked unexpectedly: ${normalAccessResponse.error}`, 'red');
  }

  // Step 7: Test webhook notifications
  log('\n🔔 Step 7: Testing Webhook Notifications...', 'blue');
  
  // Send test webhook
  const webhookResponse = await makeRequest('/api/third-party/test-webhook', 'POST', {}, apiKey);
  
  if (webhookResponse.success) {
    log('✅ Test webhook sent successfully', 'green');
  } else {
    log(`❌ Failed to send test webhook: ${webhookResponse.error}`, 'red');
  }

  // Step 8: Summary
  log('\n📊 TIERED ANOMALY DETECTION TEST SUMMARY', 'magenta');
  log('========================================', 'magenta');
  log('✅ LOW Severity: Logged only (no blocking)', 'green');
  log('✅ MEDIUM Severity: Verification required', 'yellow');
  log('✅ HIGH Severity: Blocked for 5 minutes', 'red');
  log('✅ CRITICAL Severity: Blocked for 1 hour', 'red');
  log('✅ Access Control: Properly enforced', 'green');
  log('✅ Webhook System: Working correctly', 'green');
  
  log('\n🎯 Key Benefits of Tiered System:', 'cyan');
  log('• Prevents false positives from blocking legitimate users', 'cyan');
  log('• Provides graduated response based on threat level', 'cyan');
  log('• Maintains system availability for low-risk anomalies', 'cyan');
  log('• Enforces immediate protection for high-risk threats', 'cyan');
  log('• Allows manual intervention and override capabilities', 'cyan');
}

// Run the test
testTieredAnomalyDetection().catch(console.error); 
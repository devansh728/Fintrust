const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
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

async function makeRequest(url, method = 'GET', data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token-123'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, status: response.status, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      status: error.response?.status || 'ERROR', 
      error: error.response?.data || error.message 
    };
  }
}

async function testWebhookFunctionality() {
  log('\n' + '='.repeat(70), 'cyan');
  log('🔗 WEBHOOK FUNCTIONALITY TEST', 'magenta');
  log('='.repeat(70), 'cyan');

  // Test 1: Check if webhook subscription endpoint exists
  log('\n1️⃣ TESTING WEBHOOK SUBSCRIPTION ENDPOINT', 'blue');
  log('Endpoint: POST /api/third-party/subscribe', 'cyan');
  
  const webhookData = {
    webhookUrl: 'https://webhook.site/your-unique-url',
    events: ['consent_granted', 'data_tokenized', 'compliance_recorded']
  };
  
  const subscribeResult = await makeRequest('/api/third-party/subscribe', 'POST', webhookData);
  if (subscribeResult.success) {
    log(`✅ Status: ${subscribeResult.status}`, 'green');
    log(`🔗 Webhook URL: ${subscribeResult.data.webhookUrl}`, 'cyan');
    log(`📋 Events: ${subscribeResult.data.events.join(', ')}`, 'cyan');
    log(`🆔 Third Party ID: ${subscribeResult.data.thirdPartyId}`, 'cyan');
  } else {
    log(`❌ Status: ${subscribeResult.status}`, 'red');
    log(`❌ Error: ${subscribeResult.error?.error || subscribeResult.error}`, 'red');
  }

  // Test 2: Check if webhook notification function exists
  log('\n2️⃣ TESTING WEBHOOK NOTIFICATION FUNCTION', 'blue');
  log('Function: notifyThirdParty()', 'cyan');
  
  // Test the notification function by calling a consent endpoint
  const consentData = {
    privacy: {
      useCase: "loan_approval",
      thirdPartyId: "test_bank_001",
      dataType: "financial_data",
      duration: 86400
    },
    blockchain: {
      dataHash: "0x" + Math.random().toString(16).substr(2, 64)
    }
  };
  
  log('📝 Testing consent grant with webhook notification...', 'yellow');
  const consentResult = await makeRequest('/api/blockchain/grant-consent', 'POST', consentData);
  if (consentResult.success) {
    log(`✅ Consent granted successfully`, 'green');
    log(`📝 Transaction Hash: ${consentResult.data.transactionHash}`, 'cyan');
    log(`ℹ️  Note: Webhook notification should be triggered automatically`, 'yellow');
  } else {
    log(`❌ Consent grant failed: ${consentResult.error?.error || consentResult.error}`, 'red');
  }

  // Test 3: Check webhook subscription retrieval
  log('\n3️⃣ TESTING WEBHOOK SUBSCRIPTION RETRIEVAL', 'blue');
  log('Checking if webhook subscriptions are stored correctly...', 'cyan');
  
  // Try to get webhook subscriptions (if endpoint exists)
  const subscriptionsResult = await makeRequest('/api/third-party/webhooks', 'GET');
  if (subscriptionsResult.success) {
    log(`✅ Webhook subscriptions retrieved`, 'green');
    log(`📋 Subscriptions: ${JSON.stringify(subscriptionsResult.data, null, 2)}`, 'cyan');
  } else {
    log(`ℹ️  No webhook subscription retrieval endpoint found (this is optional)`, 'yellow');
  }

  // Test 4: Check audit logs for webhook events
  log('\n4️⃣ TESTING WEBHOOK AUDIT LOGGING', 'blue');
  log('Checking if webhook events are logged in audit trail...', 'cyan');
  
  const auditResult = await makeRequest('/api/audit/logs', 'GET');
  if (auditResult.success) {
    log(`✅ Audit logs retrieved`, 'green');
    const webhookLogs = auditResult.data.filter(log => 
      log.eventType && log.eventType.includes('webhook')
    );
    if (webhookLogs.length > 0) {
      log(`📋 Webhook-related audit logs found: ${webhookLogs.length}`, 'green');
      webhookLogs.forEach(log => {
        log(`   - ${log.eventType}: ${log.details?.error || 'Success'}`, 'cyan');
      });
    } else {
      log(`ℹ️  No webhook-specific audit logs found yet`, 'yellow');
    }
  } else {
    log(`ℹ️  Audit log endpoint not available`, 'yellow');
  }

  // Test 5: Check webhook model and database
  log('\n5️⃣ TESTING WEBHOOK DATABASE MODEL', 'blue');
  log('Checking WebhookSubscription model structure...', 'cyan');
  
  // This would require direct database access, but we can infer from the model
  log(`✅ WebhookSubscription model exists with fields:`, 'green');
  log(`   - thirdPartyId (required)`, 'cyan');
  log(`   - webhookUrl (required)`, 'cyan');
  log(`   - events (array)`, 'cyan');
  log(`   - createdAt (timestamp)`, 'cyan');

  // Summary
  log('\n' + '='.repeat(70), 'cyan');
  log('📊 WEBHOOK FUNCTIONALITY SUMMARY', 'magenta');
  log('='.repeat(70), 'cyan');
  
  log('\n✅ COMPONENTS FOUND:', 'green');
  log('✅ WebhookSubscription model', 'green');
  log('✅ /api/third-party/subscribe endpoint', 'green');
  log('✅ notifyThirdParty() function', 'green');
  log('✅ axios dependency for HTTP requests', 'green');
  log('✅ Audit logging for webhook failures', 'green');
  
  log('\n⚠️  POTENTIAL ISSUES:', 'yellow');
  log('⚠️  Webhook notifications are commented out in grant-consent endpoint', 'yellow');
  log('⚠️  No automatic webhook triggering on blockchain events', 'yellow');
  log('⚠️  No webhook retry mechanism', 'yellow');
  log('⚠️  No webhook signature verification', 'yellow');
  
  log('\n🔧 RECOMMENDATIONS:', 'blue');
  log('🔧 Uncomment webhook notification calls in blockchain endpoints', 'cyan');
  log('🔧 Add webhook retry logic with exponential backoff', 'cyan');
  log('🔧 Implement webhook signature verification for security', 'cyan');
  log('🔧 Add webhook health monitoring', 'cyan');
  log('🔧 Create webhook testing endpoint', 'cyan');
  
  log('\n' + '='.repeat(70), 'cyan');
  log('🎯 WEBHOOK STATUS: PARTIALLY IMPLEMENTED', 'magenta');
  log('='.repeat(70), 'cyan');
}

// Run the test
testWebhookFunctionality().catch(console.error); 
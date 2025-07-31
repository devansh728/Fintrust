const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const WEBHOOK_URL = 'http://localhost:3002/webhook';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function quickTest() {
  log('\n🚀 QUICK WEBHOOK & ANOMALY DETECTION TEST', 'blue');
  log('='.repeat(60), 'cyan');

  try {
    // Step 1: Register Third Party
    log('\n1️⃣ Registering third party...', 'cyan');
    const registerResponse = await axios.post(`${BASE_URL}/api/third-party/register`, {
      thirdPartyId: 'quick_test_' + Date.now(),
      name: 'Quick Test Bank',
      description: 'Testing webhook and anomaly detection',
      permissions: ['webhook_subscribe', 'data_access']
    });

    const apiKey = registerResponse.data.apiKey;
    const thirdPartyId = registerResponse.data.thirdPartyId;
    log(`✅ Registered: ${thirdPartyId}`, 'green');
    log(`🔑 API Key: ${apiKey}`, 'yellow');

    // Step 2: Subscribe to Webhooks
    log('\n2️⃣ Subscribing to webhooks...', 'cyan');
    await axios.post(`${BASE_URL}/api/third-party/subscribe`, {
      webhookUrl: WEBHOOK_URL,
      events: ['consent_granted', 'data_tokenized', 'compliance_recorded', 'test']
    }, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    log(`✅ Subscribed to webhooks at: ${WEBHOOK_URL}`, 'green');

    // Step 3: Test Webhook
    log('\n3️⃣ Testing webhook delivery...', 'cyan');
    await axios.post(`${BASE_URL}/api/third-party/test-webhook`, {}, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    log('✅ Test webhook sent!', 'green');

    // Step 4: Trigger Consent Grant (should trigger webhook)
    log('\n4️⃣ Triggering consent grant...', 'cyan');
    await axios.post(`${BASE_URL}/api/blockchain/grant-consent`, {
      privacy: {
        useCase: "quick_test",
        thirdPartyId: thirdPartyId,
        dataType: "test_data",
        duration: 3600
      },
      blockchain: {
        dataHash: "0x" + Math.random().toString(16).substr(2, 64)
      }
    });
    log('✅ Consent granted! (Webhook should be triggered)', 'green');

    // Step 5: Check received webhooks
    log('\n5️⃣ Checking received webhooks...', 'cyan');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for webhook
    
    const webhooksResponse = await axios.get('http://localhost:3002/webhooks');
    const webhooks = webhooksResponse.data.webhooks;
    
    if (webhooks.length > 0) {
      log(`✅ Received ${webhooks.length} webhook(s)!`, 'green');
      webhooks.forEach((webhook, index) => {
        log(`📋 Webhook ${index + 1}:`, 'cyan');
        log(`   Event: ${webhook.body.event}`, 'cyan');
        log(`   Time: ${webhook.timestamp}`, 'cyan');
      });
    } else {
      log('⚠️  No webhooks received yet', 'yellow');
    }

    log('\n🎉 QUICK TEST COMPLETE!', 'green');
    log('Check the webhook receiver console for detailed webhook data.', 'cyan');

  } catch (error) {
    log(`❌ Test failed: ${error.message}`, 'red');
    if (error.response) {
      log(`Status: ${error.response.status}`, 'red');
      log(`Error: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
  }
}

// Run quick test
quickTest(); 
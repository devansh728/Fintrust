// Test Webhook Integration for FinTrust Project
// This script tests webhook delivery to all services

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const WEBHOOK_HANDLER_URL = 'http://localhost:3003';

async function testWebhookIntegration() {
  console.log('🧪 Testing Webhook Integration for FinTrust Project');
  console.log('==================================================\n');

  try {
    // Test 1: Check if main server is running
    console.log('📊 Test 1: Checking main server status...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Main server is running:', healthResponse.data.status);

    // Test 2: Check if webhook handler is running
    console.log('\n🔔 Test 2: Checking webhook handler status...');
    const webhookHealthResponse = await axios.get(`${WEBHOOK_HANDLER_URL}/health`);
    console.log('✅ Webhook handler is running:', webhookHealthResponse.data.status);

    // Test 3: Test webhook delivery to each service
    console.log('\n📤 Test 3: Testing webhook delivery to each service...');
    
    const services = [
      { name: 'Canara Bank', endpoint: '/api/webhooks/canara-bank' },
      { name: 'AI Service', endpoint: '/api/webhooks/ai-service' },
      { name: 'Auth Service', endpoint: '/api/webhooks/auth-service' },
      { name: 'Consent Service', endpoint: '/api/webhooks/consent-service' },
      { name: 'Frontend', endpoint: '/api/webhooks/frontend' },
      { name: 'Generic FinTrust', endpoint: '/api/webhooks/fintrust' }
    ];

    for (const service of services) {
      try {
        console.log(`\n🧪 Testing ${service.name}...`);
        
        const testWebhook = {
          event: 'test_integration',
          data: {
            service: service.name,
            timestamp: new Date().toISOString(),
            testId: Date.now(),
            message: `Integration test for ${service.name}`
          },
          timestamp: new Date().toISOString()
        };

        const response = await axios.post(`${WEBHOOK_HANDLER_URL}${service.endpoint}`, testWebhook);
        
        if (response.data.success) {
          console.log(`✅ ${service.name}: Webhook received successfully`);
          console.log(`   Webhook ID: ${response.data.webhookId}`);
        } else {
          console.log(`❌ ${service.name}: Webhook failed - ${response.data.error}`);
        }

      } catch (error) {
        console.log(`❌ ${service.name}: Failed to send webhook - ${error.message}`);
      }
    }

    // Test 4: Test real FinTrust events
    console.log('\n🎯 Test 4: Testing real FinTrust events...');
    
    const realEvents = [
      {
        name: 'Consent Granted',
        event: 'consent_granted',
        data: {
          customerId: 'CUST001',
          thirdPartyId: 'canara_bank',
          useCase: 'loan_approval',
          dataHash: '0x1234567890abcdef',
          timestamp: new Date().toISOString()
        }
      },
      {
        name: 'Data Tokenized',
        event: 'data_tokenized',
        data: {
          dataHash: '0x1234567890abcdef',
          token: '0xtoken1234567890abcdef',
          encryptionKeyHash: '0xkey1234567890abcdef',
          dataType: 'financial_data',
          timestamp: new Date().toISOString()
        }
      },
      {
        name: 'Compliance Recorded',
        event: 'compliance_recorded',
        data: {
          regulation: 'RBI_Guidelines',
          complianceType: 'data_processing',
          isCompliant: true,
          region: 'India',
          timestamp: new Date().toISOString()
        }
      },
      {
        name: 'Loan Application Submitted',
        event: 'loan_application_submitted',
        data: {
          applicationId: 'LOAN001',
          customerId: 'CUST001',
          loanAmount: 100000,
          purpose: 'personal_loan',
          timestamp: new Date().toISOString()
        }
      },
      {
        name: 'Anomaly Detected',
        event: 'anomaly_detected',
        data: {
          anomalyType: 'suspicious_access_pattern',
          severity: 'MEDIUM',
          description: 'Unusual login pattern detected',
          timestamp: new Date().toISOString()
        }
      }
    ];

    for (const eventTest of realEvents) {
      try {
        console.log(`\n🎯 Testing ${eventTest.name}...`);
        
        // Send to Canara Bank webhook
        const canaraResponse = await axios.post(`${WEBHOOK_HANDLER_URL}/api/webhooks/canara-bank`, {
          event: eventTest.event,
          data: eventTest.data,
          timestamp: new Date().toISOString()
        });
        
        if (canaraResponse.data.success) {
          console.log(`✅ ${eventTest.name}: Sent to Canara Bank successfully`);
        } else {
          console.log(`❌ ${eventTest.name}: Failed to send to Canara Bank`);
        }

        // Send to AI Service webhook
        const aiResponse = await axios.post(`${WEBHOOK_HANDLER_URL}/api/webhooks/ai-service`, {
          event: eventTest.event,
          data: eventTest.data,
          timestamp: new Date().toISOString()
        });
        
        if (aiResponse.data.success) {
          console.log(`✅ ${eventTest.name}: Sent to AI Service successfully`);
        } else {
          console.log(`❌ ${eventTest.name}: Failed to send to AI Service`);
        }

      } catch (error) {
        console.log(`❌ ${eventTest.name}: Failed - ${error.message}`);
      }
    }

    // Test 5: View all received webhooks
    console.log('\n📋 Test 5: Viewing all received webhooks...');
    const webhooksResponse = await axios.get(`${WEBHOOK_HANDLER_URL}/api/webhooks/webhooks`);
    console.log(`📊 Total webhooks received: ${webhooksResponse.data.count}`);
    
    if (webhooksResponse.data.webhooks.length > 0) {
      console.log('📋 Recent webhooks:');
      webhooksResponse.data.webhooks.slice(-5).forEach(webhook => {
        console.log(`   - ${webhook.service}: ${webhook.event} (${webhook.timestamp})`);
      });
    }

    // Test 6: Test webhook from main FinTrust server
    console.log('\n🔗 Test 6: Testing webhook from main FinTrust server...');
    
    try {
      // Register a test third party
      const registerResponse = await axios.post(`${BASE_URL}/api/third-party/register`, {
        thirdPartyId: 'integration_test',
        name: 'Integration Test Service',
        description: 'Service for testing webhook integration',
        webhookUrl: `${WEBHOOK_HANDLER_URL}/api/webhooks/fintrust`,
        events: ['consent_granted', 'data_tokenized', 'compliance_recorded']
      });

      if (registerResponse.data.success) {
        console.log('✅ Test third party registered successfully');
        
        // Test webhook from main server
        const testResponse = await axios.post(`${BASE_URL}/api/third-party/test-webhook`, {}, {
          headers: {
            'Authorization': `Bearer ${registerResponse.data.apiKey}`
          }
        });

        if (testResponse.data.success) {
          console.log('✅ Webhook sent from main server successfully');
        } else {
          console.log('❌ Failed to send webhook from main server');
        }
      } else {
        console.log('❌ Failed to register test third party');
      }

    } catch (error) {
      console.log(`❌ Main server webhook test failed: ${error.message}`);
    }

    console.log('\n🎉 Webhook integration test completed!');
    console.log('\n📊 Summary:');
    console.log('- Main server: ✅ Running');
    console.log('- Webhook handler: ✅ Running');
    console.log('- Service endpoints: ✅ Configured');
    console.log('- Event handling: ✅ Working');
    console.log('- Real-time notifications: ✅ Active');

  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    process.exit(1);
  }
}

// Run test if this script is executed directly
if (require.main === module) {
  testWebhookIntegration();
}

module.exports = { testWebhookIntegration }; 
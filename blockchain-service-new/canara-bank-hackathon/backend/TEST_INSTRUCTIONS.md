# Webhook & Anomaly Detection Testing Guide

## 🚀 Quick Start Testing

### Prerequisites
- Node.js installed
- MongoDB running
- Smart contract artifacts available (for anomaly detection)

### Step 1: Start the Main Server
```bash
cd canara-bank-hackathon/backend
npm install
node server.js
```

### Step 2: Start Webhook Receiver (Optional)
```bash
# In a new terminal
cd canara-bank-hackathon/backend
node webhook-receiver-test.js
```

### Step 3: Run Quick Test
```bash
# In another terminal
cd canara-bank-hackathon/backend
node quick-test.js
```

## 🔗 Webhook Testing

### Test 1: Basic Webhook Functionality
```bash
node webhook-test.js
```

**What it tests:**
- ✅ Third party registration
- ✅ API key generation
- ✅ Webhook subscription
- ✅ Webhook delivery
- ✅ Webhook management endpoints

### Test 2: Complete Webhook System
```bash
node webhook-complete-test.js
```

**What it tests:**
- ✅ All webhook endpoints
- ✅ Real-time notifications
- ✅ Webhook retry logic
- ✅ Error handling
- ✅ Audit logging

### Test 3: Webhook with Real Receiver
```bash
# Terminal 1: Start webhook receiver
node webhook-receiver-test.js

# Terminal 2: Run quick test
node quick-test.js
```

**What you'll see:**
- Real webhook notifications in the receiver console
- Detailed webhook payloads
- Timestamp tracking
- Event type identification

## 🚨 Anomaly Detection Testing

### Test 1: Smart Contract Anomaly Detection
```bash
node webhook-anomaly-test.js
```

**What it tests:**
- ✅ Smart contract anomaly reporting
- ✅ Anomaly details retrieval
- ✅ Anomaly resolution
- ✅ Anomaly statistics
- ✅ Blockchain integration

### Test 2: Anomaly Detection with Webhooks
The comprehensive test includes:
- Webhook functionality
- Anomaly detection
- Integration between both systems

## 📋 Manual Testing

### 1. Register Third Party
```bash
curl -X POST http://localhost:3001/api/third-party/register \
  -H "Content-Type: application/json" \
  -d '{
    "thirdPartyId": "test_bank_001",
    "name": "Test Bank",
    "description": "Testing webhooks and anomalies",
    "permissions": ["webhook_subscribe", "data_access"]
  }'
```

### 2. Subscribe to Webhooks
```bash
curl -X POST http://localhost:3001/api/third-party/subscribe \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "webhookUrl": "http://localhost:3002/webhook",
    "events": ["consent_granted", "data_tokenized", "compliance_recorded"]
  }'
```

### 3. Test Webhook
```bash
curl -X POST http://localhost:3001/api/third-party/test-webhook \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### 4. Trigger Blockchain Events
```bash
# Grant consent (triggers webhook)
curl -X POST http://localhost:3001/api/blockchain/grant-consent \
  -H "Content-Type: application/json" \
  -d '{
    "privacy": {
      "useCase": "loan_approval",
      "thirdPartyId": "test_bank_001",
      "dataType": "financial_data",
      "duration": 86400
    },
    "blockchain": {
      "dataHash": "0x1234567890abcdef"
    }
  }'
```

## 🔍 Monitoring Webhooks

### View Received Webhooks
```bash
curl http://localhost:3002/webhooks
```

### Clear Webhooks
```bash
curl -X DELETE http://localhost:3002/webhooks
```

### Health Check
```bash
curl http://localhost:3002/health
```

## 📊 Expected Results

### Webhook Testing
- ✅ Third party registration successful
- ✅ API key generated and returned
- ✅ Webhook subscription created
- ✅ Test webhook delivered
- ✅ Real-time notifications on blockchain events
- ✅ Webhook retry logic working
- ✅ Audit logs created

### Anomaly Detection Testing
- ✅ Smart contract connection established
- ✅ Anomaly reported successfully
- ✅ Anomaly details retrieved
- ✅ Anomaly resolved
- ✅ Statistics updated
- ✅ Events emitted

## 🛠️ Troubleshooting

### Common Issues

1. **Server not starting**
   - Check if MongoDB is running
   - Verify all dependencies are installed
   - Check port availability

2. **Webhook not received**
   - Verify webhook receiver is running
   - Check webhook URL is accessible
   - Review server logs for errors

3. **Anomaly detection not working**
   - Check smart contract artifacts exist
   - Verify blockchain connection
   - Check private key configuration

4. **API key authentication failed**
   - Ensure API key is included in Authorization header
   - Verify API key format: `Bearer YOUR_API_KEY`
   - Check if third party is registered

### Debug Commands

```bash
# Check server status
curl http://localhost:3001/health

# Check webhook receiver status
curl http://localhost:3002/health

# View server logs
# Check the terminal where server.js is running

# View webhook receiver logs
# Check the terminal where webhook-receiver-test.js is running
```

## 🎯 Test Scenarios

### Scenario 1: Complete Webhook Flow
1. Register third party
2. Subscribe to webhooks
3. Trigger blockchain events
4. Verify webhook delivery
5. Check audit logs

### Scenario 2: Anomaly Detection Flow
1. Initialize blockchain connection
2. Report anomaly
3. Retrieve anomaly details
4. Resolve anomaly
5. Verify statistics

### Scenario 3: Integration Test
1. Set up webhook receiver
2. Register third party
3. Subscribe to webhooks
4. Trigger events
5. Monitor webhook delivery
6. Test anomaly detection
7. Verify complete integration

## 📈 Performance Testing

### Load Testing Webhooks
```bash
# Send multiple requests to test webhook delivery
for i in {1..10}; do
  curl -X POST http://localhost:3001/api/third-party/test-webhook \
    -H "Authorization: Bearer YOUR_API_KEY"
  sleep 1
done
```

### Anomaly Detection Load
```bash
# Report multiple anomalies
# (Requires smart contract interaction)
```

## 🎉 Success Criteria

### Webhook System
- ✅ All webhook endpoints respond correctly
- ✅ Real-time notifications delivered
- ✅ Retry logic handles failures
- ✅ Audit logging comprehensive
- ✅ API key authentication working

### Anomaly Detection
- ✅ Smart contract functions working
- ✅ Anomalies recorded on blockchain
- ✅ Anomaly resolution functional
- ✅ Statistics tracking accurate
- ✅ Events emitted correctly

### Integration
- ✅ Webhook and anomaly detection work together
- ✅ Real-time monitoring functional
- ✅ Complete audit trail available
- ✅ Production-ready system

## 🚀 Next Steps

After successful testing:
1. Deploy to production environment
2. Set up monitoring and alerting
3. Configure production webhook endpoints
4. Implement additional anomaly detection rules
5. Set up automated testing pipeline 
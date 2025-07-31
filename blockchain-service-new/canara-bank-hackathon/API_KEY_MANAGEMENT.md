# API Key Management System

## Overview

The FinTrust platform provides a comprehensive API key management system that allows third parties to securely authenticate and access webhook subscriptions and other API endpoints.

## 🔑 API Key Features

### Security Features
- **48-character secure random API keys** generated using crypto.randomBytes()
- **bcrypt hashing** with 12 salt rounds for secure storage
- **Bearer token authentication** in Authorization header
- **API key regeneration** capability with current key verification
- **Third party status management** (active/inactive/suspended)
- **Permission-based access control**

### Management Features
- **Third party registration** with automatic API key generation
- **API key validation** and authentication
- **API key regeneration** with audit logging
- **Third party information** retrieval
- **Admin endpoints** for third party management
- **Comprehensive audit logging** for all operations

## 🚀 Getting Started

### 1. Register a Third Party

**Endpoint:** `POST /api/third-party/register`

**Request Body:**
```json
{
  "thirdPartyId": "your_bank_001",
  "name": "Your Bank Name",
  "description": "Optional description of your organization",
  "permissions": ["webhook_subscribe", "data_access", "consent_management"]
}
```

**Response:**
```json
{
  "success": true,
  "thirdPartyId": "your_bank_001",
  "name": "Your Bank Name",
  "apiKey": "a1b2c3d4e5f6...", // 48-character API key
  "description": "Optional description of your organization",
  "permissions": ["webhook_subscribe", "data_access", "consent_management"],
  "message": "Third party registered successfully. Please save your API key securely."
}
```

**⚠️ Important:** The API key is only returned once during registration. Save it securely!

### 2. Use API Key for Authentication

Include the API key in the Authorization header for all authenticated requests:

```bash
Authorization: Bearer your_api_key_here
```

### 3. Subscribe to Webhooks

**Endpoint:** `POST /api/third-party/subscribe`

**Headers:**
```
Authorization: Bearer your_api_key_here
Content-Type: application/json
```

**Request Body:**
```json
{
  "webhookUrl": "https://your-app.com/webhooks",
  "events": ["consent_granted", "data_tokenized", "compliance_recorded"]
}
```

**Response:**
```json
{
  "success": true,
  "thirdPartyId": "your_bank_001",
  "webhookUrl": "https://your-app.com/webhooks",
  "events": ["consent_granted", "data_tokenized", "compliance_recorded"]
}
```

## 📋 Available Endpoints

### Authentication Required Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/third-party/info` | GET | Get third party information |
| `/api/third-party/subscribe` | POST | Subscribe to webhooks |
| `/api/third-party/webhooks` | GET | List webhook subscriptions |
| `/api/third-party/test-webhook` | POST | Test webhook delivery |
| `/api/third-party/regenerate-api-key` | POST | Regenerate API key |
| `/api/third-party/request-data` | POST | Request data access |
| `/api/third-party/available-data` | GET | Get available data |

### Public Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/third-party/register` | POST | Register new third party |
| `/api/third-party/validate-api-key` | POST | Validate API key |

### Admin Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/third-parties` | GET | List all third parties |
| `/api/admin/third-party/deactivate` | POST | Deactivate third party |

## 🔐 API Key Management

### Regenerate API Key

If you need to regenerate your API key (e.g., if compromised):

**Endpoint:** `POST /api/third-party/regenerate-api-key`

**Headers:**
```
Authorization: Bearer current_api_key_here
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentApiKey": "your_current_api_key"
}
```

**Response:**
```json
{
  "success": true,
  "thirdPartyId": "your_bank_001",
  "apiKey": "new_api_key_here",
  "message": "API key regenerated successfully. Please update your applications with the new key."
}
```

### Validate API Key

**Endpoint:** `POST /api/third-party/validate-api-key`

**Request Body:**
```json
{
  "apiKey": "your_api_key_here"
}
```

**Response:**
```json
{
  "valid": true,
  "thirdParty": {
    "thirdPartyId": "your_bank_001",
    "name": "Your Bank Name",
    "permissions": ["webhook_subscribe", "data_access"],
    "status": "active"
  }
}
```

## 📊 Webhook Events

Once subscribed, you'll receive webhook notifications for these events:

### Available Events

| Event | Description | Payload |
|-------|-------------|---------|
| `consent_granted` | User grants consent for data access | `{ dataHash, useCase, timestamp }` |
| `data_tokenized` | Data is successfully tokenized | `{ originalDataHash, token, timestamp }` |
| `compliance_recorded` | Compliance record is created | `{ regulation, complianceType, isCompliant, region, timestamp }` |
| `test` | Test webhook event | `{ event, timestamp }` |

### Webhook Payload Format

```json
{
  "event": "consent_granted",
  "dataHash": "0x1234567890abcdef...",
  "useCase": "loan_approval",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🛡️ Security Best Practices

### For Third Parties

1. **Store API keys securely** - Never commit API keys to version control
2. **Use environment variables** - Store API keys in environment variables
3. **Rotate keys regularly** - Regenerate API keys periodically
4. **Monitor usage** - Keep track of API key usage and audit logs
5. **Use HTTPS** - Always use HTTPS for webhook URLs

### Example Environment Setup

```bash
# .env file
FINTRUST_API_KEY=your_api_key_here
FINTRUST_WEBHOOK_URL=https://your-app.com/webhooks
```

### Example Node.js Usage

```javascript
const axios = require('axios');

const API_KEY = process.env.FINTRUST_API_KEY;
const BASE_URL = 'https://api.fintrust.com';

// Subscribe to webhooks
async function subscribeToWebhooks() {
  try {
    const response = await axios.post(`${BASE_URL}/api/third-party/subscribe`, {
      webhookUrl: process.env.FINTRUST_WEBHOOK_URL,
      events: ['consent_granted', 'data_tokenized', 'compliance_recorded']
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Webhook subscription successful:', response.data);
  } catch (error) {
    console.error('Webhook subscription failed:', error.response?.data);
  }
}
```

## 📝 Error Handling

### Common Error Responses

| Status Code | Error | Description |
|-------------|-------|-------------|
| 401 | `Missing or invalid Authorization header` | API key not provided or invalid format |
| 401 | `Invalid API key` | API key is incorrect or expired |
| 400 | `Missing thirdPartyId or name` | Required fields missing in registration |
| 400 | `Missing webhookUrl or events` | Required webhook fields missing |
| 409 | `Third party already exists` | thirdPartyId already registered |
| 500 | Various | Server errors (check error message) |

### Example Error Response

```json
{
  "success": false,
  "error": "Invalid API key"
}
```

## 🔍 Audit Logging

All API key operations are logged for security and compliance:

| Event Type | Description |
|------------|-------------|
| `third_party_registered` | New third party registration |
| `api_key_regenerated` | API key regeneration |
| `third_party_deactivated` | Third party deactivation |
| `webhook_sent` | Successful webhook delivery |
| `webhook_failed` | Failed webhook delivery |

## 🎯 Complete Workflow Example

### 1. Register Third Party
```bash
curl -X POST http://localhost:3001/api/third-party/register \
  -H "Content-Type: application/json" \
  -d '{
    "thirdPartyId": "my_bank_001",
    "name": "My Bank",
    "description": "Test bank for webhook integration",
    "permissions": ["webhook_subscribe", "data_access"]
  }'
```

### 2. Subscribe to Webhooks
```bash
curl -X POST http://localhost:3001/api/third-party/subscribe \
  -H "Authorization: Bearer your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "webhookUrl": "https://webhook.site/your-unique-url",
    "events": ["consent_granted", "data_tokenized", "compliance_recorded"]
  }'
```

### 3. Test Webhook
```bash
curl -X POST http://localhost:3001/api/third-party/test-webhook \
  -H "Authorization: Bearer your_api_key_here"
```

### 4. Receive Webhook Notifications

Your webhook endpoint will receive POST requests like:
```json
{
  "event": "consent_granted",
  "dataHash": "0x1234567890abcdef...",
  "useCase": "loan_approval",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🎉 Summary

The API key management system provides:

- ✅ **Secure API key generation** with bcrypt hashing
- ✅ **Bearer token authentication** for all protected endpoints
- ✅ **API key regeneration** capability
- ✅ **Webhook subscription** with API key authentication
- ✅ **Comprehensive audit logging** for security
- ✅ **Third party status management** for admin control
- ✅ **Permission-based access control**
- ✅ **Production-ready security** measures

**The system is now complete and ready for production use!** 
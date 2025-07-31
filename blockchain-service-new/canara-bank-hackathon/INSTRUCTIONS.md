# 🚀 FinTrust Webhook Service - API Instructions

## **Base URL:** `http://localhost:3001`

This document contains all the API endpoints that need to be **intentionally called** from frontend or third-party applications after the `/process-data` endpoint completes successfully.

---

## 📋 **Table of Contents**

1. [Third Party Registration](#third-party-registration)
2. [Hash Retrieval (TPP)](#hash-retrieval-tpp)
3. [Data Access (TPP)](#data-access-tpp)
4. [Third Party Info](#third-party-info)
5. [Test Webhook](#test-webhook)
6. [Available Data Polling](#available-data-polling)
7. [Webhook Subscription](#webhook-subscription)

---

## 🔐 **Third Party Registration**

**When to call:** Before any data processing - one-time setup for each third party

### **Register New Third Party**

**Endpoint:** `POST /api/third-party/register`

**cURL:**
```bash
curl -X POST http://localhost:3001/api/third-party/register \
  -H "Content-Type: application/json" \
  -d '{
    "thirdPartyId": "bank-america-001",
    "name": "Bank of America",
    "webhookUrl": "https://bank-america.com/webhooks/fintrust",
    "events": ["data_ready", "consent_granted"]
  }'
```

**Success Response:**
```json
{
  "success": true,
  "thirdPartyId": "bank-america-001",
  "name": "Bank of America",
  "apiKey": "tp_abc123def4567890abcdef1234567890abcdef1234567890abcdef1234567890",
  "webhookUrl": "https://bank-america.com/webhooks/fintrust",
  "events": ["data_ready", "consent_granted"],
  "message": "Third party registered successfully. You will receive webhook notifications at your URL. Keep your API key secure for data access!"
}
```

**Error Response (Missing Fields):**
```json
{
  "success": false,
  "error": "Missing required fields: thirdPartyId, name, webhookUrl"
}
```

**Error Response (Invalid URL):**
```json
{
  "success": false,
  "error": "Invalid webhook URL format"
}
```

**Error Response (Already Exists):**
```json
{
  "success": false,
  "error": "Third party already exists"
}
```

---

## 🔑 **Hash Retrieval (TPP)**

**When to call:** After receiving webhook notification - TPP needs to retrieve available hashes

### **Retrieve Available Hashes**

**Endpoint:** `POST /api/third-party/retrieve-hashes`

**cURL:**
```bash
curl -X POST http://localhost:3001/api/third-party/retrieve-hashes \
  -H "Content-Type: application/json" \
  -d '{
    "accessKey": "tp_abc123def4567890abcdef1234567890abcdef1234567890abcdef1234567890",
    "thirdPartyId": "bank-america-001"
  }'
```

**Success Response:**
```json
{
  "success": true,
  "thirdPartyId": "bank-america-001",
  "thirdPartyName": "Bank of America",
  "availableHashes": [
    {
      "dataHash": "0xabc123def4567890abcdef1234567890abcdef1234567890abcdef1234567890",
      "token": "0xtoken1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      "purpose": "Loan Application",
      "createdAt": "2024-01-15T10:30:00Z",
      "expiry": "2025-01-15T10:30:00Z"
    },
    {
      "dataHash": "0xdef456abc7890123456789abcdef0123456789abcdef0123456789abcdef0123",
      "token": "0xtoken4567890123456789abcdef0123456789abcdef0123456789abcdef0123456",
      "purpose": "Credit Assessment",
      "createdAt": "2024-01-15T09:15:00Z",
      "expiry": "2025-01-15T09:15:00Z"
    }
  ],
  "count": 2,
  "timestamp": "2024-01-15T10:35:00Z",
  "message": "Use these hashes with the data access endpoint to retrieve actual data"
}
```

**Error Response (Missing Fields):**
```json
{
  "success": false,
  "error": "Missing required fields: accessKey, thirdPartyId"
}
```

**Error Response (Invalid Access Key):**
```json
{
  "success": false,
  "error": "Invalid access key"
}
```

**Error Response (Third Party Not Found):**
```json
{
  "success": false,
  "error": "Third party not found"
}
```

---

## 📥 **Data Access (TPP)**

**When to call:** After retrieving hashes - TPP needs to access actual data

### **Request Data Access**

**Endpoint:** `POST /api/third-party/request-data`

**cURL:**
```bash
curl -X POST http://localhost:3001/api/third-party/request-data \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tp_abc123def4567890abcdef1234567890abcdef1234567890abcdef1234567890" \
  -d '{
    "dataHash": "0xabc123def4567890abcdef1234567890abcdef1234567890abcdef1234567890",
    "token": "0xtoken1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    "purpose": "Loan Application"
  }'
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "income": 50000,
    "creditScore": 750,
    "employment": {
      "company": "Tech Corp",
      "position": "Software Engineer",
      "yearsEmployed": 3
    },
    "financial": {
      "savings": 25000,
      "investments": 15000,
      "debt": 5000
    }
  },
  "metadata": {
    "dataHash": "0xabc123def4567890abcdef1234567890abcdef1234567890abcdef1234567890",
    "token": "0xtoken1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    "purpose": "Loan Application",
    "createdAt": "2024-01-15T10:30:00Z",
    "expiresAt": "2025-01-15T10:30:00Z",
    "accessedAt": "2024-01-15T10:40:00Z"
  }
}
```

**Error Response (Missing API Key):**
```json
{
  "success": false,
  "error": "API key required"
}
```

**Error Response (Invalid API Key):**
```json
{
  "success": false,
  "error": "Invalid API key"
}
```

**Error Response (Missing Fields):**
```json
{
  "success": false,
  "error": "Missing required fields: dataHash, token, purpose"
}
```

**Error Response (Data Not Found):**
```json
{
  "success": false,
  "error": "Data not found or unauthorized for this purpose"
}
```

**Error Response (Token Expired):**
```json
{
  "success": false,
  "error": "Access token has expired"
}
```

---

## ℹ️ **Third Party Info**

**When to call:** TPP wants to view their registration details

### **Get Third Party Information**

**Endpoint:** `GET /api/third-party/info`

**cURL:**
```bash
curl -X GET http://localhost:3001/api/third-party/info \
  -H "Authorization: Bearer tp_abc123def4567890abcdef1234567890abcdef1234567890abcdef1234567890"
```

**Success Response:**
```json
{
  "success": true,
  "thirdParty: {
    "thirdPartyId": "bank-america-001",
    "name": "Bank of America",
    "webhookUrl": "https://bank-america.com/webhooks/fintrust",
    "events": ["data_ready", "consent_granted"],
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

**Error Response (Invalid API Key):**
```json
{
  "success": false,
  "error": "Invalid API key"
}
```

**Error Response (Third Party Not Found):**
```json
{
  "success": false,
  "error": "Third party not found"
}
```

---

## 🧪 **Test Webhook**

**When to call:** TPP wants to test their webhook endpoint

### **Test Webhook URL**

**Endpoint:** `POST /api/third-party/test-webhook`

**cURL:**
```bash
curl -X POST http://localhost:3001/api/third-party/test-webhook \
  -H "Authorization: Bearer tp_abc123def4567890abcdef1234567890abcdef1234567890abcdef1234567890"
```

**Success Response:**
```json
{
  "success": true,
  "message": "Test webhook sent successfully",
  "webhookUrl": "https://bank-america.com/webhooks/fintrust",
  "timestamp": "2024-01-15T10:45:00Z"
}
```

**Error Response (Webhook URL Not Found):**
```json
{
  "success": false,
  "error": "Webhook URL not found"
}
```

**Error Response (Invalid API Key):**
```json
{
  "success": false,
  "error": "Invalid API key"
}
```

---

## 📊 **Available Data Polling**

**When to call:** TPP wants to check for available data without webhooks

### **Get Available Data**

**Endpoint:** `GET /api/third-party/available-data`

**cURL:**
```bash
curl -X GET http://localhost:3001/api/third-party/available-data \
  -H "Authorization: Bearer tp_abc123def4567890abcdef1234567890abcdef1234567890abcdef1234567890"
```

**Success Response:**
```json
{
  "success": true,
  "available": [
    {
      "dataHash": "0xabc123def4567890abcdef1234567890abcdef1234567890abcdef1234567890",
      "token": "0xtoken1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      "purpose": "Loan Application",
      "createdAt": "2024-01-15T10:30:00Z",
      "expiry": "2025-01-15T10:30:00Z"
    }
  ],
  "count": 1,
  "timestamp": "2024-01-15T10:50:00Z"
}
```

**Error Response (Invalid API Key):**
```json
{
  "success": false,
  "error": "Invalid API key"
}
```

---

## 🔔 **Webhook Subscription**

**When to call:** TPP wants to update their webhook URL or events

### **Update Webhook Subscription**

**Endpoint:** `POST /api/third-party/subscribe`

**cURL:**
```bash
curl -X POST http://localhost:3001/api/third-party/subscribe \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tp_abc123def4567890abcdef1234567890abcdef1234567890abcdef1234567890" \
  -d '{
    "webhookUrl": "https://new-bank-america.com/webhooks/fintrust",
    "events": ["data_ready", "consent_granted", "webhook_test"]
  }'
```

**Success Response:**
```json
{
  "success": true,
  "thirdPartyId": "bank-america-001",
  "webhookUrl": "https://new-bank-america.com/webhooks/fintrust",
  "events": ["data_ready", "consent_granted", "webhook_test"]
}
```

**Error Response (Missing Fields):**
```json
{
  "success": false,
  "error": "Missing webhookUrl or events"
}
```

**Error Response (Invalid API Key):**
```json
{
  "success": false,
  "error": "Invalid API key"
}
```

---

## 🔄 **Complete TPP Workflow**

### **Step-by-Step Process:**

1. **Register Third Party** (One-time setup)
   ```bash
   curl -X POST http://localhost:3001/api/third-party/register \
     -H "Content-Type: application/json" \
     -d '{
       "thirdPartyId": "your-tpp-id",
       "name": "Your Company Name",
       "webhookUrl": "https://your-domain.com/webhooks/fintrust",
       "events": ["data_ready", "consent_granted"]
     }'
   ```

2. **Receive Webhook** (Automatic - no API call needed)
   - Your webhook endpoint receives notification with hashes
   - Store the `dataHash` and `token` for later use

3. **Retrieve Available Hashes** (When needed)
   ```bash
   curl -X POST http://localhost:3001/api/third-party/retrieve-hashes \
     -H "Content-Type: application/json" \
     -d '{
       "accessKey": "your-access-key-from-registration",
       "thirdPartyId": "your-tpp-id"
     }'
   ```

4. **Access Data** (Using hashes from step 3)
   ```bash
   curl -X POST http://localhost:3001/api/third-party/request-data \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer your-api-key-from-registration" \
     -d '{
       "dataHash": "hash-from-step-3",
       "token": "token-from-step-3",
       "purpose": "purpose-from-step-3"
     }'
   ```

---

## 🔐 **Security Notes**

- **Access Key**: Used only for retrieving hashes
- **API Key**: Used for accessing actual data
- **Both keys** are provided during registration
- **Store keys securely** - never expose in client-side code
- **Webhook URLs** must be HTTPS in production
- **All requests** are logged for audit purposes

---

## 📝 **Error Handling**

All endpoints return consistent error responses:
- `400` - Bad Request (missing/invalid parameters)
- `401` - Unauthorized (invalid API key)
- `403` - Forbidden (access denied)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (already exists)
- `500` - Internal Server Error

---

## 🎯 **Frontend Integration Tips**

1. **Store API keys securely** (localStorage for demo, secure storage for production)
2. **Handle all error responses** gracefully
3. **Implement retry logic** for network failures
4. **Show loading states** during API calls
5. **Validate responses** before processing data
6. **Log all API interactions** for debugging

---

*Last updated: January 15, 2024* 
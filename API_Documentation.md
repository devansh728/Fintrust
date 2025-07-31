# FinTrust API Documentation

## Overview
This document provides comprehensive API documentation for the FinTrust banking platform, including Authentication and Consent Management services.

## Base URLs
- **Authentication Service**: `http://localhost:8080`
- **Consent Service**: `http://localhost:8081`

## Authentication

### Base URL: `http://localhost:8080/api/auth`

All authentication endpoints return JSON responses and support CORS.

---

### 1. User Registration
**POST** `/api/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

**Response:**
- **200 OK**: User registered successfully
- **400 Bad Request**: Invalid input data
- **409 Conflict**: Email already exists

**Example:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

---

### 2. User Login
**POST** `/api/auth/login`

Authenticate user and receive access tokens.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
- **200 OK**: Authentication successful
```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "USER|ADMIN|TPP",
    "authProvider": "LOCAL|GOOGLE",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```
- **401 Unauthorized**: Invalid credentials
- **500 Internal Server Error**: Login failed

**Example:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

---

### 3. Token Refresh
**POST** `/api/auth/refresh-token`

Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "string"
}
```

**Response:**
- **200 OK**: New access token generated
```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "USER|ADMIN|TPP",
    "authProvider": "LOCAL|GOOGLE",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:8080/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "your-refresh-token-here"
  }'
```

---

### 4. Token Validation
**POST** `/api/auth/validate-token`

Validate JWT access token.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
- **200 OK**: Token is valid
```json
{
  "valid": true,
  "message": "Token is valid",
  "claims": {
    "sub": "user-email",
    "iat": 1234567890,
    "exp": 1234567890
  }
}
```
- **400 Bad Request**: Invalid Authorization header
- **401 Unauthorized**: Token is invalid

**Example:**
```bash
curl -X POST http://localhost:8080/api/auth/validate-token \
  -H "Authorization: Bearer your-access-token-here"
```

---

### 5. User Logout
**POST** `/api/auth/logout`

Logout user and invalidate refresh token.

**Request Body:**
```json
{
  "refreshToken": "string"
}
```

**Response:**
- **200 OK**: Logout successful
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Example:**
```bash
curl -X POST http://localhost:8080/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "your-refresh-token-here"
  }'
```

---

### 6. Get Current User
**GET** `/api/user/me`

Get current authenticated user information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
- **200 OK**: User information
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "role": "USER|ADMIN|TPP",
  "authProvider": "LOCAL|GOOGLE",
  "createdAt": "2024-01-01T00:00:00Z"
}
```
- **401 Unauthorized**: Invalid or missing token

**Example:**
```bash
curl -X GET http://localhost:8080/api/user/me \
  -H "Authorization: Bearer your-access-token-here"
```

---

## Consent Management

### Base URL: `http://localhost:8081`

All consent endpoints require authentication via Bearer token in Authorization header.

---

### 1. Respond to Consent Request
**POST** `/consent/respond/{reqId}`

Respond to a third-party consent request.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Path Parameters:**
- `reqId` (string): Request ID

**Request Body:**
```json
{
  "status": "APPROVED|REJECTED"
}
```

**Response:**
- **200 OK**: Consent decision recorded
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Invalid token
- **404 Not Found**: Request not found

**Example:**
```bash
curl -X POST http://localhost:8081/consent/respond/req123 \
  -H "Authorization: Bearer your-access-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "APPROVED"
  }'
```

---

### 2. Get User Consents
**GET** `/consent/user/`

Get all consent requests for the authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
- **200 OK**: List of user consents
```json
[
  {
    "id": "string",
    "thirdPartyName": "string",
    "purpose": "string",
    "status": "PENDING|APPROVED|REJECTED",
    "createdAt": "2024-01-01T00:00:00Z",
    "respondedAt": "2024-01-01T00:00:00Z"
  }
]
```

**Example:**
```bash
curl -X GET http://localhost:8081/consent/user/ \
  -H "Authorization: Bearer your-access-token-here"
```

---

### 3. Create Third-Party Request
**POST** `/thirdparty/request/{reqId}`

Create a new third-party data access request.

**Headers:**
```
Content-Type: application/json
```

**Path Parameters:**
- `reqId` (string): Request ID

**Request Body:**
```json
{
  "userId": "string",
  "thirdPartyName": "string",
  "purpose": "string",
  "officialEmail": "string",
  "organization": "string",
  "useCase": "string",
  "description": "string",
  "dynamicFields": [
    {
      "fieldName": "string",
      "fieldType": "string",
      "required": true,
      "description": "string"
    }
  ]
}
```

**Response:**
- **200 OK**: Request created successfully
- **400 Bad Request**: Invalid request data

**Example:**
```bash
curl -X POST http://localhost:8081/thirdparty/request/req123 \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user@example.com",
    "thirdPartyName": "FinTech Corp",
    "purpose": "Credit Assessment",
    "officialEmail": "contact@fintechcorp.com",
    "organization": "FinTech Corporation",
    "useCase": "Loan Application",
    "description": "Access to financial data for loan processing",
    "dynamicFields": [
      {
        "fieldName": "accountBalance",
        "fieldType": "number",
        "required": true,
        "description": "Current account balance"
      }
    ]
  }'
```

---

### 4. Get All Third-Party Requests
**GET** `/thirdparty/all`

Get all third-party requests (Admin only).

**Response:**
- **200 OK**: List of all requests
```json
[
  {
    "id": "string",
    "userId": "string",
    "thirdPartyName": "string",
    "purpose": "string",
    "status": "PENDING|APPROVED|REJECTED",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

**Example:**
```bash
curl -X GET http://localhost:8081/thirdparty/all
```

---

### 5. Get Pending Third-Party Requests
**GET** `/thirdparty/all/pending`

Get all pending third-party requests (Admin only).

**Response:**
- **200 OK**: List of pending requests
```json
[
  {
    "id": "string",
    "userId": "string",
    "thirdPartyName": "string",
    "purpose": "string",
    "status": "PENDING",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

**Example:**
```bash
curl -X GET http://localhost:8081/thirdparty/all/pending
```

---

### 6. TPP Registration
**POST** `/api/tpp/register`

Register a new Third-Party Provider (TPP).

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "tppId": "string",
  "name": "string",
  "jurisdiction": "string",
  "kycDocs": ["string"],
  "requestedScopes": ["string"]
}
```

**Response:**
- **200 OK**: TPP registered successfully
- **400 Bad Request**: Invalid request data
- **403 Forbidden**: Insufficient permissions

**Example:**
```bash
curl -X POST http://localhost:8081/api/tpp/register \
  -H "Authorization: Bearer your-access-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "tppId": "TPP001",
    "name": "FinTech Solutions Ltd",
    "jurisdiction": "India",
    "kycDocs": ["ipfs://QmHash1", "ipfs://QmHash2"],
    "requestedScopes": ["account_info", "transactions"]
  }'
```

---

### 7. Get TPP Status
**GET** `/api/tpp/{tppId}/status`

Get registration status of a TPP.

**Path Parameters:**
- `tppId` (string): TPP ID

**Response:**
- **200 OK**: TPP status
```json
{
  "tppId": "string",
  "name": "string",
  "status": "PENDING|APPROVED|REJECTED",
  "approvedAt": "2024-01-01T00:00:00Z",
  "expiresAt": "2025-01-01T00:00:00Z"
}
```
- **404 Not Found**: TPP not found

**Example:**
```bash
curl -X GET http://localhost:8081/api/tpp/TPP001/status
```

---

### 8. Approve TPP (Admin)
**POST** `/api/admin/approve-tpp`

Approve a TPP registration (Admin only).

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "tppId": "string",
  "adminId": "string",
  "approved": true,
  "expiryDays": 365
}
```

**Response:**
- **200 OK**: TPP approved successfully
- **400 Bad Request**: Invalid request data
- **403 Forbidden**: Insufficient permissions

**Example:**
```bash
curl -X POST http://localhost:8081/api/admin/approve-tpp \
  -H "Authorization: Bearer your-access-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "tppId": "TPP001",
    "adminId": "admin@bank.com",
    "approved": true,
    "expiryDays": 365
  }'
```

---

### 9. Get Pending TPPs (Admin)
**GET** `/api/admin/pending-tpps`

Get all pending TPP registrations (Admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
- **200 OK**: List of pending TPPs
```json
[
  {
    "tppId": "string",
    "name": "string",
    "jurisdiction": "string",
    "requestedScopes": ["string"],
    "submittedAt": "2024-01-01T00:00:00Z"
  }
]
```

**Example:**
```bash
curl -X GET http://localhost:8081/api/admin/pending-tpps \
  -H "Authorization: Bearer your-access-token-here"
```

---

### 10. Create User Profile
**POST** `/user/profile`

Create a new user profile.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "profilePhoto": "string",
  "address": "string",
  "accountNumber": "string",
  "bank": "string",
  "birthYear": "string",
  "aadhar": "string",
  "panCard": "string",
  "kycStatus": "PENDING|VERIFIED|REJECTED"
}
```

**Response:**
- **200 OK**: Profile created successfully
```json
{
  "id": "string",
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "profilePhoto": "string",
  "address": "string",
  "accountNumber": "string",
  "bank": "string",
  "birthYear": "string",
  "aadhar": "string",
  "panCard": "string",
  "kycStatus": "PENDING|VERIFIED|REJECTED",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Example:**
```bash
curl -X POST http://localhost:8081/user/profile \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+91-9876543210",
    "address": "123 Main St, City, State",
    "accountNumber": "1234567890",
    "bank": "Canara Bank",
    "birthYear": "1990",
    "aadhar": "123456789012",
    "panCard": "ABCDE1234F",
    "kycStatus": "PENDING"
  }'
```

---

### 11. Update User Profile
**PUT** `/user/profile`

Update an existing user profile.

**Headers:**
```
Content-Type: application/json
```

**Request Body:** (Same as Create User Profile)

**Response:**
- **200 OK**: Profile updated successfully
```json
{
  "id": "string",
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "profilePhoto": "string",
  "address": "string",
  "accountNumber": "string",
  "bank": "string",
  "birthYear": "string",
  "aadhar": "string",
  "panCard": "string",
  "kycStatus": "PENDING|VERIFIED|REJECTED",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Example:**
```bash
curl -X PUT http://localhost:8081/user/profile \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe Updated",
    "email": "john@example.com",
    "phone": "+91-9876543210",
    "address": "456 New St, City, State",
    "accountNumber": "1234567890",
    "bank": "Canara Bank",
    "birthYear": "1990",
    "aadhar": "123456789012",
    "panCard": "ABCDE1234F",
    "kycStatus": "VERIFIED"
  }'
```

---

### 12. Get User Profile
**GET** `/user/profile`

Get user profile by user ID.

**Query Parameters:**
- `userId` (string): User ID/Email

**Response:**
- **200 OK**: User profile
```json
{
  "id": "string",
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "profilePhoto": "string",
  "address": "string",
  "accountNumber": "string",
  "bank": "string",
  "birthYear": "string",
  "aadhar": "string",
  "panCard": "string",
  "kycStatus": "PENDING|VERIFIED|REJECTED",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Example:**
```bash
curl -X GET "http://localhost:8081/user/profile?userId=john@example.com"
```

---

### 13. Submit Form Data
**POST** `/form/submit/{formId}`

Submit form data for a specific form.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Path Parameters:**
- `formId` (string): Form ID

**Request Body:**
```json
{
  "submittedFields": {
    "fieldName": "fieldValue"
  },
  "privacyLevel": 0.8
}
```

**Response:**
- **200 OK**: Form submitted successfully
- **400 Bad Request**: Invalid form data
- **401 Unauthorized**: Invalid token

**Example:**
```bash
curl -X POST http://localhost:8081/form/submit/form123 \
  -H "Authorization: Bearer your-access-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "submittedFields": {
      "accountBalance": 50000,
      "transactionHistory": "last_6_months",
      "creditScore": 750
    },
    "privacyLevel": 0.8
  }'
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid input data",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

---

## Authentication Flow

1. **Register**: Create a new user account
2. **Login**: Authenticate and receive access/refresh tokens
3. **Use Access Token**: Include in Authorization header for protected endpoints
4. **Refresh Token**: Use refresh token to get new access token when expired
5. **Logout**: Invalidate refresh token

## CORS Configuration

Both services support CORS with the following configuration:
- **Allowed Origins**: `*`
- **Allowed Methods**: `GET, POST, PUT, DELETE, OPTIONS`
- **Allowed Headers**: `*`

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting for production use.

## Security Considerations

1. **JWT Tokens**: Access tokens expire after 2.5 hours, refresh tokens after 7 days
2. **HTTPS**: Use HTTPS in production
3. **Token Storage**: Store tokens securely on the client side
4. **Input Validation**: All inputs are validated on the server side
5. **Role-Based Access**: Different endpoints require different user roles

## Integration Examples

### Frontend Integration (JavaScript/TypeScript)

```javascript
// Authentication
const login = async (email, password) => {
  const response = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
};

// Protected API call
const getConsents = async (token) => {
  const response = await fetch('http://localhost:8081/consent/user/', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
};

// Token refresh
const refreshToken = async (refreshToken) => {
  const response = await fetch('http://localhost:8080/api/auth/refresh-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });
  return response.json();
};
```

### React Hook Example

```javascript
import { useState, useEffect } from 'react';

const useAuth = () => {
  const [token, setToken] = useState(localStorage.getItem('accessToken'));
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        setToken(data.accessToken);
        setUser(data.user);
        return data;
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await fetch('http://localhost:8080/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);
  };

  return { token, user, login, logout };
};
``` 
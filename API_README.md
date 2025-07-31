# FinTrust API Documentation

## Overview
This repository contains comprehensive API documentation for the FinTrust banking platform, including both Authentication and Consent Management services.

## Files Included

1. **`API_Documentation.md`** - Complete API documentation in Markdown format
2. **`swagger-config.yaml`** - OpenAPI 3.0 specification file
3. **`swagger-ui.html`** - Interactive Swagger UI for testing APIs
4. **`API_README.md`** - This file with usage instructions

## Quick Start

### 1. View Interactive Documentation
Open `swagger-ui.html` in your web browser to access the interactive Swagger UI documentation. This allows you to:
- Browse all available endpoints
- Test APIs directly from the browser
- View request/response schemas
- Try out different authentication scenarios

### 2. Start the Services
Before testing the APIs, ensure both services are running:

```bash
# Start Authentication Service (Port 8080)
cd authentication
./mvnw spring-boot:run

# Start Consent Service (Port 8081)
cd Consent
./mvnw spring-boot:run
```

### 3. Test Authentication Flow
1. **Register a new user** using `/api/auth/register`
2. **Login** using `/api/auth/login` to get access and refresh tokens
3. **Use the access token** in the Authorization header for protected endpoints
4. **Refresh the token** when it expires using `/api/auth/refresh-token`

## Frontend Integration

### JavaScript/TypeScript Examples

#### Authentication Service Integration
```javascript
class AuthService {
  constructor() {
    this.baseUrl = 'http://localhost:8080/api/auth';
    this.token = localStorage.getItem('accessToken');
  }

  async register(userData) {
    const response = await fetch(`${this.baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  }

  async login(credentials) {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await response.json();
    if (data.accessToken) {
      this.token = data.accessToken;
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    return data;
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await fetch(`${this.baseUrl}/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    const data = await response.json();
    if (data.accessToken) {
      this.token = data.accessToken;
      localStorage.setItem('accessToken', data.accessToken);
    }
    return data;
  }

  async logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    await fetch(`${this.baseUrl}/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    this.token = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }
}
```

#### Consent Service Integration
```javascript
class ConsentService {
  constructor(authService) {
    this.baseUrl = 'http://localhost:8081';
    this.authService = authService;
  }

  async getUserConsents() {
    const response = await fetch(`${this.baseUrl}/consent/user/`, {
      headers: this.authService.getAuthHeaders()
    });
    return response.json();
  }

  async respondToConsent(reqId, status) {
    const response = await fetch(`${this.baseUrl}/consent/respond/${reqId}`, {
      method: 'POST',
      headers: this.authService.getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return response.json();
  }

  async createThirdPartyRequest(reqId, requestData) {
    const response = await fetch(`${this.baseUrl}/thirdparty/request/${reqId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });
    return response.json();
  }

  async getUserProfile(userId) {
    const response = await fetch(`${this.baseUrl}/user/profile?userId=${userId}`);
    return response.json();
  }

  async updateUserProfile(profileData) {
    const response = await fetch(`${this.baseUrl}/user/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });
    return response.json();
  }

  async submitFormData(formId, formData) {
    const response = await fetch(`${this.baseUrl}/form/submit/${formId}`, {
      method: 'POST',
      headers: this.authService.getAuthHeaders(),
      body: JSON.stringify(formData)
    });
    return response.json();
  }
}
```

### React Hook Example
```javascript
import { useState, useEffect, useCallback } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('accessToken'));
  const [loading, setLoading] = useState(false);

  const authService = new AuthService();

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      if (response.accessToken) {
        setToken(response.accessToken);
        setUser(response.user);
        return response;
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setToken(null);
    setUser(null);
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const response = await authService.refreshToken();
      if (response.accessToken) {
        setToken(response.accessToken);
        return response;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  }, [logout]);

  useEffect(() => {
    if (token) {
      // Validate token on app start
      fetch('http://localhost:8080/api/auth/validate-token', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(response => {
        if (!response.ok) {
          refreshToken();
        }
      })
      .catch(() => {
        logout();
      });
    }
  }, [token, refreshToken, logout]);

  return { user, token, login, logout, loading };
};
```

## API Endpoints Summary

### Authentication Service (Port 8080)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/refresh-token` | Refresh access token | No |
| POST | `/api/auth/validate-token` | Validate JWT token | Yes |
| POST | `/api/auth/logout` | User logout | No |
| GET | `/api/user/me` | Get current user | Yes |

### Consent Service (Port 8081)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/consent/respond/{reqId}` | Respond to consent request | Yes |
| GET | `/consent/user/` | Get user consents | Yes |
| POST | `/thirdparty/request/{reqId}` | Create third-party request | No |
| GET | `/thirdparty/all` | Get all requests (Admin) | No |
| GET | `/thirdparty/all/pending` | Get pending requests (Admin) | No |
| POST | `/api/tpp/register` | Register TPP | Yes |
| GET | `/api/tpp/{tppId}/status` | Get TPP status | No |
| POST | `/api/admin/approve-tpp` | Approve TPP (Admin) | Yes |
| GET | `/api/admin/pending-tpps` | Get pending TPPs (Admin) | Yes |
| POST | `/user/profile` | Create user profile | No |
| PUT | `/user/profile` | Update user profile | No |
| GET | `/user/profile` | Get user profile | No |
| POST | `/form/submit/{formId}` | Submit form data | Yes |

## Error Handling

All endpoints return appropriate HTTP status codes:
- **200**: Success
- **400**: Bad Request (invalid input)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **500**: Internal Server Error

## CORS Configuration

Both services are configured to allow CORS from any origin for development. For production, configure specific origins.

## Security Considerations

1. **Token Storage**: Store tokens securely (httpOnly cookies recommended for production)
2. **Token Refresh**: Implement automatic token refresh before expiration
3. **HTTPS**: Use HTTPS in production
4. **Input Validation**: All inputs are validated server-side
5. **Rate Limiting**: Consider implementing rate limiting for production

## Testing

1. Use the Swagger UI (`swagger-ui.html`) for interactive testing
2. Use tools like Postman or curl for API testing
3. Test the complete authentication flow:
   - Register → Login → Use protected endpoints → Refresh token → Logout

## Support

For questions or issues:
1. Check the API documentation in `API_Documentation.md`
2. Use the interactive Swagger UI
3. Review the service logs for debugging
4. Ensure both services are running on the correct ports 
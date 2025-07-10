# Authentication Microservice

A secure, production-ready authentication backend microservice using Java 17, Spring Boot 3.x, MongoDB, and JWT (access & refresh tokens).

## Features
- User registration and login with BCrypt password hashing
- JWT-based authentication (access & refresh tokens)
- Refresh token rotation and invalidation
- Logout endpoint
- Protected user profile endpoint
- Spring Security integration
- MongoDB persistence
- CORS configuration for frontend integration

## Endpoints

### Register
`POST /api/auth/signup`
```
{
  "username": "testuser",
  "password": "password123"
}
```

### Login
`POST /api/auth/signin`
```
{
  "username": "testuser",
  "password": "password123"
}
```
Response:
```
{
  "accessToken": "...",
  "refreshToken": "...",
  "username": "testuser",
  "roles": ["ROLE_USER"]
}
```

### Refresh Token
`POST /api/auth/refresh-token`
```
{
  "refreshToken": "..."
}
```
Response:
```
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

### Logout
`POST /api/auth/logout`
```
{
  "refreshToken": "..."
}
```

### Protected Profile
`GET /api/user/profile`
Header: `Authorization: Bearer <access_token>`
Response:
```
{
  "message": "Welcome, <username>! This is a protected resource."
}
```

## Setup & Run
1. Configure MongoDB connection in `src/main/resources/application.properties`:
   ```
   spring.data.mongodb.uri=<your-mongodb-uri>
   ```
2. Add JWT secrets and expiry settings:
   ```
   jwt.access.secret=your-very-secret-access-key
   jwt.refresh.secret=your-very-secret-refresh-key
   jwt.access.expiration=900000 # 15 minutes in ms
   jwt.refresh.expiration=604800000 # 7 days in ms
   ```
3. Build and run:
   ```
   ./mvnw spring-boot:run
   ```

## Security Notes
- Passwords are hashed with BCrypt.
- Access tokens are short-lived; refresh tokens are rotated and stored securely.
- All endpoints except `/api/auth/**` require authentication.
- CORS is enabled for all origins (customize for production).

---

For questions or issues, see the code comments or open an issue.

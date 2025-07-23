# Authentication Microservice

This project is a Java Spring Boot-based authentication microservice.

## Project Structure

- **Spring Boot Version:** 3.5.3
- **Java Version:** 17
- **Main Dependencies:**
  - spring-boot-starter-data-mongodb
  - spring-boot-starter-oauth2-client
  - spring-boot-starter-security
  - spring-boot-starter-web
  - jjwt (Java JWT)
  - lombok

authentication/

## Microservice Structure (WIP)

### Model
- `User`: id, name, email, password, role, authProvider, createdAt
- `Role` enum: USER, ADMIN
- `AuthProvider` enum: LOCAL, GOOGLE

### Repository
- `UserRepository` (extends MongoRepository)

### DTOs
- `RegisterRequest`, `LoginRequest`, `RefreshRequest`, `AuthResponse`, `GoogleOAuthRequest`



### Directory Layout
```
src/main/java/com/fintrust/authentication/
├── AuthenticationApplication.java
├── config/
│   └── JwtProperties.java
├── model/
│   ├── User.java
│   ├── Role.java
│   └── AuthProvider.java
├── repository/
│   └── UserRepository.java
├── dto/
│   ├── RegisterRequest.java
│   ├── LoginRequest.java
│   ├── RefreshRequest.java
│   ├── AuthResponse.java
│   └── GoogleOAuthRequest.java
├── controller/
│   ├── AuthController.java
│   └── UserController.java
├── service/
│   ├── AuthService.java
│   ├── JwtService.java
│   ├── UserService.java
│   └── impl/
│       ├── AuthServiceImpl.java
│       ├── JwtServiceImpl.java
│       └── UserServiceImpl.java
├── security/
│   ├── SecurityConfig.java
│   ├── filter/
│   │   └── JwtAuthFilter.java
│   └── oauth2/
│       └── CustomOAuth2AuthenticationSuccessHandler.java
├── util/
│   ├── JwtUtils.java
│   └── PasswordEncoderConfig.java
```

### Configuration
- `JwtProperties` class for JWT settings (uses `@ConfigurationProperties`)

### Business Logic
- All core business logic for registration, login, JWT, refresh, and Google OAuth2 is implemented in the respective service and filter classes.

### Docker
- `Dockerfile` for containerizing the Spring Boot app
- `docker-compose.yml` for running with MongoDB

## Getting Started

1. **Build:**
   ```sh
   ./mvnw clean install
   ```
2. **Run:**
   ```sh
   ./mvnw spring-boot:run
   ```

---

This README will be updated as the project evolves.

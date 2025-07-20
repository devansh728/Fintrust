# Fintech Anomaly Detection & Privacy Protection System

A comprehensive behavior-based authentication and privacy-preserving data sharing system for fintech applications, featuring real-time anomaly detection, smart contract integration, and differential privacy.

---

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌──────────────────────────────┐
│   Frontend      │    │  Flask Gateway   │    │ Spring Boot Microservices    │
│ (React, MUI)    │───▶│ (app.py)         │───▶│ - Authentication (BBA, ML)   │
│                 │    │ - Anomaly Check  │    │ - DigiLocker Integration     │
│ - User Flows    │    │ - Smart Contract │    │ - Third-party Request/Consent│
└─────────────────┘    └──────────────────┘    └──────────────────────────────┘
                                               │   MongoDB                    │
                                               └──────────────────────────────┘
```

---

## 📁 Project Structure

```
fintust-canara/
├── app.py                        # Flask API Gateway with anomaly detection
├── backend/
│   ├── authentication/           # Behavior-based authentication & anomaly detection
│   │   └── src/main/java/com/fintech/fintrust/authentication/
│   │       ├── model/            # User, UserBehavior, AnomalyDetectionResult, etc.
│   │       ├── service/          # AuthService, AnomalyDetectionService, etc.
│   │       ├── controller/       # AuthController, AnomalyDetectionController
│   │       ├── repository/       # UserRepository, UserBehaviorRepository
│   │       └── security/         # JWT, OAuth2, AnomalyDetectionFilter
│   ├── api/                      # DigiLocker integration microservice
│   │   └── src/main/java/com/digilocker/integration/api/
│   │       ├── controller/       # DigiLocker OAuth2, document, health endpoints
│   │       ├── service/          # DigiLockerOAuth2Service, DocumentService
│   │       ├── repository/       # DigiLockerAuthRepository, UserRepository
│   │       ├── config/           # Security, RateLimiting, DigiLockerConfig
│   │       └── util/             # JWT, HMAC, AES, RateLimiter
│   └── request/                  # Third-party request, consent, and data minimization
│       └── src/main/java/com/thirdparty/user/request/
│           ├── controller/       # RequestController (initiate, consent, submit, etc.)
│           ├── service/          # RequestService, AsyncBlockchainService
│           ├── domain/           # Request, Consent, UserBehavior, DocumentMeta
│           ├── repository/       # RequestRepository, UserRepository
│           ├── filter/           # AnomalyDetectionFilter
│           └── util/             # JWT, etc.
├── frontend/                     # React + TypeScript frontend
│   ├── src/                      # Main source code (UI, API calls)
│   └── public/                   # Static assets
└── README.md
```

---

## 🧩 Module Descriptions

### 1. **backend/authentication**
- **Purpose:** Implements behavior-based authentication, user/session management, and real-time anomaly detection using ML/statistical models. Handles smart contract validation and privacy-preserving data sharing logic.
- **Key Features:**
  - User registration, login, JWT/OAuth2
  - Behavioral trait collection (typing, touch, device, session)
  - Anomaly detection and risk scoring
  - Smart contract execution control
  - Privacy-preserving data minimization

### 2. **backend/api**
- **Purpose:** Integrates with DigiLocker for secure document access, OAuth2 flows, and document verification. Handles secure storage and retrieval of DigiLocker tokens and documents.
- **Key Features:**
  - OAuth2 authorization with DigiLocker
  - Secure document fetch, download, and verification
  - Token encryption, HMAC validation, and rate limiting
  - Health and status endpoints

### 3. **backend/request**
- **Purpose:** Manages third-party requests for user data, consent handling, document attachment, and blockchain submission. Orchestrates data minimization and privacy compliance for external requests.
- **Key Features:**
  - Initiate and track data/consent requests
  - Field-level and full consent management
  - Document upload and validation
  - Submit requests to blockchain (with async support)
  - Integrates with Flask API for data minimization
  - Anomaly detection filter for all requests

### 4. **frontend**
- **Purpose:** Provides a modern, secure, and responsive UI for users to interact with authentication, consent, and document flows. Built with React, TypeScript, and Material UI.
- **Key Features:**
  - User authentication and secure flows
  - Dashboard, document management, consent handling (in progress)
  - Responsive, accessible design
  - API integration with backend services

### 5. **app.py (Flask Gateway)**
- **Purpose:** Serves as the API gateway, handling anomaly detection, smart contract validation, and routing requests to backend microservices. Performs real-time risk assessment and privacy-preserving data minimization.

---

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Python 3.8+
- Node.js 16+
- MongoDB 5.0+
- Maven 3.6+

### 1. Start Backend Microservices
```bash
# Authentication Service
cd backend/authentication
mvn spring-boot:run

# DigiLocker API Service
cd ../api
mvn spring-boot:run

# Third-party Request Service
cd ../request
mvn spring-boot:run
```

### 2. Start the Flask Gateway
```bash
python app.py
```

### 3. Start the Frontend
```bash
cd frontend
npm install
npm start
```

### 4. Test the System

#### Example API Request with Behavioral Data
```bash
curl -X POST http://localhost:5000/api/requests/123/submitForm \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-User-ID: user123" \
  -H "X-Session-ID: session456" \
  -H "X-Device-ID: device789" \
  -H "X-User-Location: 12.9716,77.5946" \
  -H "X-Typing-Pattern: {\"averageSpeed\": 0.5, \"variance\": 0.1}" \
  -H "X-Touch-Pattern: {\"pressure\": 0.8, \"duration\": 0.2}" \
  -F 'payload={
    "use_case": "Credit Card Issuance",
    "form_data": {
      "text_fields": {"Phone Number": "9876543210"},
      "file_uploads": {}
    }
  }'
```

#### Anomaly Detection API
```bash
# Detect anomaly
curl -X POST http://localhost:8089/api/anomaly/detect \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "deviceId": "device789",
    "ipAddress": "192.168.1.1",
    "actionType": "API_REQUEST"
  }'

# Execute smart contract
curl -X POST http://localhost:8089/api/anomaly/smart-contract/execute \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "contractFunction": "transferFunds",
    "parameters": {"amount": 1000, "recipient": "user456"}
  }'
```

---

## 🔧 Configuration

### Anomaly Detection Thresholds
```java
// In AnomalyDetectionService.java
private static final double TYPING_ANOMALY_THRESHOLD = 0.7;
private static final double TOUCH_ANOMALY_THRESHOLD = 0.6;
private static final double LOCATION_ANOMALY_THRESHOLD = 0.8;
private static final double SESSION_ANOMALY_THRESHOLD = 0.5;
private static final double OVERALL_ANOMALY_THRESHOLD = 0.6;
```

### Privacy Settings
```java
// In PrivacyPreservingDataService.java
private static final double EPSILON = 0.1; // Differential privacy parameter
private static final String ALGORITHM = "AES/GCM/NoPadding";
```

## 📊 Behavioral Traits Analyzed

### 1. Typing Patterns
- **Typing Speed**: Characters per second
- **Typing Variance**: Consistency in typing rhythm
- **Pause Duration**: Time between keystrokes
- **Backspace Frequency**: Error correction patterns
- **Key Press Intervals**: Timing between specific keys

### 2. Touch Patterns
- **Tap Pressure**: Force applied to screen
- **Tap Duration**: How long touches are held
- **Swipe Velocity**: Speed of swipe gestures
- **Swipe Distance**: Length of swipe movements
- **Touch Area**: Where on screen user touches

### 3. Location Patterns
- **Geographic Location**: GPS coordinates
- **Location History**: Travel patterns
- **Location Hash**: Privacy-preserving location data
- **Distance from Usual Location**: Anomaly detection

### 4. Device Patterns
- **Device ID**: Known vs unknown devices
- **Device Type**: Mobile, tablet, desktop
- **Device Model**: Specific device characteristics
- **IP Address**: Network location

### 5. Session Patterns
- **Session Duration**: How long sessions last
- **Request Frequency**: API call patterns
- **Navigation Flow**: Page-to-page movement
- **Time of Day**: Usage patterns

## 🛡️ Security Measures

### Risk Levels & Responses
- **LOW (0.0-0.3)**: Basic monitoring, allow access
- **MEDIUM (0.3-0.6)**: Enhanced monitoring, limited features
- **HIGH (0.6-0.8)**: Multi-factor authentication required
- **CRITICAL (0.8-1.0)**: Immediate block, account freeze

### Smart Contract Security
- **Execution Control**: Only executes when anomaly score < 0.8
- **Multi-signature**: Required for high-value transactions
- **Time Locks**: Delayed execution for suspicious activities
- **Audit Trail**: Complete blockchain-based logging

## 🔒 Privacy Protection

### Data Minimization
- **Use Case Based**: Only required fields per use case
- **Field Masking**: Sensitive data masking (PAN, Aadhar, Phone)
- **Address Generalization**: City-level location only
- **File Filtering**: Only essential documents shared

### Differential Privacy
- **Laplace Noise**: Mathematical noise addition
- **K-Anonymity**: Group-based anonymization
- **Epsilon Parameter**: Privacy vs utility trade-off
- **Sensitivity Analysis**: Impact assessment

### Encryption & Tokenization
- **AES-256-GCM**: Military-grade encryption
- **Token Generation**: Secure token replacement
- **Key Management**: Secure key storage
- **Data Residency**: Local data storage compliance

## 📈 Machine Learning Models

### Anomaly Detection Algorithms
1. **Statistical Analysis**: Z-score, IQR methods
2. **Isolation Forest**: Unsupervised anomaly detection
3. **One-Class SVM**: Novelty detection
4. **Autoencoder**: Deep learning anomaly detection

### Feature Engineering
- **Temporal Features**: Time-based patterns
- **Spatial Features**: Location-based analysis
- **Behavioral Features**: User interaction patterns
- **Contextual Features**: Environmental factors

### Model Training
- **Historical Data**: User behavior history
- **Baseline Establishment**: Normal behavior patterns
- **Continuous Learning**: Adaptive model updates
- **Performance Monitoring**: Accuracy and F1-score tracking

## 🚨 API Response Examples

### Normal Request (No Anomaly)
```json
{
  "use_case": "Credit Card Issuance",
  "minimum_required_fields": ["PAN Card", "Aadhar", "Phone Number"],
  "form_data": {
    "text_fields": {"Phone Number": "987****210"},
    "file_uploads": {"PAN_Card": {...}}
  },
  "security_metadata": {
    "anomaly_detection_performed": true,
    "anomaly_score": 0.15,
    "risk_level": "LOW",
    "smart_contract_validated": true,
    "privacy_preserving_minimization_applied": true
  }
}
```

### Anomaly Detected
```json
{
  "error": "ANOMALY_DETECTED",
  "message": "Access blocked due to detected anomaly",
  "anomalyScore": 0.85,
  "riskLevel": "HIGH",
  "riskFactors": ["UNUSUAL_LOCATION", "UNKNOWN_DEVICE"],
  "recommendedAction": "BLOCK"
}
```

## 🔧 Development

### Adding New Behavioral Traits
1. Extend `UserBehavior.java` model
2. Update `AnomalyDetectionService.java` with new calculation methods
3. Modify `AnomalyDetectionFilter.java` to extract new data
4. Update thresholds and risk assessment logic

### Customizing Privacy Rules
1. Modify `PrivacyPreservingDataService.java`
2. Update field minimization logic
3. Adjust differential privacy parameters
4. Configure compliance frameworks

### Smart Contract Integration
1. Update `SmartContractService.java` with your blockchain
2. Configure contract addresses and ABIs
3. Implement transaction validation logic
4. Add multi-signature requirements

## 📋 Compliance

### GDPR Compliance
- **Data Minimization**: Only necessary data collected
- **Consent Management**: Explicit user consent
- **Right to Erasure**: Data deletion capabilities
- **Data Portability**: Export user data
- **Privacy by Design**: Built-in privacy protection

### DPDP (India) Compliance
- **Data Principal Rights**: User control over data
- **Consent Framework**: Granular consent management
- **Data Localization**: Local data storage
- **Breach Notification**: Incident reporting
- **Cross-border Transfer**: Restricted data sharing

## 🧪 Testing

### Unit Tests
```bash
cd backend/authentication
mvn test
```

### Integration Tests
```bash
# Test anomaly detection
curl -X POST http://localhost:8089/api/anomaly/detect \
  -H "Content-Type: application/json" \
  -d @test_data.json

# Test privacy protection
curl -X POST http://localhost:5000/api/requests/123/submitForm \
  -F 'payload=@test_payload.json'
```

### Performance Testing
- **Load Testing**: Apache JMeter scripts included
- **Stress Testing**: High-volume anomaly detection
- **Latency Testing**: Response time optimization
- **Accuracy Testing**: False positive/negative analysis

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Kubernetes Deployment
```bash
# Deploy to Kubernetes cluster
kubectl apply -f k8s/
```

### Production Configuration
- **SSL/TLS**: HTTPS encryption
- **Rate Limiting**: API protection
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK stack integration
- **Backup**: Automated data backup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- **Biometric Integration**: Fingerprint, face recognition
- **Advanced ML Models**: Deep learning for better accuracy
- **Real-time Streaming**: Apache Kafka integration
- **Microservices**: Service mesh architecture
- **Edge Computing**: Local anomaly detection
- **Quantum Security**: Post-quantum cryptography

---

**Built with ❤️ for secure and privacy-preserving fintech applications** 
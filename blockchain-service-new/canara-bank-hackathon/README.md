# AI-Driven Decentralized Data Privacy Framework

A comprehensive solution leveraging AI, Blockchain, and Zero-Trust Architecture for secure fintech data sharing with privacy preservation.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │  Node.js Backend│    │  Python AI Engine│
│                 │    │                 │    │                 │
│ • User Forms    │◄──►│ • Tokenization  │◄──►│ • Data Minimization
│ • Consent Mgmt  │    │ • Encryption    │    │ • Anomaly Detection
│ • Dashboard     │    │ • API Gateway   │    │ • Differential Privacy
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  Smart Contracts│
                       │  (Ethereum)      │
                       │                 │
                       │ • Consent Logging│
                       │ • Access Control │
                       │ • Audit Trail   │
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  Java Spring    │
                       │  Boot Backend   │
                       │                 │
                       │ • Authentication│
                       │ • DigiLocker API│
                       │ • Document Mgmt │
                       │ • AES Encryption│
                       └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- Java 17+
- MongoDB Atlas (free tier)
- Ethereum Testnet (Sepolia/Goerli) account
- Maven (for Java backend)

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd ai-decentralized-privacy-framework
npm run install:all
```

2. **Environment Setup:**
```bash
# Copy environment templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp ai_engine/.env.example ai_engine/.env
cp java-backend/.env.example java-backend/.env
```

3. **Configure Environment Variables:**
   - MongoDB connection string
   - JWT secret keys
   - Ethereum Sepolia/Goerli RPC URL
   - AI model API keys
   - Java backend configuration

4. **Deploy Smart Contracts:**
```bash
# Deploy to Sepolia testnet
npm run deploy:contracts:sepolia

# Or deploy to Goerli testnet
npm run deploy:contracts:goerli

# Or deploy to Ethereum mainnet (production)
npm run deploy:contracts:ethereum
```

5. **Start Development:**
```bash
# Start all services
npm run dev

# Or start individual services
npm run dev:frontend
npm run dev:backend
npm run dev:ai
npm run dev:java-backend
```

## 📁 Project Structure

```
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   └── package.json
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # MongoDB schemas
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utilities
│   └── package.json
├── ai_engine/              # Python AI microservice
│   ├── app/
│   │   ├── models/         # ML models
│   │   ├── services/       # AI services
│   │   └── utils/          # AI utilities
│   ├── requirements.txt
│   └── main.py
├── java-backend/           # Java Spring Boot backend
│   ├── src/main/java/
│   │   ├── com/fintech/fintrust/
│   │   │   ├── authentication/  # Auth service
│   │   │   ├── digilocker/      # DigiLocker integration
│   │   │   ├── gateway/         # API Gateway
│   │   │   └── request/         # Request service
│   │   └── com/digilocker/
│   │       └── integration/api/ # DigiLocker API
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── application.properties
│   └── pom.xml
├── smart_contracts/        # Solidity contracts
│   ├── contracts/          # Smart contracts
│   ├── scripts/           # Deployment scripts
│   ├── test/              # Contract tests
│   └── package.json
└── package.json           # Root workspace config
```

## 🔧 Technology Stack

### Frontend
- **React 18** with Vite
- **TailwindCSS** for styling
- **Axios** for API calls
- **React Router** for navigation
- **Context API** for state management

### Backend (Node.js)
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcrypt** for password hashing
- **crypto** for encryption/tokenization

### Backend (Java Spring Boot)
- **Spring Boot 3.x** with Spring Cloud
- **Spring Security** for authentication
- **Spring Cloud Gateway** for API routing
- **AES Encryption** for data security
- **DigiLocker Integration** for document verification
- **Microservices Architecture**

### AI Engine
- **Python** with FastAPI
- **scikit-learn** for ML models
- **PyDP** for differential privacy
- **HuggingFace** for LLM integration

### Blockchain
- **Solidity** for smart contracts
- **Hardhat** for development
- **Ethereum Sepolia/Goerli** testnet
- **Ethers.js** for contract interaction

## 🔐 Security Features

- **Zero-Trust Architecture**: Continuous verification of all requests
- **Data Tokenization**: Sensitive data replaced with cryptographic tokens
- **Differential Privacy**: Noise addition to prevent re-identification
- **Blockchain Audit Trail**: Immutable logging of all data access
- **AI-Powered Anomaly Detection**: Real-time monitoring of access patterns
- **Multi-Factor Authentication**: Enhanced user verification
- **AES Encryption**: Military-grade encryption for sensitive data
- **DigiLocker Integration**: Government-verified document authentication

## 📊 Data Flow

1. **User Registration**: Frontend form → Java Auth Service → MongoDB storage
2. **Document Verification**: DigiLocker API → AES Encryption → Blockchain logging
3. **Data Submission**: Form data → Tokenization → Encryption → Blockchain logging
4. **AI Processing**: Raw data → AI minimization → Differential privacy → Filtered output
5. **Third-Party Access**: Request → Smart contract verification → AI-filtered data → Response
6. **Monitoring**: Real-time AI monitoring → Anomaly detection → Automatic alerts

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:frontend
npm run test:backend
npm run test:contracts
npm run test:java-backend
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy dist/ folder
```

### Backend (Node.js) (Render/Railway)
```bash
cd backend
npm run build
# Deploy with environment variables
```

### Backend (Java) (Railway/Heroku)
```bash
cd java-backend
mvn clean package
# Deploy with application.yml
```

### AI Engine (Railway/Heroku)
```bash
cd ai_engine
# Deploy with requirements.txt
```

### Smart Contracts (Ethereum Networks)

#### Sepolia Testnet (Recommended for Testing)
```bash
npm run deploy:contracts:sepolia
```
- **Chain ID**: 11155111
- **Explorer**: https://sepolia.etherscan.io/
- **Faucet**: https://sepoliafaucet.com/

#### Goerli Testnet (Alternative)
```bash
npm run deploy:contracts:goerli
```
- **Chain ID**: 5
- **Explorer**: https://goerli.etherscan.io/
- **Faucet**: https://goerlifaucet.com/

#### Ethereum Mainnet (Production)
```bash
npm run deploy:contracts:ethereum
```
- **Chain ID**: 1
- **Explorer**: https://etherscan.io/
- **Note**: Requires real ETH for gas fees

## 📈 Monitoring & Analytics

- **Sentry** for error tracking
- **LogRocket** for user behavior
- **Etherscan** for transaction monitoring
- **Custom Dashboard** for system metrics
- **Spring Boot Actuator** for Java backend monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in each service folder
- Review the API documentation at `/api/docs`

---

**Built with ❤️ for secure fintech data sharing** 
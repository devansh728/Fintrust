# AI-Driven Decentralized Data Privacy Framework

A comprehensive, production-ready fintech privacy solution that combines AI, Blockchain, and Zero-Trust Architecture for secure, privacy-preserving data sharing and consent management.

---

## 🏗️ Architecture Overview

- **Frontend:** Next.js (React, TypeScript, TailwindCSS)
- **Backend:** Java Spring Boot microservices (Authentication, Consent)
- **AI Services:** Python Flask microservices for data minimization and behavioral anomaly detection
- **Blockchain:** Ethereum smart contracts for consent, compliance, and audit trail

```
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   Frontend   │   │   Backends    │   │     AI        │
│ (Next.js)    │   │ (Spring Boot) │   │ (Flask)       │
│              │   │               │   │               │
│ • User Mgmt  │   │ • Auth        │   │ • Data Min.    │
│ • Consent UI │   │ • Consent     │   │ • Anomaly Det. │
└───────────────┘   └───────────────┘   └───────────────┘
         │                 │                 │
         └─────────────┬───┴─────────────────┘
                       │
               ┌───────▼────────┐
               │  Blockchain    │
               │ (Ethereum)     │
               │ • Consent Log  │
               │ • Compliance   │
               └───────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- Java 17+
- Hardhat (for smart contracts)
- MongoDB (for backend)

### 1. Clone & Install
```bash
git clone <repo-url>
cd <repo-root>
# Install frontend
cd frontend/fintech-app && npm install
# Install AI services
cd ../../aI && pip install -r requirements.txt
cd ../Behaviour-1/canara && pip install -r requirements.txt
# Install blockchain
cd ../../canara\ bank\ hackathon && npm install
# Backend: Use Maven for Consent & Authentication
```

### 2. Environment Setup
- Configure .env files for each service (API keys, DB URIs, etc.)

### 3. Run Services
- **Frontend:**
  ```bash
  cd frontend/fintech-app
  npm run dev
  ```
- **AI Minimization:**
  ```bash
  cd aI
  python app.py
  ```
- **Behavioral Anomaly:**
  ```bash
  cd Behaviour-1/canara
  python app.py
  ```
- **Consent/Authentication:**
  ```bash
  cd Consent && ./mvnw spring-boot:run
  cd authentication && ./mvnw spring-boot:run
  ```
- **Blockchain:**
  ```bash
  cd canara\ bank\ hackathon
  npm run deploy:sepolia
  # or npm run dev for local
  ```

---

## 📦 Project Structure

- `frontend/fintech-app/` — Next.js frontend (React, shadcn/ui, TailwindCSS)
- `Consent/` — Consent microservice (Java Spring Boot)
- `authentication/` — Authentication microservice (Java Spring Boot)
- `aI/` — AI minimization microservice (Flask, Gemini Pro)
- `Behaviour-1/canara/` — Behavioral anomaly detection (Flask, scikit-learn)
- `canara bank hackathon/` — Blockchain smart contracts (Solidity, Hardhat)

---

## 🔧 Technology Stack

- **Frontend:** Next.js, React, TypeScript, TailwindCSS, shadcn/ui
- **Backend:** Java Spring Boot, MongoDB, JWT, OAuth2
- **AI:** Python Flask, Google Gemini, scikit-learn
- **Blockchain:** Solidity, Hardhat, Ethers.js, Ethereum testnet

---

## 🌟 Key Features

- **User Authentication:** JWT, OAuth2, Google login
- **Consent Management:** Fine-grained, auditable consent flows
- **Data Minimization:** AI-driven field reduction for privacy
- **Behavioral Anomaly Detection:** Real-time risk scoring
- **Blockchain Audit Trail:** Immutable consent and access logs
- **Compliance:** GDPR, DPDP, and financial regulations
- **Modern UI:** Responsive, accessible, and beautiful

---

## 🧩 How It Works

1. **User registers/logs in** (frontend → authentication service)
2. **Consent requests** are managed (frontend → consent service)
3. **Data minimization** (consent service → AI minimization service)
4. **Behavioral anomaly detection** (all sensitive actions → behavioral AI)
5. **All consents and access** are logged on blockchain
6. **Frontend** displays real-time status, analytics, and alerts

---

## 🛡️ Security & Privacy
- Zero-Trust: All requests are verified
- AES encryption for sensitive data
- Blockchain for audit and compliance
- AI for privacy and anomaly detection

---

## 🛠️ Development & Testing
- Each service is independently containerizable (Dockerfiles provided)
- Use `npm test`, `mvn test`, or `pytest` for respective services
- Smart contracts tested with Hardhat

---

## 📈 Future Enhancements
- Mobile app (React Native)
- More blockchain networks (Polygon, Solana)
- Advanced AI for fraud detection
- Enterprise analytics dashboard
- Multi-language support

---

**Built with ❤️ for secure, privacy-first fintech data sharing.** 
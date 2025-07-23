# Blockchain Smart Contracts - AI-Driven Privacy Framework

This directory contains the smart contracts for the AI-Driven Decentralized Data Privacy Framework, built on Ethereum testnet and mainnet.

## 🏗️ Contract Architecture

### Core Contracts

1. **PrivacyFramework.sol** - Main contract for consent management and access control
2. **DataTokenization.sol** - Handles data tokenization and encryption key management
3. **ComplianceManager.sol** - Manages regulatory compliance and audit trails

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Hardhat
- MetaMask or similar wallet
- Ethereum testnet (Sepolia/Goerli) ETH tokens

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp env.example .env
# Edit .env with your configuration
```

3. **Compile contracts:**
```bash
npm run compile
```

4. **Run tests:**
```bash
npm test
```

5. **Deploy to Ethereum testnet:**
```bash
npm run deploy:sepolia
```

## 📋 Contract Features

### PrivacyFramework.sol
- **Consent Management**: Grant, revoke, and track user consents
- **Access Control**: Verify and log data access requests
- **Anomaly Detection**: Report and track suspicious activities
- **Third Party Authorization**: Manage authorized third parties
- **Audit Trails**: Immutable logging of all activities

### DataTokenization.sol
- **Data Tokenization**: Convert sensitive data to cryptographic tokens
- **Encryption Key Management**: Store and manage encryption keys
- **Token Validation**: Verify token authenticity and validity
- **Secure Storage**: Encrypted storage of sensitive information

### ComplianceManager.sol
- **Regulatory Compliance**: Track GDPR, DPDP, CCPA compliance
- **Data Residency**: Monitor data storage locations
- **Retention Policies**: Enforce data retention rules
- **Compliance Reporting**: Generate regulatory reports
- **Audit Support**: Provide audit trails for regulators

## 🔧 Configuration

### Environment Variables
```bash
# Required
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_private_key_here

# Optional
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Network Configuration
- **Local Development**: `http://127.0.0.1:8545`
- **Sepolia Testnet**: `https://sepolia.infura.io/v3/...`
- **Goerli Testnet**: `https://goerli.infura.io/v3/...`
- **Ethereum Mainnet**: `https://mainnet.infura.io/v3/...`

## 📊 Contract Functions

### PrivacyFramework

#### Consent Management
```solidity
function grantConsent(
    string memory dataHash,
    string memory useCase,
    string memory thirdPartyId,
    string memory dataType,
    uint256 durationInSeconds
) external

function revokeConsent(uint256 consentId) external
```

#### Access Control
```solidity
function requestAccess(
    string memory dataHash,
    string memory purpose,
    string memory thirdPartyId,
    string memory ipAddress,
    string memory deviceFingerprint
) external returns (bool)
```

#### Anomaly Detection
```solidity
function reportAnomaly(
    address userAddress,
    string memory dataHash,
    string memory anomalyType,
    string memory description
) external
```

### DataTokenization

#### Token Management
```solidity
function tokenizeData(
    string memory originalDataHash,
    string memory token,
    string memory encryptionKeyHash,
    string memory dataType,
    uint256 durationInSeconds
) external

function validateToken(string memory token) external view returns (bool, uint256)
```

### ComplianceManager

#### Compliance Tracking
```solidity
function recordCompliance(
    address userAddress,
    string memory regulation,
    string memory complianceType,
    bool isCompliant,
    string memory details,
    string memory region,
    uint256 durationInSeconds
) external

function generateRegulatoryReport(
    string memory reportId,
    string memory regulation,
    string memory reportType,
    string memory reportHash
) external
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Specific Test Files
```bash
npx hardhat test test/PrivacyFramework.test.js
npx hardhat test test/DataTokenization.test.js
npx hardhat test test/ComplianceManager.test.js
```

### Test Coverage
```bash
npx hardhat coverage
```

## 🚀 Deployment

### Local Development
```bash
# Start local node
npx hardhat node

# Deploy to local network
npm run deploy:local
```

### Ethereum Testnet (Sepolia)
```bash
# Deploy to Sepolia
npm run deploy:sepolia

# Verify contracts on Etherscan
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

### Ethereum Mainnet (Production)
```bash
# Deploy to Ethereum mainnet
npm run deploy:ethereum
```

## 📈 Monitoring

### Contract Events
Monitor these events for system activity:

- `ConsentGranted` - When user grants consent
- `ConsentRevoked` - When user revokes consent
- `AccessRequested` - When data access is requested
- `AccessGranted` - When access is granted
- `AccessDenied` - When access is denied
- `AnomalyDetected` - When anomaly is detected
- `ComplianceRecorded` - When compliance is recorded

### Etherscan Integration
- View contract transactions: `https://sepolia.etherscan.io/address/CONTRACT_ADDRESS`
- Monitor events in real-time
- Track gas usage and costs

## 🔐 Security Features

### Access Control
- Owner-only functions for critical operations
- Third-party authorization system
- User consent verification

### Data Protection
- Cryptographic tokenization
- Encrypted key storage
- Immutable audit trails

### Compliance
- Regulatory requirement tracking
- Automated compliance reporting
- Data residency monitoring

## 📊 Gas Optimization

### Optimizations Applied
- Efficient data structures
- Minimal storage operations
- Optimized function calls
- Batch operations where possible

### Gas Costs (Estimated)
- Contract deployment: ~2-3M gas
- Grant consent: ~50K gas
- Request access: ~30K gas
- Report anomaly: ~25K gas

## 🔗 Integration

### Frontend Integration
```javascript
import { ethers } from 'ethers';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  signer
);

// Grant consent
await contract.grantConsent(
  dataHash,
  useCase,
  thirdPartyId,
  dataType,
  duration
);
```

### Backend Integration
```javascript
const { ethers } = require('ethers');

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  wallet
);

// Report anomaly
await contract.reportAnomaly(
  userAddress,
  dataHash,
  anomalyType,
  description
);
```

## 🛠️ Development

### Adding New Features
1. Create feature branch
2. Implement smart contract changes
3. Add comprehensive tests
4. Update documentation
5. Submit pull request

### Code Style
- Follow Solidity style guide
- Use OpenZeppelin contracts
- Implement proper access control
- Add comprehensive documentation

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Create an issue in the repository
- Check the test files for usage examples
- Review the contract documentation

---

**Built with ❤️ for secure fintech data privacy** 

cd smart_contracts
npx hardhat run examples/data-formats.js 
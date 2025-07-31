const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

class BlockchainService {
    constructor() {
        this.provider = null;
        this.wallet = null;
        this.contracts = {};
        this.contractABIs = {};
        this.contractAddresses = {};
    }

    async initialize() {
        try {
            // Initialize provider with multiple fallback RPC URLs
            const rpcUrls = [
                'https://sepolia.infura.io/v3/df6abec20f0a4f7f9e5d580ceeed3f8b',
                'https://sepolia.drpc.org',
                'https://rpc.sepolia.org'
            ];

            let provider = null;
            for (const rpcUrl of rpcUrls) {
                try {
                    provider = new ethers.JsonRpcProvider(rpcUrl);
                    // Test the connection
                    await provider.getBlockNumber();
                    console.log(`✅ Connected to blockchain via: ${rpcUrl}`);
                    break;
                } catch (error) {
                    console.log(`⚠️ Failed to connect to: ${rpcUrl}`);
                    continue;
                }
            }

            if (!provider) {
                throw new Error('Failed to connect to any RPC provider');
            }

            this.provider = provider;
            
            // Set the wallet address for token access
            this.walletAddress = '0xE79a4a1be34019245a077620d6Fd9E7fB944E759';

            // Initialize wallet with provided Sepolia private key
            const PRIVATE_KEY = 'ead0841e29777b1f4ce07df3c9fc802ca5893445155d4ede905c95ba6f94bf75';
            this.wallet = new ethers.Wallet(PRIVATE_KEY, this.provider);
            console.log('✅ Wallet initialized:', this.wallet.address);
            
            // Load contract ABIs
            await this.loadContractABIs();
            // Load deployed contract addresses
            await this.loadContractAddresses();
            // Initialize contracts
            await this.initializeContracts();
            
            console.log('✅ Blockchain service initialized successfully');
            console.log(`💰 Using wallet address: ${this.walletAddress}`);
            console.log('>>> BlockchainService.initialize() complete');
            console.log('Contracts after initialization:', this.contracts);
        } catch (error) {
            console.error('❌ Failed to initialize blockchain service:', error.message);
            // Don't throw error, continue with limited functionality
        }
    }

    async loadContractABIs() {
        try {
            const contractsDir = path.join(__dirname, '../smart_contracts/artifacts/contracts');
            
            // Load PrivacyFramework ABI
            const privacyFrameworkPath = path.join(contractsDir, 'PrivacyFramework.sol/PrivacyFramework.json');
            if (fs.existsSync(privacyFrameworkPath)) {
                const privacyFrameworkArtifact = JSON.parse(fs.readFileSync(privacyFrameworkPath, 'utf8'));
                this.contractABIs.privacyFramework = privacyFrameworkArtifact.abi;
            }

            // Load DataTokenization ABI
            const dataTokenizationPath = path.join(contractsDir, 'DataTokenization.sol/DataTokenization.json');
            if (fs.existsSync(dataTokenizationPath)) {
                const dataTokenizationArtifact = JSON.parse(fs.readFileSync(dataTokenizationPath, 'utf8'));
                this.contractABIs.dataTokenization = dataTokenizationArtifact.abi;
            }

            // Load ComplianceManager ABI
            const complianceManagerPath = path.join(contractsDir, 'ComplianceManager.sol/ComplianceManager.json');
            if (fs.existsSync(complianceManagerPath)) {
                const complianceManagerArtifact = JSON.parse(fs.readFileSync(complianceManagerPath, 'utf8'));
                this.contractABIs.complianceManager = complianceManagerArtifact.abi;
            }

            console.log('✅ Contract ABIs loaded successfully');
        } catch (error) {
            console.error('❌ Failed to load contract ABIs:', error.message);
        }
    }

    async loadContractAddresses() {
        try {
            const deploymentPath = path.join(__dirname, '../smart_contracts/deployment-sepolia-1751744300537.json');
            const contractAddresses = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
            const privacyFrameworkAddress = contractAddresses.contracts.PrivacyFramework; // 0x00E52E54CA33671dB2833C6F40023bcF8088C09B
            const dataTokenizationAddress = contractAddresses.contracts.DataTokenization; // 0xf231ae4012fBb64D4C1c1D3440ff8D259B2502B3
            const complianceManagerAddress = contractAddresses.contracts.ComplianceManager; // 0x1880A80E2DCF9cc554dBBA88D596AaFAe64969e8

            this.contractAddresses = {
                PrivacyFramework: privacyFrameworkAddress,
                DataTokenization: dataTokenizationAddress,
                ComplianceManager: complianceManagerAddress
            };
            console.log('✅ Contract addresses loaded successfully');
        } catch (error) {
            console.error('❌ Failed to load contract addresses:', error.message);
        }
    }

    async initializeContracts() {
        try {
            console.log('Contract ABIs:', this.contractABIs);
            console.log('Contract Addresses:', this.contractAddresses);
            const addresses = this.contractAddresses.contracts || this.contractAddresses;
            // Initialize PrivacyFramework contract
            if (this.contractABIs.privacyFramework && addresses.PrivacyFramework) {
                this.contracts.privacyFramework = new ethers.Contract(
                    addresses.PrivacyFramework,
                    this.contractABIs.privacyFramework,
                    this.provider
                );
                console.log('Assigned privacyFramework:', this.contracts.privacyFramework);
            }

            // Initialize DataTokenization contract
            if (this.contractABIs.dataTokenization && addresses.DataTokenization) {
                this.contracts.dataTokenization = new ethers.Contract(
                    addresses.DataTokenization,
                    this.contractABIs.dataTokenization,
                    this.provider
                );
                console.log('Assigned dataTokenization:', this.contracts.dataTokenization);
            }

            // Initialize ComplianceManager contract
            if (this.contractABIs.complianceManager && addresses.ComplianceManager) {
                this.contracts.complianceManager = new ethers.Contract(
                    addresses.ComplianceManager,
                    this.contractABIs.complianceManager,
                    this.provider
                );
                console.log('Assigned complianceManager:', this.contracts.complianceManager);
            }

            console.log('✅ Smart contracts initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize contracts:', error.message);
        }
    }

    // Blockchain interaction methods
    async getNetworkInfo() {
        try {
            if (!this.provider) {
                return null;
            }
            const network = await this.provider.getNetwork();
            const blockNumber = await this.provider.getBlockNumber();
            return {
                chainId: network.chainId,
                name: network.name,
                blockNumber: blockNumber.toString(),
                provider: this.provider.connection?.url || 'Unknown'
            };
        } catch (error) {
            console.error('Failed to get network info:', error.message);
            return null;
        }
    }

    async getWalletInfo() {
        try {
            if (!this.provider) {
                return null;
            }
            const balance = await this.provider.getBalance(this.walletAddress);
            const balanceInEth = ethers.formatEther(balance);
            
            return {
                address: this.walletAddress,
                balance: balanceInEth,
                balanceWei: balance.toString(),
                network: await this.getNetworkInfo()
            };
        } catch (error) {
            console.error('Failed to get wallet info:', error.message);
            return null;
        }
    }

    async checkTokenAccess(tokenAddress) {
        try {
            if (!this.provider) {
                return null;
            }
            // ERC20 token interface for balance checking
            const tokenAbi = [
                "function balanceOf(address owner) view returns (uint256)",
                "function name() view returns (string)",
                "function symbol() view returns (string)",
                "function decimals() view returns (uint8)"
            ];
            
            const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, this.provider);
            
            const balance = await tokenContract.balanceOf(this.walletAddress);
            const name = await tokenContract.name();
            const symbol = await tokenContract.symbol();
            const decimals = await tokenContract.decimals();
            
            const formattedBalance = ethers.formatUnits(balance, decimals);
            
            return {
                tokenAddress: tokenAddress,
                tokenName: name,
                tokenSymbol: symbol,
                balance: formattedBalance,
                balanceRaw: balance.toString(),
                decimals: decimals,
                walletAddress: this.walletAddress
            };
        } catch (error) {
            console.error('Failed to check token access:', error.message);
            return null;
        }
    }

    async getContractStatus() {
        try {
            const status = {};
            
            // Check PrivacyFramework contract
            if (this.contracts.privacyFramework) {
                try {
                    await this.contracts.privacyFramework.owner();
                    status.PrivacyFramework = 'active';
                } catch (error) {
                    status.PrivacyFramework = 'error';
                }
            } else {
                status.PrivacyFramework = 'not_initialized';
            }

            // Check DataTokenization contract
            if (this.contracts.dataTokenization) {
                try {
                    await this.contracts.dataTokenization.owner();
                    status.DataTokenization = 'active';
                } catch (error) {
                    status.DataTokenization = 'error';
                }
            } else {
                status.DataTokenization = 'not_initialized';
            }

            // Check ComplianceManager contract
            if (this.contracts.complianceManager) {
                try {
                    await this.contracts.complianceManager.owner();
                    status.ComplianceManager = 'active';
                } catch (error) {
                    status.ComplianceManager = 'error';
                }
            } else {
                status.ComplianceManager = 'not_initialized';
            }

            return status;
        } catch (error) {
            console.error('Failed to get contract status:', error.message);
            return {};
        }
    }

    async grantConsent(dataHash, useCase, thirdPartyId, dataType, duration) {
        try {
            if (!this.contracts.privacyFramework) {
                throw new Error('PrivacyFramework contract not initialized');
            }

            const contract = this.contracts.privacyFramework.connect(this.wallet);
            const tx = await contract.grantConsent(dataHash, useCase, thirdPartyId, dataType, duration);
            await tx.wait();
            
            return {
                success: true,
                transactionHash: tx.hash,
                useCase: useCase,
                thirdPartyId: thirdPartyId,
                dataType: dataType,
                duration: duration,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Failed to grant consent:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async tokenizeData(originalDataHash, token, encryptionKeyHash, dataType, duration) {
        try {
            if (!this.contracts.dataTokenization) {
                throw new Error('DataTokenization contract not initialized');
            }

            const contract = this.contracts.dataTokenization.connect(this.wallet);
            const tx = await contract.tokenizeData(originalDataHash, token, encryptionKeyHash, dataType, duration);
            await tx.wait();
            
            return {
                success: true,
                transactionHash: tx.hash,
                token: token,
                originalDataHash: originalDataHash,
                encryptionKeyHash: encryptionKeyHash,
                dataType: dataType,
                duration: duration,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Failed to tokenize data:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async recordCompliance(userAddress, regulation, complianceType, isCompliant, details, region, duration) {
        try {
            if (!this.contracts.complianceManager) {
                throw new Error('ComplianceManager contract not initialized');
            }

            const contract = this.contracts.complianceManager.connect(this.wallet);
            const tx = await contract.recordCompliance(userAddress, regulation, complianceType, isCompliant, details, region, duration);
            await tx.wait();
            
            return {
                success: true,
                transactionHash: tx.hash,
                userAddress: userAddress,
                regulation: regulation,
                complianceType: complianceType,
                isCompliant: isCompliant,
                details: details,
                region: region,
                duration: duration,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Failed to record compliance:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getContractEvents(contractName, eventName, fromBlock = 0) {
        try {
            if (!this.contracts[contractName]) {
                return [];
            }

            const events = await this.contracts[contractName].queryFilter(eventName, fromBlock);
            return events.map(event => ({
                transactionHash: event.transactionHash,
                blockNumber: event.blockNumber,
                args: event.args,
                timestamp: new Date().toISOString()
            }));
        } catch (error) {
            console.error(`Failed to get events for ${contractName}:`, error.message);
            return [];
        }
    }

    async registerFile(fileCid, owner) {
        try {
            if (!this.contracts.privacyFramework) {
                throw new Error('PrivacyFramework contract not initialized');
            }
            const contract = this.contracts.privacyFramework.connect(this.wallet);
            // fileCid should be bytes32, so hash the CID string
            const fileHash = ethers.keccak256(ethers.toUtf8Bytes(fileCid));
            const tx = await contract.registerFile(fileHash, owner);
            await tx.wait();
            return { success: true, transactionHash: tx.hash };
        } catch (error) {
            console.error('Failed to register file:', error.message);
            return { success: false, error: error.message };
        }
    }

    async authorizeThirdPartyForFile(fileCid, thirdParty) {
        try {
            if (!this.contracts.privacyFramework) {
                throw new Error('PrivacyFramework contract not initialized');
            }
            const contract = this.contracts.privacyFramework.connect(this.wallet);
            const fileHash = ethers.keccak256(ethers.toUtf8Bytes(fileCid));
            const tx = await contract.authorizeThirdPartyForFile(fileHash, thirdParty);
            await tx.wait();
            return { success: true, transactionHash: tx.hash };
        } catch (error) {
            console.error('Failed to authorize third party for file:', error.message);
            return { success: false, error: error.message };
        }
    }

    async isAuthorizedForFile(fileCid, user) {
        try {
            if (!this.contracts.privacyFramework) {
                throw new Error('PrivacyFramework contract not initialized');
            }
            const fileHash = ethers.keccak256(ethers.toUtf8Bytes(fileCid));
            const isAuth = await this.contracts.privacyFramework.isAuthorizedForFile(fileHash, user);
            return !!isAuth;
        } catch (error) {
            console.error('Failed to check per-file authorization:', error.message);
            return false;
        }
    }
}

const blockchainService = new BlockchainService();
async function initializeBlockchainService() {
    await blockchainService.initialize();
}

module.exports = { blockchainService, initializeBlockchainService }; 
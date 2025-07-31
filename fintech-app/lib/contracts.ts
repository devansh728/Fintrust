import { ethers } from "ethers"

// Smart Contract ABIs
export const TPP_REGISTRY_ABI = [
  "function registerTPP(string memory legalName, string memory jurisdiction, string[] memory scopes, uint256 expiryDays) external returns (string memory tppId)",
  "function approveTTP(string memory tppId, uint256 expiryDays) external",
  "function renewTPP(string memory tppId, uint256 expiryDays) external",
  "function getTPPDetails(string memory tppId) external view returns (string memory legalName, string memory jurisdiction, string[] memory scopes, uint256 expiryTimestamp, bool isActive)",
  "function getExpiringTPPs(uint256 daysThreshold) external view returns (string[] memory)",
  "event TPPRegistered(string indexed tppId, string legalName, string jurisdiction, uint256 expiryTimestamp)",
  "event TPPApproved(string indexed tppId, uint256 expiryTimestamp)",
  "event TPPExpiryWarning(string indexed tppId, uint256 daysRemaining)",
  "event TPPExpired(string indexed tppId)",
]

export const CONSENT_MANAGER_ABI = [
  "function grantConsent(address tpp, string memory dataType, uint256 expiryTime, string memory gdprBasis) external",
  "function revokeConsent(address tpp, string memory dataType, string memory reason) external",
  "function getConsent(address user, address tpp, string memory dataType) external view returns (bool active, uint256 expiry, string memory gdprBasis)",
  "function getUserConsents(address user) external view returns (tuple(address tpp, string dataType, uint256 expiry, bool active, string gdprBasis)[])",
  "event ConsentGranted(address indexed user, address indexed tpp, string dataType, uint256 expiryTime, string gdprBasis)",
  "event ConsentRevoked(address indexed user, address indexed tpp, string dataType, string reason)",
]

export const DOCUMENT_VAULT_ABI = [
  "function uploadDocument(string memory ipfsHash, string memory docType, uint256 expiryDays) external returns (uint256 docId)",
  "function renewDocument(uint256 docId, string memory newIpfsHash, uint256 expiryDays) external",
  "function getDocument(uint256 docId) external view returns (string memory ipfsHash, string memory docType, uint256 uploadDate, uint256 expiryDate, bool isActive)",
  "function getExpiringDocuments(uint256 daysThreshold) external view returns (uint256[] memory)",
  "event DocumentUploaded(uint256 indexed docId, string ipfsHash, string docType, uint256 expiryDate)",
  "event DocumentExpired(uint256 indexed docId)",
]

// Contract addresses (mock for demo)
export const CONTRACT_ADDRESSES = {
  TPP_REGISTRY: "0x1234567890123456789012345678901234567890",
  CONSENT_MANAGER: "0x2345678901234567890123456789012345678901",
  DOCUMENT_VAULT: "0x3456789012345678901234567890123456789012",
}

export interface TPPDetails {
  tppId: string
  legalName: string
  jurisdiction: string
  scopes: string[]
  expiryTimestamp: number
  isActive: boolean
}

export interface ConsentRecord {
  tpp: string
  dataType: string
  expiry: number
  active: boolean
  gdprBasis: string
}

export interface DocumentRecord {
  docId: number
  ipfsHash: string
  docType: string
  uploadDate: number
  expiryDate: number
  isActive: boolean
}

export class ContractService {
  private provider: ethers.BrowserProvider | null = null
  private signer: ethers.JsonRpcSigner | null = null
  private tppRegistry: ethers.Contract | null = null
  private consentManager: ethers.Contract | null = null
  private documentVault: ethers.Contract | null = null

  async connect(): Promise<string[]> {
    if (!window.ethereum) {
      throw new Error("MetaMask not installed")
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    })

    this.provider = new ethers.BrowserProvider(window.ethereum)
    this.signer = await this.provider.getSigner()

    this.tppRegistry = new ethers.Contract(CONTRACT_ADDRESSES.TPP_REGISTRY, TPP_REGISTRY_ABI, this.signer)
    this.consentManager = new ethers.Contract(CONTRACT_ADDRESSES.CONSENT_MANAGER, CONSENT_MANAGER_ABI, this.signer)
    this.documentVault = new ethers.Contract(CONTRACT_ADDRESSES.DOCUMENT_VAULT, DOCUMENT_VAULT_ABI, this.signer)

    return accounts
  }

  async registerTPP(legalName: string, jurisdiction: string, scopes: string[], expiryDays: number): Promise<string> {
    if (!this.tppRegistry) throw new Error("Contract not initialized")

    const tx = await this.tppRegistry.registerTPP(legalName, jurisdiction, scopes, expiryDays)
    const receipt = await tx.wait()

    // Extract TPP ID from event logs
    const event = receipt.logs.find((log: any) => log.fragment?.name === "TPPRegistered")
    return event?.args?.tppId || `TPP_${Date.now()}`
  }

  async approveTPP(tppId: string, expiryDays: number): Promise<string> {
    if (!this.tppRegistry) throw new Error("Contract not initialized")

    const tx = await this.tppRegistry.approveTTP(tppId, expiryDays)
    return tx.hash
  }

  async renewTPP(tppId: string, expiryDays: number): Promise<string> {
    if (!this.tppRegistry) throw new Error("Contract not initialized")

    const tx = await this.tppRegistry.renewTPP(tppId, expiryDays)
    return tx.hash
  }

  async getTPPDetails(tppId: string): Promise<TPPDetails> {
    if (!this.tppRegistry) throw new Error("Contract not initialized")

    const [legalName, jurisdiction, scopes, expiryTimestamp, isActive] = await this.tppRegistry.getTPPDetails(tppId)

    return {
      tppId,
      legalName,
      jurisdiction,
      scopes,
      expiryTimestamp: Number(expiryTimestamp),
      isActive,
    }
  }

  async getExpiringTPPs(daysThreshold: number): Promise<string[]> {
    if (!this.tppRegistry) throw new Error("Contract not initialized")

    return await this.tppRegistry.getExpiringTPPs(daysThreshold)
  }

  async grantConsent(tpp: string, dataType: string, expiryTime: number, gdprBasis: string): Promise<string> {
    if (!this.consentManager) throw new Error("Contract not initialized")

    const tx = await this.consentManager.grantConsent(tpp, dataType, expiryTime, gdprBasis)
    return tx.hash
  }

  async revokeConsent(tpp: string, dataType: string, reason: string): Promise<string> {
    if (!this.consentManager) throw new Error("Contract not initialized")

    const tx = await this.consentManager.revokeConsent(tpp, dataType, reason)
    return tx.hash
  }

  async getUserConsents(userAddress: string): Promise<ConsentRecord[]> {
    if (!this.consentManager) throw new Error("Contract not initialized")

    return await this.consentManager.getUserConsents(userAddress)
  }

  async uploadDocument(ipfsHash: string, docType: string, expiryDays: number): Promise<number> {
    if (!this.documentVault) throw new Error("Contract not initialized")

    const tx = await this.documentVault.uploadDocument(ipfsHash, docType, expiryDays)
    const receipt = await tx.wait()

    const event = receipt.logs.find((log: any) => log.fragment?.name === "DocumentUploaded")
    return Number(event?.args?.docId) || Date.now()
  }

  async renewDocument(docId: number, newIpfsHash: string, expiryDays: number): Promise<string> {
    if (!this.documentVault) throw new Error("Contract not initialized")

    const tx = await this.documentVault.renewDocument(docId, newIpfsHash, expiryDays)
    return tx.hash
  }

  async getDocument(docId: number): Promise<DocumentRecord> {
    if (!this.documentVault) throw new Error("Contract not initialized")

    const [ipfsHash, docType, uploadDate, expiryDate, isActive] = await this.documentVault.getDocument(docId)

    return {
      docId,
      ipfsHash,
      docType,
      uploadDate: Number(uploadDate),
      expiryDate: Number(expiryDate),
      isActive,
    }
  }

  async getExpiringDocuments(daysThreshold: number): Promise<number[]> {
    if (!this.documentVault) throw new Error("Contract not initialized")

    return await this.documentVault.getExpiringDocuments(daysThreshold)
  }

  // Event listeners
  onTPPExpiryWarning(callback: (tppId: string, daysRemaining: number) => void) {
    if (!this.tppRegistry) return

    this.tppRegistry.on("TPPExpiryWarning", (tppId, daysRemaining) => {
      callback(tppId, Number(daysRemaining))
    })
  }

  onDocumentExpired(callback: (docId: number) => void) {
    if (!this.documentVault) return

    this.documentVault.on("DocumentExpired", (docId) => {
      callback(Number(docId))
    })
  }
}

export const contractService = new ContractService()

import { ethers } from "ethers"

export interface MetaMaskProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>
  on: (event: string, callback: (accounts: string[]) => void) => void
  removeListener: (event: string, callback: (accounts: string[]) => void) => void
}

declare global {
  interface Window {
    ethereum?: MetaMaskProvider
  }
}

// Mock ConsentManager contract ABI
const CONSENT_MANAGER_ABI = [
  "function grantConsent(address tpp, string memory dataType, uint256 expiryTime) external",
  "function revokeConsent(address tpp, string memory dataType) external",
  "function getConsent(address user, address tpp, string memory dataType) external view returns (bool, uint256)",
  "event ConsentGranted(address indexed user, address indexed tpp, string dataType, uint256 expiryTime)",
  "event ConsentRevoked(address indexed user, address indexed tpp, string dataType)",
]

const CONSENT_MANAGER_ADDRESS = "0x1234567890123456789012345678901234567890"

export class MetaMaskService {
  private provider: ethers.BrowserProvider | null = null
  private signer: ethers.JsonRpcSigner | null = null
  private contract: ethers.Contract | null = null

  async connect(): Promise<string[]> {
    if (!window.ethereum) {
      throw new Error("MetaMask not installed")
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      this.provider = new ethers.BrowserProvider(window.ethereum)
      this.signer = await this.provider.getSigner()
      this.contract = new ethers.Contract(CONSENT_MANAGER_ADDRESS, CONSENT_MANAGER_ABI, this.signer)

      return accounts
    } catch (error) {
      throw new Error("Failed to connect to MetaMask")
    }
  }

  async grantConsent(tppAddress: string, dataType: string, expiryDays: number): Promise<string> {
    if (!this.contract) {
      throw new Error("Contract not initialized")
    }

    const expiryTime = Math.floor(Date.now() / 1000) + expiryDays * 24 * 60 * 60

    try {
      const tx = await this.contract.grantConsent(tppAddress, dataType, expiryTime)
      return tx.hash
    } catch (error) {
      throw new Error("Failed to grant consent")
    }
  }

  async revokeConsent(tppAddress: string, dataType: string): Promise<string> {
    if (!this.contract) {
      throw new Error("Contract not initialized")
    }

    try {
      const tx = await this.contract.revokeConsent(tppAddress, dataType)
      return tx.hash
    } catch (error) {
      throw new Error("Failed to revoke consent")
    }
  }

  async getConsent(
    userAddress: string,
    tppAddress: string,
    dataType: string,
  ): Promise<{ active: boolean; expiry: number }> {
    if (!this.contract) {
      throw new Error("Contract not initialized")
    }

    try {
      const [active, expiry] = await this.contract.getConsent(userAddress, tppAddress, dataType)
      return { active, expiry: Number(expiry) }
    } catch (error) {
      throw new Error("Failed to get consent")
    }
  }

  async signMessage(message: string): Promise<string> {
    if (!this.signer) {
      throw new Error("Signer not initialized")
    }

    try {
      return await this.signer.signMessage(message)
    } catch (error) {
      throw new Error("Failed to sign message")
    }
  }
}

export const metaMaskService = new MetaMaskService()

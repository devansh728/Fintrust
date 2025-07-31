// Mock IPFS service for KYC document storage
export interface IPFSUploadResult {
  hash: string
  url: string
  size: number
}

export class IPFSService {
  private baseUrl = "https://ipfs.io/ipfs/"

  async uploadFile(file: File): Promise<IPFSUploadResult> {
    // Simulate IPFS upload
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate mock IPFS hash
    const mockHash = "Qm" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    return {
      hash: mockHash,
      url: this.baseUrl + mockHash,
      size: file.size,
    }
  }

  async getFile(hash: string): Promise<string> {
    return this.baseUrl + hash
  }

  async pinFile(hash: string): Promise<boolean> {
    // Simulate pinning
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return true
  }
}

export const ipfsService = new IPFSService()

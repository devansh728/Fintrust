"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RoleGuard } from "@/components/auth/role-guard"
import { RoleNavbar } from "@/components/shared/role-navbar"
import { AuditLogs } from "@/components/shared/audit-logs"
import { ProfileSection } from "@/components/shared/profile-section"
import { RegistrationPortal } from "@/components/tpp/registration-portal"
import { DocumentVault } from "@/components/tpp/document-vault"
import { ConsentManagement } from "@/components/tpp/consent-management"
import { ipfsService } from "@/lib/ipfs"
import { metaMaskService } from "@/lib/metamask"
import { contractService } from "@/lib/contracts"
import { RefreshCw, Plus, Trash2 } from "lucide-react"
import { NotificationSystem } from "@/components/shared/notifications"

interface TPPRegistration {
  id: string
  tppId?: string
  name: string
  jurisdiction: string
  scopes: string[]
  status: "pending" | "approved" | "rejected"
  submittedAt: string
  approvedAt?: string
  expiresAt?: string
  kycDocuments?: {
    hash: string
    url: string
    uploadedAt: string
  }[]
}

interface ConsentRecord {
  id: string
  userId: string
  userName: string
  dataType: string
  grantedAt: string
  expiresAt: string
  status: "active" | "expired" | "revoked"
  onChainTxHash?: string
}

const mockRegistration: TPPRegistration = {
  id: "1",
  tppId: "TPP_UK_PAYTEC_001",
  name: "PayTech Solutions Ltd",
  jurisdiction: "United Kingdom",
  scopes: ["account_info", "transaction_history", "payment_initiation"],
  status: "approved",
  submittedAt: "2024-01-10T10:00:00Z",
  kycDocuments: [
    {
      hash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
      url: "https://ipfs.io/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
      uploadedAt: "2024-01-10T10:30:00Z",
    },
  ],
}

const mockConsents: ConsentRecord[] = [
  {
    id: "1",
    userId: "user123",
    userName: "Alice Johnson",
    dataType: "transaction_history",
    grantedAt: "2024-01-15T09:00:00Z",
    expiresAt: "2024-04-15T09:00:00Z",
    status: "active",
    onChainTxHash: "0x1234567890abcdef",
  },
  {
    id: "2",
    userId: "user456",
    userName: "Bob Smith",
    dataType: "account_info",
    grantedAt: "2024-01-14T14:30:00Z",
    expiresAt: "2024-04-14T14:30:00Z",
    status: "active",
    onChainTxHash: "0xabcdef1234567890",
  },
  {
    id: "3",
    userId: "user789",
    userName: "Charlie Brown",
    dataType: "payment_initiation",
    grantedAt: "2024-01-10T11:15:00Z",
    expiresAt: "2024-01-20T11:15:00Z",
    status: "expired",
  },
]

export default function TPPDashboard() {
  const [registration, setRegistration] = useState<TPPRegistration>(mockRegistration)
  const [consents, setConsents] = useState<ConsentRecord[]>(mockConsents)
  const [isUploading, setIsUploading] = useState(false)
  const [isLoadingStatus, setIsLoadingStatus] = useState(false)
  const [metaMaskConnected, setMetaMaskConnected] = useState(false)
  const [metaMaskAccount, setMetaMaskAccount] = useState<string>("")
  const [contractListeners, setContractListeners] = useState(false)

  // Request Initiation form state
  const [requestForm, setRequestForm] = useState({
    userId: "",
    thirdPartyName: "",
    purpose: "",
    officialEmail: "",
    organization: "",
    useCase: "",
    description: "",
    dynamicFields: [
      { fieldName: "", fieldType: "", required: true, description: "" },
    ],
  })
  const [isRequesting, setIsRequesting] = useState(false)
  const [requestMessage, setRequestMessage] = useState<string | null>(null)

  const handleRequestFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, idx?: number, fieldKey?: string) => {
    const { name, value, type } = e.target
    if (typeof idx === "number" && fieldKey) {
      setRequestForm((prev) => {
        const updatedFields = [...prev.dynamicFields]
        let fieldValue: any = value
        if (type === "checkbox") {
          // Only HTMLInputElement has 'checked'
          fieldValue = (e.target as HTMLInputElement).checked
        }
        updatedFields[idx] = {
          ...updatedFields[idx],
          [fieldKey]: fieldValue,
        }
        return { ...prev, dynamicFields: updatedFields }
      })
    } else {
      setRequestForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  const addDynamicField = () => {
    setRequestForm((prev) => ({
      ...prev,
      dynamicFields: [
        ...prev.dynamicFields,
        { fieldName: "", fieldType: "", required: true, description: "" },
      ],
    }))
  }

  const removeDynamicField = (idx: number) => {
    setRequestForm((prev) => ({
      ...prev,
      dynamicFields: prev.dynamicFields.filter((_, i) => i !== idx),
    }))
  }

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsRequesting(true)
    setRequestMessage(null)
    const reqId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    
    // Transform dynamic fields to match backend DTO structure
    const transformedDynamicFields = requestForm.dynamicFields.map(field => ({
      key: field.fieldName,           // fieldName → key
      type: field.fieldType,          // fieldType → type  
      value: field.description,       // description → value
      required: field.required
    }))
    
    const requestData = {
      ...requestForm,
      dynamicFields: transformedDynamicFields
    }
    
    try {
      const response = await fetch(`http://localhost:8081/thirdparty/request/${reqId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          "Authorization-Refresh": `Bearer ${localStorage.getItem("refresh_token")}`,
        },
        body: JSON.stringify(requestData),
      })
      // Handle token refresh
      const newAccessToken = response.headers.get("X-New-Access-Token")
      if (newAccessToken) {
        localStorage.setItem("auth_token", newAccessToken)
      }
      const newRefreshToken = response.headers.get("X-New-Refresh-Token")
      if (newRefreshToken) {
        localStorage.setItem("refresh_token", newRefreshToken)
      }
      if (response.ok) {
        setRequestMessage("Request created successfully!")
        setRequestForm({
          userId: "",
          thirdPartyName: "",
          purpose: "",
          officialEmail: "",
          organization: "",
          useCase: "",
          description: "",
          dynamicFields: [
            { fieldName: "", fieldType: "", required: true, description: "" },
          ],
        })
      } else {
        const errorData = await response.json()
        setRequestMessage(errorData.message || "Invalid request data")
      }
    } catch (error) {
      setRequestMessage("Failed to send request")
    } finally {
      setIsRequesting(false)
    }
  }

  useEffect(() => {
    // Set up contract event listeners
    if (!contractListeners) {
      contractService.onTPPExpiryWarning((tppId, daysRemaining) => {
        // Show toast notification
        console.log(`TPP ${tppId} expires in ${daysRemaining} days`)

        // You could integrate with a toast library here
        if (daysRemaining <= 30) {
          // Show auto-renewal modal
        }
      })

      contractService.onDocumentExpired((docId) => {
        console.log(`Document ${docId} has expired`)
      })

      setContractListeners(true)
    }
  }, [contractListeners])

  // Registration form state
  const [registrationForm, setRegistrationForm] = useState({
    name: "",
    jurisdiction: "",
    scopes: [] as string[],
    description: "",
  })

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Generate TPP ID
      const tppId = `TPP_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`

      // Real API call to backend
      const response = await fetch("http://localhost:8081/api/tpp/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          tppId: tppId,
          name: registrationForm.name,
          jurisdiction: registrationForm.jurisdiction,
          kycDocs: [], // Will be populated when KYC documents are uploaded
          requestedScopes: registrationForm.scopes
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Update registration status
        setRegistration((prev) => ({
          ...prev,
          ...registrationForm,
          tppId: tppId,
          status: "pending",
          submittedAt: new Date().toISOString(),
        }))

        // Reset form
        setRegistrationForm({
          name: "",
          jurisdiction: "",
          scopes: [],
          description: "",
        })

        console.log("TPP Registration successful:", data)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || "Registration failed")
      }
    } catch (error) {
      console.error("Registration failed:", error)
    }
  }

  const handleKYCUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    try {
      const uploadPromises = Array.from(files).map((file) => ipfsService.uploadFile(file))
      const results = await Promise.all(uploadPromises)

      // Update registration with KYC documents
      setRegistration((prev) => ({
        ...prev,
        kycDocuments: [
          ...(prev.kycDocuments || []),
          ...results.map((result) => ({
            hash: result.hash,
            url: result.url,
            uploadedAt: new Date().toISOString(),
          })),
        ],
      }))

      // If TPP is already registered, update the backend with new KYC documents
      if (registration.tppId) {
        const kycDocs = results.map(result => result.url)
        
        const response = await fetch(`http://localhost:8081/api/tpp/${registration.tppId}/kyc`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: JSON.stringify({
            kycDocs: kycDocs
          }),
        })

        if (response.ok) {
          console.log("KYC documents updated successfully")
        } else {
          console.error("Failed to update KYC documents in backend")
        }
      }
    } catch (error) {
      console.error("KYC upload failed:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const connectMetaMask = async () => {
    try {
      const accounts = await metaMaskService.connect()
      setMetaMaskConnected(true)
      setMetaMaskAccount(accounts[0])
    } catch (error) {
      console.error("MetaMask connection failed:", error)
    }
  }

  const revokeConsent = async (consentId: string) => {
    const consent = consents.find((c) => c.id === consentId)
    if (!consent || !metaMaskConnected) return

    try {
      // Mock TPP address for demo
      const tppAddress = "0x742d35Cc6634C0532925a3b8D0C9C0E3C5d5c8eE"

      const txHash = await metaMaskService.revokeConsent(tppAddress, consent.dataType)

      // Update consent status
      setConsents((prev) =>
        prev.map((c) => (c.id === consentId ? { ...c, status: "revoked" as const, onChainTxHash: txHash } : c)),
      )
    } catch (error) {
      console.error("Consent revocation failed:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      case "active":
        return <Badge className="bg-blue-100 text-blue-800">Active</Badge>
      case "expired":
        return <Badge className="bg-gray-100 text-gray-800">Expired</Badge>
      case "revoked":
        return <Badge className="bg-red-100 text-red-800">Revoked</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const fetchTPPStatus = async (tppId: string) => {
    if (!tppId) return

    setIsLoadingStatus(true)
    try {
      const response = await fetch(`http://localhost:8081/api/tpp/${tppId}/status`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          "Authorization-Refresh": `Bearer ${localStorage.getItem("refresh_token")}`
        },
      })

      // Handle token refresh
      const newAccessToken = response.headers.get("X-New-Access-Token")
      if (newAccessToken) {
        localStorage.setItem("auth_token", newAccessToken)
      }
      const newRefreshToken = response.headers.get("X-New-Refresh-Token")
      if (newRefreshToken) {
        localStorage.setItem("refresh_token", newRefreshToken)
      }

      if (response.ok) {
        const data = await response.json()
        
        // Update registration with latest status from backend
        setRegistration((prev) => ({
          ...prev,
          status: data.status.toLowerCase() as "pending" | "approved" | "rejected",
          approvedAt: data.approvedAt,
          expiresAt: data.expiresAt,
        }))

        console.log("TPP Status updated:", data)
      } else if (response.status === 404) {
        console.log("TPP not found or not yet registered")
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch TPP status")
      }
    } catch (error) {
      console.error("Failed to fetch TPP status:", error)
    } finally {
      setIsLoadingStatus(false)
    }
  }

  const [allRequests, setAllRequests] = useState<any[]>([])
  const [isLoadingRequests, setIsLoadingRequests] = useState(false)

  const fetchAllRequests = async () => {
    setIsLoadingRequests(true)
    try {
      const response = await fetch("http://localhost:8081/thirdparty/all", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          "Authorization-Refresh": `Bearer ${localStorage.getItem("refresh_token")}`,
        },
      })
      // Handle token refresh
      const newAccessToken = response.headers.get("X-New-Access-Token")
      if (newAccessToken) {
        localStorage.setItem("auth_token", newAccessToken)
      }
      const newRefreshToken = response.headers.get("X-New-Refresh-Token")
      if (newRefreshToken) {
        localStorage.setItem("refresh_token", newRefreshToken)
      }
      if (response.ok) {
        const data = await response.json()
        setAllRequests(data)
      } else {
        setAllRequests([])
      }
    } catch (error) {
      setAllRequests([])
    } finally {
      setIsLoadingRequests(false)
    }
  }

  useEffect(() => {
    fetchAllRequests()
  }, [])

  // After successful request, refresh the list
  useEffect(() => {
    if (requestMessage && requestMessage.includes("success")) {
      fetchAllRequests()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestMessage])

  // Third Party Registration (Webhook Service) state
  const [webhookRegForm, setWebhookRegForm] = useState({
    thirdPartyId: "",
    name: "",
    webhookUrl: "",
    events: ["data_ready", "consent_granted"],
  })
  const [webhookRegLoading, setWebhookRegLoading] = useState(false)
  const [webhookRegError, setWebhookRegError] = useState<string | null>(null)
  const [webhookRegSuccess, setWebhookRegSuccess] = useState<any | null>(null)

  // --- Webhook Service TPP Integration State ---
  // Store keys in local state only (not auth tokens)
  const [webhookKeys, setWebhookKeys] = useState<{
    apiKey: string
    accessKey: string
    thirdPartyId: string
  } | null>(null)

  // --- Retrieve Hashes State ---
  const [hashesLoading, setHashesLoading] = useState(false)
  const [hashesError, setHashesError] = useState<string | null>(null)
  const [hashesResult, setHashesResult] = useState<any | null>(null)

  // --- Data Access State ---
  const [dataAccessLoading, setDataAccessLoading] = useState(false)
  const [dataAccessError, setDataAccessError] = useState<string | null>(null)
  const [dataAccessResult, setDataAccessResult] = useState<any | null>(null)
  const [selectedHash, setSelectedHash] = useState<any | null>(null)
  const [selectedPurpose, setSelectedPurpose] = useState<string>("")
  const [selectedToken, setSelectedToken] = useState<string>("")

  const handleWebhookRegChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setWebhookRegForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleWebhookEventsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target
    setWebhookRegForm((prev) => {
      let events = prev.events
      if (checked) {
        events = [...events, value]
      } else {
        events = events.filter((ev) => ev !== value)
      }
      return { ...prev, events }
    })
  }

  const handleWebhookRegSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setWebhookRegLoading(true)
    setWebhookRegError(null)
    setWebhookRegSuccess(null)
    try {
      const response = await fetch("http://localhost:3001/api/third-party/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webhookRegForm),
      })
      const data = await response.json()
      if (response.ok && data.success) {
        setWebhookRegSuccess(data)
      } else {
        setWebhookRegError(data.error || "Registration failed")
      }
    } catch (error) {
      setWebhookRegError("Registration failed")
    } finally {
      setWebhookRegLoading(false)
    }
  }

  // --- Webhook Registration Success Handler ---
  useEffect(() => {
    if (webhookRegSuccess && webhookRegSuccess.apiKey) {
      setWebhookKeys({
        apiKey: webhookRegSuccess.apiKey,
        accessKey: webhookRegSuccess.apiKey, // PATCH: The API returns only apiKey, but spec says both. If both are present, use both.
        thirdPartyId: webhookRegSuccess.thirdPartyId,
      })
    }
  }, [webhookRegSuccess])

  

  // --- Retrieve Hashes Handler ---
  const handleRetrieveHashes = async () => {
    if (!webhookKeys?.accessKey || !webhookKeys?.thirdPartyId || !selectedNotificationRequestId) return
    setHashesLoading(true)
    setHashesError(null)
    setHashesResult(null)
    setSelectedHash(null)
    setSelectedPurpose("")
    setSelectedToken("")
    try {
      const response = await fetch("http://localhost:3001/api/third-party/retrieve-hashes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessKey: webhookKeys.accessKey,
          thirdPartyId: webhookKeys.thirdPartyId,
          requestId: selectedNotificationRequestId,
        }),
      })
      const data = await response.json()
      if (response.ok && data.success) {
        setHashesResult(data)
      } else {
        setHashesError(data.error || "Failed to retrieve hashes")
      }
    } catch (error) {
      setHashesError("Failed to retrieve hashes")
    } finally {
      setHashesLoading(false)
    }
  }

  // --- Data Access Handler ---
  const handleAccessData = async () => {
    if (!webhookKeys?.apiKey || !selectedHash || !selectedToken || !selectedPurpose) return
    setDataAccessLoading(true)
    setDataAccessError(null)
    setDataAccessResult(null)
    try {
      const response = await fetch("http://localhost:3001/api/third-party/request-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${webhookKeys.apiKey}`,
        },
        body: JSON.stringify({
          dataHash: selectedHash,
          token: selectedToken,
          purpose: selectedPurpose,
        }),
      })
      const data = await response.json()
      if (response.ok && data.success) {
        setDataAccessResult(data)
      } else {
        setDataAccessError(data.error || "Failed to access data")
      }
    } catch (error) {
      setDataAccessError("Failed to access data")
    } finally {
      setDataAccessLoading(false)
    }
  }

  const [selectedNotificationRequestId, setSelectedNotificationRequestId] = useState<string>("")

  return (
      <div className="min-h-screen bg-gray-50">
        <RoleNavbar />
        <div className="absolute top-4 right-8 z-50">
          <NotificationSystem onNotificationClick={setSelectedNotificationRequestId} />
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">TPP Dashboard</h2>
                <p className="text-gray-600">Manage your Third-Party Provider registration, documents, and user consents</p>
              </div>
              
              {registration.tppId && (
                <Button
                  variant="outline"
                  onClick={() => fetchTPPStatus(registration.tppId!)}
                  disabled={isLoadingStatus}
                  className="ml-4"
                >
                  {isLoadingStatus ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Refreshing Status...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Status
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          <Tabs defaultValue="request" className="space-y-6">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="registration">Registration</TabsTrigger>
              <TabsTrigger value="documents">Document Vault</TabsTrigger>
              <TabsTrigger value="consents">Consent Management</TabsTrigger>
              <TabsTrigger value="webhook">Webhook & Data Access</TabsTrigger>
              <TabsTrigger value="request">Request Initiation</TabsTrigger>
              <TabsTrigger value="audit">Audit Logs</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>

            {/* --- Registration Tab (Fintech Backend) --- */}
            <TabsContent value="registration" className="space-y-6">
              <RegistrationPortal />
            </TabsContent>

            {/* --- Document Vault Tab --- */}
            <TabsContent value="documents" className="space-y-6">
              <DocumentVault />
            </TabsContent>

            {/* --- Consent Management Tab --- */}
            <TabsContent value="consents" className="space-y-6">
              <ConsentManagement />
            </TabsContent>

            {/* --- Webhook & Data Access Tab --- */}
            <TabsContent value="webhook" className="space-y-6">
              {/* --- 1. Third Party Registration --- */}
              <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto mb-8">
                <h3 className="text-xl font-semibold mb-2">1. Third Party Webhook Registration</h3>
                <p className="text-xs text-gray-500 mb-4">Register your TPP with the FinTrust Webhook Service to receive webhook notifications and obtain your API/Access keys. <b>Note:</b> These keys are <u>not</u> your login tokens. Store them securely for data access.</p>
                <form onSubmit={handleWebhookRegSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium">Third Party ID</label>
                    <input type="text" name="thirdPartyId" value={webhookRegForm.thirdPartyId} onChange={handleWebhookRegChange} className="mt-1 block w-full border rounded px-2 py-1" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Name</label>
                    <input type="text" name="name" value={webhookRegForm.name} onChange={handleWebhookRegChange} className="mt-1 block w-full border rounded px-2 py-1" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Webhook URL</label>
                    <input type="url" name="webhookUrl" value={webhookRegForm.webhookUrl} onChange={handleWebhookRegChange} className="mt-1 block w-full border rounded px-2 py-1" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Events</label>
                    <div className="flex gap-4 mt-1">
                      <label className="flex items-center gap-1 text-xs">
                        <input type="checkbox" value="data_ready" checked={webhookRegForm.events.includes("data_ready")}
                          onChange={handleWebhookEventsChange} /> data_ready
                      </label>
                      <label className="flex items-center gap-1 text-xs">
                        <input type="checkbox" value="consent_granted" checked={webhookRegForm.events.includes("consent_granted")}
                          onChange={handleWebhookEventsChange} /> consent_granted
                      </label>
                    </div>
                  </div>
                  <div>
                    <Button type="submit" disabled={webhookRegLoading} className="w-full">
                      {webhookRegLoading ? "Registering..." : "Register Third Party"}
                    </Button>
                  </div>
                  {webhookRegError && (
                    <div className="text-center text-sm text-red-600">{webhookRegError}</div>
                  )}
                  {webhookRegSuccess && (
                    <div className="text-center text-sm text-green-600">
                      Registration successful!<br />
                      <b>API Key:</b> <span className="font-mono break-all">{webhookRegSuccess.apiKey}</span><br />
                      <b>Access Key:</b> <span className="font-mono break-all">{webhookRegSuccess.apiKey}</span><br />
                      <b>Webhook URL:</b> {webhookRegSuccess.webhookUrl}<br />
                      <b>Events:</b> {webhookRegSuccess.events && webhookRegSuccess.events.join(", ")}
                    </div>
                  )}
                </form>
                {webhookKeys && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs">
                    <b>Stored for this session:</b><br />
                    <b>Third Party ID:</b> <span className="font-mono">{webhookKeys.thirdPartyId}</span><br />
                    <b>API Key:</b> <span className="font-mono break-all">{webhookKeys.apiKey}</span><br />
                    <b>Access Key:</b> <span className="font-mono break-all">{webhookKeys.accessKey}</span>
                  </div>
                )}
              </div>

              {/* --- 2. Retrieve Available Hashes --- */}
              <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto mb-8">
                <h3 className="text-xl font-semibold mb-2">2. Retrieve Available Hashes</h3>
                <p className="text-xs text-gray-500 mb-4">After receiving a webhook, use your <b>Access Key</b> and <b>Third Party ID</b> to retrieve available data hashes and tokens for your requests.</p>
                <div className="mb-2">
                  <label className="block text-sm font-medium">Request ID</label>
                  <input type="text" value={selectedNotificationRequestId} onChange={e => setSelectedNotificationRequestId(e.target.value)} className="mt-1 block w-full border rounded px-2 py-1" placeholder="Paste or select requestId from notification" required />
                </div>
                <Button onClick={handleRetrieveHashes} disabled={!webhookKeys || hashesLoading || !selectedNotificationRequestId} className="mb-4">
                  {hashesLoading ? "Retrieving..." : "Retrieve Hashes"}
                </Button>
                {hashesError && <div className="text-center text-sm text-red-600">{hashesError}</div>}
                {hashesResult && (
                  <div className="mt-4">
                    <div className="text-xs mb-2">Found {hashesResult.count} hashes:</div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border text-xs">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-2 py-1 border">Data Hash</th>
                            <th className="px-2 py-1 border">Token</th>
                            <th className="px-2 py-1 border">Purpose</th>
                            <th className="px-2 py-1 border">Created At</th>
                            <th className="px-2 py-1 border">Expiry</th>
                            <th className="px-2 py-1 border">Select</th>
                          </tr>
                        </thead>
                        <tbody>
                          {hashesResult.availableHashes.map((h: any, idx: number) => (
                            <tr key={h.dataHash}>
                              <td className="px-2 py-1 border font-mono break-all">{h.dataHash}</td>
                              <td className="px-2 py-1 border font-mono break-all">{h.token}</td>
                              <td className="px-2 py-1 border">{h.purpose}</td>
                              <td className="px-2 py-1 border">{new Date(h.createdAt).toLocaleString()}</td>
                              <td className="px-2 py-1 border">{new Date(h.expiry).toLocaleString()}</td>
                              <td className="px-2 py-1 border">
                                <Button size="sm" variant={selectedHash === h.dataHash ? "default" : "outline"}
                                  onClick={() => {
                                    setSelectedHash(h.dataHash)
                                    setSelectedToken(h.token)
                                    setSelectedPurpose(h.purpose)
                                  }}>
                                  {selectedHash === h.dataHash ? "Selected" : "Select"}
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* --- 3. Access Data --- */}
              <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto mb-8">
                <h3 className="text-xl font-semibold mb-2">3. Access Data</h3>
                <p className="text-xs text-gray-500 mb-4">Use your <b>API Key</b> and the selected hash/token/purpose to access the actual data.</p>
                <div className="mb-2">
                  <div className="text-xs">Selected Data Hash: <span className="font-mono break-all">{selectedHash || "-"}</span></div>
                  <div className="text-xs">Selected Token: <span className="font-mono break-all">{selectedToken || "-"}</span></div>
                  <div className="text-xs">Selected Purpose: <span className="font-mono break-all">{selectedPurpose || "-"}</span></div>
                </div>
                <Button onClick={handleAccessData} disabled={!webhookKeys || !selectedHash || !selectedToken || !selectedPurpose || dataAccessLoading}>
                  {dataAccessLoading ? "Accessing..." : "Access Data"}
                </Button>
                {dataAccessError && <div className="text-center text-sm text-red-600 mt-2">{dataAccessError}</div>}
                {dataAccessResult && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-xs">
                    <b>Data:</b>
                    <pre className="whitespace-pre-wrap break-all">{JSON.stringify(dataAccessResult.data, null, 2)}</pre>
                    <b>Metadata:</b>
                    <pre className="whitespace-pre-wrap break-all">{JSON.stringify(dataAccessResult.metadata, null, 2)}</pre>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* --- Request Initiation Tab (Fintech Backend) --- */}
            <TabsContent value="request" className="space-y-6">
              {/* --- 4. Request Initiation (Fintech Backend) --- */}
              <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto mb-8">
                <h3 className="text-xl font-semibold mb-4">4. Initiate Third-Party Data Access Request (Fintech Backend)</h3>
                <form onSubmit={handleRequestSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium">User ID</label>
                      <input type="text" name="userId" value={requestForm.userId} onChange={handleRequestFormChange} className="mt-1 block w-full border rounded px-2 py-1" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Third Party Name</label>
                      <input type="text" name="thirdPartyName" value={requestForm.thirdPartyName} onChange={handleRequestFormChange} className="mt-1 block w-full border rounded px-2 py-1" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Purpose</label>
                      <input type="text" name="purpose" value={requestForm.purpose} onChange={handleRequestFormChange} className="mt-1 block w-full border rounded px-2 py-1" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Official Email</label>
                      <input type="email" name="officialEmail" value={requestForm.officialEmail} onChange={handleRequestFormChange} className="mt-1 block w-full border rounded px-2 py-1" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Organization</label>
                      <input type="text" name="organization" value={requestForm.organization} onChange={handleRequestFormChange} className="mt-1 block w-full border rounded px-2 py-1" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Use Case</label>
                      <input type="text" name="useCase" value={requestForm.useCase} onChange={handleRequestFormChange} className="mt-1 block w-full border rounded px-2 py-1" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Description</label>
                    <textarea name="description" value={requestForm.description} onChange={handleRequestFormChange} className="mt-1 block w-full border rounded px-2 py-1" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Dynamic Fields</label>
                    <div className="space-y-2">
                      {requestForm.dynamicFields.map((field, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input type="text" placeholder="Field Name" value={field.fieldName} onChange={e => handleRequestFormChange(e, idx, "fieldName")} className="border rounded px-2 py-1 w-32" required />
                          <input type="text" placeholder="Field Type" value={field.fieldType} onChange={e => handleRequestFormChange(e, idx, "fieldType")} className="border rounded px-2 py-1 w-32" required />
                          <label className="flex items-center gap-1 text-xs">
                            <input type="checkbox" checked={field.required} onChange={e => handleRequestFormChange(e, idx, "required")} /> Required
                          </label>
                          <input type="text" placeholder="Description" value={field.description} onChange={e => handleRequestFormChange(e, idx, "description")} className="border rounded px-2 py-1 w-48" required />
                          {requestForm.dynamicFields.length > 1 && (
                            <button type="button" onClick={() => removeDynamicField(idx)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                          )}
                        </div>
                      ))}
                      <button type="button" onClick={addDynamicField} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 mt-2"><Plus size={16} /> Add Field</button>
                    </div>
                  </div>
                  <div>
                    <Button type="submit" disabled={isRequesting} className="w-full">
                      {isRequesting ? "Sending Request..." : "Send Request"}
                    </Button>
                  </div>
                  {requestMessage && (
                    <div className={`text-center text-sm ${requestMessage.includes("success") ? "text-green-600" : "text-red-600"}`}>{requestMessage}</div>
                  )}
                </form>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto mt-8">
                <h4 className="text-lg font-semibold mb-4">All Request Initiations</h4>
                {isLoadingRequests ? (
                  <div className="text-center text-gray-500">Loading...</div>
                ) : allRequests.length === 0 ? (
                  <div className="text-center text-gray-500">NO REQUEST INITIATED</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-3 py-2 border">ID</th>
                          <th className="px-3 py-2 border">User ID</th>
                          <th className="px-3 py-2 border">Third Party Name</th>
                          <th className="px-3 py-2 border">Purpose</th>
                          <th className="px-3 py-2 border">Status</th>
                          <th className="px-3 py-2 border">Created At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allRequests.map((req) => (
                          <tr key={req.id}>
                            <td className="px-3 py-2 border">{req.id}</td>
                            <td className="px-3 py-2 border">{req.userId}</td>
                            <td className="px-3 py-2 border">{req.thirdPartyName}</td>
                            <td className="px-3 py-2 border">{req.purpose}</td>
                            <td className="px-3 py-2 border">{req.status}</td>
                            <td className="px-3 py-2 border">{new Date(req.createdAt).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="audit" className="space-y-6">
              <AuditLogs />
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <ProfileSection />
            </TabsContent>
          </Tabs>
        </main>
      </div>
  )
}


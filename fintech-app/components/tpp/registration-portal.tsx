"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Shield, Copy, CheckCircle, Clock, X, RefreshCw } from "lucide-react"
import { contractService } from "@/lib/contracts"
import { ContractTimer } from "@/components/shared/contract-timer"

interface RegistrationData {
  legalName: string
  jurisdiction: "EU" | "US" | "UK" | "IN" | ""
  scopes: string[]
  description: string
  tppId?: string
  expiryTimestamp?: number
  status: "draft" | "pending" | "approved" | "rejected"
  approvedAt?: string
  expiresAt?: string
  kycDocuments?: {
    hash: string
    url: string
    uploadedAt: string
  }[]
}

const AVAILABLE_SCOPES = [
  { id: "account_info", label: "Account Information", description: "Access to account details and balances" },
  { id: "transaction_history", label: "Transaction History", description: "Read transaction data" },
  { id: "payment_initiation", label: "Payment Initiation", description: "Initiate payments on behalf of users" },
  { id: "balance_inquiry", label: "Balance Inquiry", description: "Check account balances" },
  { id: "standing_orders", label: "Standing Orders", description: "Manage recurring payments" },
  { id: "direct_debits", label: "Direct Debits", description: "Set up direct debit mandates" },
]

const JURISDICTIONS = [
  { value: "EU", label: "European Union", flag: "🇪🇺" },
  { value: "US", label: "United States", flag: "🇺🇸" },
  { value: "UK", label: "United Kingdom", flag: "🇬🇧" },
  { value: "IN", label: "India", flag: "🇮🇳" },
]

export function RegistrationPortal() {
  const [registration, setRegistration] = useState<RegistrationData>({
    legalName: "",
    jurisdiction: "",
    scopes: [],
    description: "",
    status: "draft",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingStatus, setIsLoadingStatus] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Auto-refresh status when component mounts if TPP ID exists
  useEffect(() => {
    if (registration.tppId && registration.status !== "draft") {
      fetchTPPStatus(registration.tppId)
    }
  }, []) // Only run on mount

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!registration.legalName.trim()) {
      newErrors.legalName = "Legal name is required"
    }

    if (!registration.jurisdiction) {
      newErrors.jurisdiction = "Jurisdiction is required"
    }

    if (registration.scopes.length === 0) {
      newErrors.scopes = "At least one scope is required"
    }

    if (!registration.description.trim()) {
      newErrors.description = "Description is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const generateTPPId = (legalName: string, jurisdiction: string) => {
    const cleanName = legalName.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()
    const timestamp = Date.now().toString().slice(-6)
    return `TPP_${jurisdiction}_${cleanName.slice(0, 6)}_${timestamp}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      // Generate TPP ID
      const tppId = generateTPPId(registration.legalName, registration.jurisdiction)

      // // Connect to MetaMask and submit to smart contract
      // await contractService.connect()
      // const txHash = await contractService.registerTPP(
      //   registration.legalName,
      //   registration.jurisdiction,
      //   registration.scopes,
      //   365, // Default 1 year expiry
      // )

      // Prepare KYC documents (if any)
      const kycDocs = registration.kycDocuments?.map(doc => doc.url) || []

      // Real API call to backend
      const response = await fetch("http://localhost:8081/api/tpp/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          "Authorization-Refresh": `Bearer ${localStorage.getItem("refresh_token")}`
        },
        body: JSON.stringify({
          tppId: tppId,
          name: registration.legalName,
          jurisdiction: registration.jurisdiction,
          kycDocs: kycDocs,
          requestedScopes: registration.scopes
        }),
      })

      if (response.ok) {
        const data = await response.json()

        const newAccessToken = response.headers.get("X-New-Access-Token")
        if (newAccessToken) {
          localStorage.setItem("auth_token", newAccessToken)
        }
        const newRefreshToken = response.headers.get("X-New-Refresh-Token")
        if (newRefreshToken) {
          localStorage.setItem("refresh_token", newRefreshToken)
        }
        
        // Update registration state
        setRegistration((prev) => ({
          ...prev,
          tppId,
          status: "pending",
          expiryTimestamp: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60, // 1 year from now
        }))

        console.log("TPP Registration successful:", data)
        setErrors({}) // Clear any previous errors
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || "Registration failed")
      }
    } catch (error) {
      console.error("Registration failed:", error)
      setErrors({ general: error instanceof Error ? error.message : "Registration failed. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleScopeToggle = (scopeId: string) => {
    setRegistration((prev) => ({
      ...prev,
      scopes: prev.scopes.includes(scopeId) ? prev.scopes.filter((s) => s !== scopeId) : [...prev.scopes, scopeId],
    }))
  }

  const copyTPPId = () => {
    if (registration.tppId) {
      navigator.clipboard.writeText(registration.tppId)
    }
  }

  const handleRenewal = async () => {
    if (!registration.tppId) return

    try {
      await contractService.connect()
      await contractService.renewTPP(registration.tppId, 365)

      setRegistration((prev) => ({
        ...prev,
        expiryTimestamp: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
      }))
    } catch (error) {
      console.error("Renewal failed:", error)
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
          // Convert expiresAt to timestamp if needed
          expiryTimestamp: data.expiresAt ? new Date(data.expiresAt).getTime() / 1000 : prev.expiryTimestamp,
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
      setErrors({ status: error instanceof Error ? error.message : "Failed to fetch status" })
    } finally {
      setIsLoadingStatus(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* TPP ID Display */}
      {registration.tppId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              TPP Registration Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-blue-900">TPP ID</p>
                <p className="text-lg font-mono text-blue-800">{registration.tppId}</p>
              </div>
              <Button variant="outline" size="sm" onClick={copyTPPId}>
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </div>

            {registration.expiryTimestamp && (
              <ContractTimer
                title="TPP Registration Expiry"
                expiryTimestamp={registration.expiryTimestamp}
                onRenew={handleRenewal}
                showRenewButton={true}
                criticalThreshold={30}
                warningThreshold={90}
              />
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {registration.status === "pending" && (
                  <>
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-yellow-700">Registration pending approval</span>
                  </>
                )}
                {registration.status === "approved" && (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-700">Registration approved</span>
                  </>
                )}
                {registration.status === "rejected" && (
                  <>
                    <X className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-700">Registration rejected</span>
                  </>
                )}
              </div>
              
              {registration.tppId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchTPPStatus(registration.tppId!)}
                  disabled={isLoadingStatus}
                  className="ml-4"
                >
                  {isLoadingStatus ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Refresh Status
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Show approval details if available */}
            {registration.approvedAt && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Approved on:</strong> {new Date(registration.approvedAt).toLocaleString()}
                </p>
                {registration.expiresAt && (
                  <p className="text-sm text-green-800 mt-1">
                    <strong>Expires on:</strong> {new Date(registration.expiresAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Registration Form */}
      <Card>
        <CardHeader>
          <CardTitle>TPP Registration Portal</CardTitle>
          <CardDescription>
            Register as a Third-Party Provider to access banking APIs. Your TPP ID will be auto-generated upon
            submission.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {registration.status === "approved" ? (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-green-800 mb-2">Registration Approved</h3>
              <p className="text-green-600">
                Your TPP registration has been approved. You can now access banking APIs.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="legalName">Legal Name *</Label>
                  <Input
                    id="legalName"
                    value={registration.legalName}
                    onChange={(e) => setRegistration((prev) => ({ ...prev, legalName: e.target.value }))}
                    placeholder="Enter company legal name"
                    className={errors.legalName ? "border-red-500" : ""}
                    disabled={registration.status !== "draft"}
                  />
                  {errors.legalName && <p className="text-sm text-red-500">{errors.legalName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jurisdiction">Jurisdiction *</Label>
                  <Select
                    value={registration.jurisdiction}
                    onValueChange={(value: any) => setRegistration((prev) => ({ ...prev, jurisdiction: value }))}
                    disabled={registration.status !== "draft"}
                  >
                    <SelectTrigger className={errors.jurisdiction ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select jurisdiction" />
                    </SelectTrigger>
                    <SelectContent>
                      {JURISDICTIONS.map((jurisdiction) => (
                        <SelectItem key={jurisdiction.value} value={jurisdiction.value}>
                          <span className="flex items-center">
                            <span className="mr-2">{jurisdiction.flag}</span>
                            {jurisdiction.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.jurisdiction && <p className="text-sm text-red-500">{errors.jurisdiction}</p>}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Requested Scopes *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {AVAILABLE_SCOPES.map((scope) => (
                    <div
                      key={scope.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        registration.scopes.includes(scope.id)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      } ${registration.status !== "draft" ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={() => registration.status === "draft" && handleScopeToggle(scope.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={registration.scopes.includes(scope.id)}
                              onChange={() => handleScopeToggle(scope.id)}
                              className="rounded border-gray-300"
                              disabled={registration.status !== "draft"}
                            />
                            <span className="font-medium text-sm">{scope.label}</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{scope.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {errors.scopes && <p className="text-sm text-red-500">{errors.scopes}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Service Description *</Label>
                <Textarea
                  id="description"
                  value={registration.description}
                  onChange={(e) => setRegistration((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your service and use case for accessing banking APIs"
                  rows={4}
                  className={errors.description ? "border-red-500" : ""}
                  disabled={registration.status !== "draft"}
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
              </div>

              <Separator />

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-sm mb-2">Registration Process:</h4>
                <ol className="text-sm text-gray-600 space-y-1">
                  <li>1. Submit registration form with required details</li>
                  <li>2. Auto-generated TPP ID will be created</li>
                  <li>3. Upload KYC documents for verification</li>
                  <li>4. Bank admin reviews and approves registration</li>
                  <li>5. Access granted to requested API scopes</li>
                </ol>
              </div>

              {registration.status === "draft" && (
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting Registration...
                    </>
                  ) : (
                    "Submit Registration"
                  )}
                </Button>
              )}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Users, XCircle, Eye, Clock, AlertTriangle, CheckCircle, Wallet, Shield } from "lucide-react"
import { contractService } from "@/lib/contracts"
import { ContractTimer } from "@/components/shared/contract-timer"

interface ConnectedApp {
  id: string
  name: string
  logo: string
  dataTypes: string[]
  grantedAt: number
  expiryDate: number
  status: "active" | "expiring" | "expired" | "revoked"
  lastAccessed?: number
  gdprBasis: string
  tppAddress: string
}

const mockConnectedApps: ConnectedApp[] = [
  {
    id: "1",
    name: "PaymentFlow Pro",
    logo: "/placeholder.svg?height=40&width=40",
    dataTypes: ["transaction_history", "account_info"],
    grantedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    expiryDate: Date.now() + 60 * 24 * 60 * 60 * 1000,
    status: "active",
    lastAccessed: Date.now() - 2 * 24 * 60 * 60 * 1000,
    gdprBasis: "Article 6(1)(a) - Consent",
    tppAddress: "0x742d35Cc6634C0532925a3b8D0C9C0E3C5d5c8eE",
  },
  {
    id: "2",
    name: "BudgetTracker",
    logo: "/placeholder.svg?height=40&width=40",
    dataTypes: ["balance_inquiry", "transaction_history"],
    grantedAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
    expiryDate: Date.now() + 25 * 24 * 60 * 60 * 1000,
    status: "expiring",
    lastAccessed: Date.now() - 1 * 24 * 60 * 60 * 1000,
    gdprBasis: "Article 6(1)(a) - Consent",
    tppAddress: "0x8ba1f109551bD432803012645Hac136c30C6756M",
  },
  {
    id: "3",
    name: "InvestmentAnalyzer",
    logo: "/placeholder.svg?height=40&width=40",
    dataTypes: ["account_info"],
    grantedAt: Date.now() - 100 * 24 * 60 * 60 * 1000,
    expiryDate: Date.now() - 10 * 24 * 60 * 60 * 1000,
    status: "expired",
    gdprBasis: "Article 6(1)(a) - Consent",
    tppAddress: "0x9Cc9a2c777605Af16872E0997b3Aeb91d96D5FA2",
  },
]

const REVOCATION_REASONS = [
  { value: "no_longer_needed", label: "Service no longer needed" },
  { value: "privacy_concerns", label: "Privacy concerns" },
  { value: "security_breach", label: "Security breach" },
  { value: "terms_changed", label: "Terms of service changed" },
  { value: "other", label: "Other reason" },
]

export function ConsentManagement() {
  const [connectedApps, setConnectedApps] = useState<ConnectedApp[]>(mockConnectedApps)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [metaMaskConnected, setMetaMaskConnected] = useState(false)
  const [revocationDialog, setRevocationDialog] = useState<{
    open: boolean
    app: ConnectedApp | null
  }>({ open: false, app: null })

  useEffect(() => {
    // Check MetaMask connection status
    const checkMetaMaskConnection = async () => {
      try {
        if (window.ethereum) {
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          setMetaMaskConnected(accounts.length > 0)
        }
      } catch (error) {
        console.error("MetaMask check failed:", error)
      }
    }

    checkMetaMaskConnection()

    // Update app statuses based on expiry
    const updatedApps = connectedApps.map((app) => {
      const daysUntilExpiry = Math.floor((app.expiryDate - Date.now()) / (24 * 60 * 60 * 1000))

      if (app.status === "revoked") return app

      if (daysUntilExpiry < 0) {
        return { ...app, status: "expired" as const }
      } else if (daysUntilExpiry <= 30) {
        return { ...app, status: "expiring" as const }
      } else {
        return { ...app, status: "active" as const }
      }
    })

    setConnectedApps(updatedApps)
  }, [])

  const connectMetaMask = async () => {
    try {
      await contractService.connect()
      setMetaMaskConnected(true)
    } catch (error) {
      console.error("MetaMask connection failed:", error)
    }
  }

  const handleRevoke = async (app: ConnectedApp, reason: string, customReason?: string) => {
    if (!metaMaskConnected) {
      await connectMetaMask()
      return
    }

    try {
      const revocationReason = reason === "other" ? customReason || "User requested" : reason

      // Revoke each data type consent
      for (const dataType of app.dataTypes) {
        await contractService.revokeConsent(app.tppAddress, dataType, revocationReason)
      }

      // Update app status
      setConnectedApps((prev) => prev.map((a) => (a.id === app.id ? { ...a, status: "revoked" as const } : a)))

      setRevocationDialog({ open: false, app: null })
    } catch (error) {
      console.error("Consent revocation failed:", error)
    }
  }

  const filteredApps = connectedApps.filter((app) => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || app.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "expiring":
        return <Badge className="bg-yellow-100 text-yellow-800">Expiring Soon</Badge>
      case "expired":
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>
      case "revoked":
        return <Badge className="bg-gray-100 text-gray-800">Revoked</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "expiring":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "expired":
        return <Clock className="h-4 w-4 text-red-500" />
      case "revoked":
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return <Shield className="h-4 w-4 text-gray-500" />
    }
  }

  const getDaysUntilExpiry = (expiryDate: number) => {
    return Math.floor((expiryDate - Date.now()) / (24 * 60 * 60 * 1000))
  }

  const activeApps = connectedApps.filter((app) => app.status === "active").length
  const expiringApps = connectedApps.filter((app) => app.status === "expiring").length

  return (
    <div className="space-y-6">
      {/* MetaMask Connection Status */}
      {!metaMaskConnected && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Wallet className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">MetaMask Required</p>
                  <p className="text-sm text-yellow-700">Connect MetaMask to manage consents on-chain</p>
                </div>
              </div>
              <Button onClick={connectMetaMask}>Connect MetaMask</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Consents</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeApps}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{expiringApps}</div>
            <p className="text-xs text-muted-foreground">Within 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Apps</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{connectedApps.length}</div>
            <p className="text-xs text-muted-foreground">Connected services</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Connected Applications
          </CardTitle>
          <CardDescription>Manage your data sharing consents with third-party applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expiring">Expiring Soon</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="revoked">Revoked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Connected Apps List */}
          <div className="space-y-4">
            {filteredApps.map((app) => (
              <Card
                key={app.id}
                className={`${app.status === "expiring" ? "border-yellow-300 bg-yellow-50" : ""} ${app.status === "expired" ? "border-red-300 bg-red-50" : ""}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <img
                        src={app.logo || "/placeholder.svg"}
                        alt={app.name}
                        className="w-12 h-12 rounded-lg border"
                      />
                      <div>
                        <CardTitle className="text-base flex items-center">
                          {getStatusIcon(app.status)}
                          <span className="ml-2">{app.name}</span>
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          {getStatusBadge(app.status)}
                          <span className="text-xs text-gray-500">
                            Connected {Math.floor((Date.now() - app.grantedAt) / (24 * 60 * 60 * 1000))} days ago
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {app.status !== "expired" && app.status !== "revoked" && (
                        <ContractTimer
                          title=""
                          expiryTimestamp={Math.floor(app.expiryDate / 1000)}
                          criticalThreshold={7}
                          warningThreshold={30}
                        />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Data Access</p>
                      <div className="flex flex-wrap gap-2">
                        {app.dataTypes.map((dataType) => (
                          <Badge key={dataType} variant="outline" className="text-xs">
                            {dataType.replace("_", " ")}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">GDPR Basis</p>
                      <p className="text-xs text-gray-600">{app.gdprBasis}</p>
                      {app.lastAccessed && (
                        <p className="text-xs text-gray-500 mt-1">
                          Last accessed: {new Date(app.lastAccessed).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Shared Data
                    </Button>

                    {app.status === "active" && metaMaskConnected && (
                      <Dialog
                        open={revocationDialog.open && revocationDialog.app?.id === app.id}
                        onOpenChange={(open) => setRevocationDialog({ open, app: open ? app : null })}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Revoke Access
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Revoke Consent</DialogTitle>
                            <DialogDescription>
                              You are about to revoke {app.name}'s access to your data. This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <RevocationForm
                            app={app}
                            onRevoke={handleRevoke}
                            onCancel={() => setRevocationDialog({ open: false, app: null })}
                          />
                        </DialogContent>
                      </Dialog>
                    )}

                    {app.status === "expired" && (
                      <Button size="sm" variant="outline">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Renew Consent
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredApps.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No connected applications found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Revocation Form Component
function RevocationForm({
  app,
  onRevoke,
  onCancel,
}: {
  app: ConnectedApp
  onRevoke: (app: ConnectedApp, reason: string, customReason?: string) => void
  onCancel: () => void
}) {
  const [reason, setReason] = useState("")
  const [customReason, setCustomReason] = useState("")
  const [isRevoking, setIsRevoking] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason) return

    setIsRevoking(true)
    try {
      await onRevoke(app, reason, customReason)
    } finally {
      setIsRevoking(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reason">Reason for Revocation</Label>
        <Select value={reason} onValueChange={setReason} required>
          <SelectTrigger>
            <SelectValue placeholder="Select a reason" />
          </SelectTrigger>
          <SelectContent>
            {REVOCATION_REASONS.map((reasonOption) => (
              <SelectItem key={reasonOption.value} value={reasonOption.value}>
                {reasonOption.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {reason === "other" && (
        <div className="space-y-2">
          <Label htmlFor="customReason">Custom Reason</Label>
          <Textarea
            id="customReason"
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder="Please specify your reason..."
            required
          />
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800">Important Notice</p>
            <p className="text-xs text-yellow-700 mt-1">
              Revoking consent will immediately stop {app.name} from accessing your data. This action will be recorded
              on the blockchain and cannot be undone.
            </p>
          </div>
        </div>
      </div>

      <div className="flex space-x-2">
        <Button type="submit" disabled={isRevoking || !reason} className="bg-red-600 hover:bg-red-700">
          {isRevoking ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Revoking...
            </>
          ) : (
            "Confirm Revocation"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

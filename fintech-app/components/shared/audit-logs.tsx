"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, User, Activity, Download } from "lucide-react"

interface AuditLog {
  id: string
  timestamp: string
  user: string
  action: string
  resource: string
  status: "success" | "failure" | "warning"
  ipAddress: string
  userAgent: string
  details?: string
}

const mockAuditLogs: AuditLog[] = [
  {
    id: "1",
    timestamp: "2024-01-15T10:30:00Z",
    user: "john.doe@bank.com",
    action: "TPP_APPROVED",
    resource: "TPP Registration",
    status: "success",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0...",
    details: "Approved TPP registration for PayTech Ltd",
  },
  {
    id: "2",
    timestamp: "2024-01-15T10:25:00Z",
    user: "alice.smith@paytech.com",
    action: "KYC_UPLOADED",
    resource: "KYC Document",
    status: "success",
    ipAddress: "203.0.113.45",
    userAgent: "Mozilla/5.0...",
    details: "Uploaded KYC documents to IPFS",
  },
  {
    id: "3",
    timestamp: "2024-01-15T10:20:00Z",
    user: "bob.wilson@fintech.com",
    action: "CONSENT_REVOKED",
    resource: "User Consent",
    status: "success",
    ipAddress: "198.51.100.22",
    userAgent: "Mozilla/5.0...",
    details: "Revoked consent for transaction data access",
  },
  {
    id: "4",
    timestamp: "2024-01-15T10:15:00Z",
    user: "system",
    action: "ANOMALY_DETECTED",
    resource: "Transaction Monitor",
    status: "warning",
    ipAddress: "127.0.0.1",
    userAgent: "System Process",
    details: "Unusual transaction pattern detected for user ID 12345",
  },
  {
    id: "5",
    timestamp: "2024-01-15T10:10:00Z",
    user: "charlie.brown@bank.com",
    action: "LOGIN_FAILED",
    resource: "Authentication",
    status: "failure",
    ipAddress: "192.0.2.146",
    userAgent: "Mozilla/5.0...",
    details: "Failed login attempt - invalid credentials",
  },
]

export function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>(mockAuditLogs)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [actionFilter, setActionFilter] = useState<string>("all")

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || log.status === statusFilter
    const matchesAction = actionFilter === "all" || log.action === actionFilter

    return matchesSearch && matchesStatus && matchesAction
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Success</Badge>
      case "failure":
        return <Badge className="bg-red-100 text-red-800">Failure</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getActionIcon = (action: string) => {
    if (action.includes("LOGIN")) return <User className="h-4 w-4" />
    if (action.includes("APPROVED") || action.includes("REJECTED")) return <Activity className="h-4 w-4" />
    return <Clock className="h-4 w-4" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Audit Logs
        </CardTitle>
        <CardDescription>Track all system activities and user actions</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search logs..."
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
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failure">Failure</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
            </SelectContent>
          </Select>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="TPP_APPROVED">TPP Approved</SelectItem>
              <SelectItem value="KYC_UPLOADED">KYC Uploaded</SelectItem>
              <SelectItem value="CONSENT_REVOKED">Consent Revoked</SelectItem>
              <SelectItem value="ANOMALY_DETECTED">Anomaly Detected</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Logs Table */}
        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-3">
                  {getActionIcon(log.action)}
                  <div>
                    <p className="font-medium text-sm">{log.action.replace(/_/g, " ")}</p>
                    <p className="text-xs text-gray-500">{log.resource}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(log.status)}
                  <span className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600">
                <div>
                  <span className="font-medium">User:</span> {log.user}
                </div>
                <div>
                  <span className="font-medium">IP:</span> {log.ipAddress}
                </div>
              </div>

              {log.details && (
                <div className="mt-2 text-xs text-gray-600">
                  <span className="font-medium">Details:</span> {log.details}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-8 text-gray-500">No audit logs found matching your criteria</div>
        )}
      </CardContent>
    </Card>
  )
}

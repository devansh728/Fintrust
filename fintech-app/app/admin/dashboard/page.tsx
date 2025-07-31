"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Globe,
  Activity,
  Search,
  MoreHorizontal,
  FileText,
  Shield,
  RefreshCw,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { RoleGuard } from "@/components/auth/role-guard"
import { AuditLogs } from "@/components/shared/audit-logs"
import { NotificationSystem } from "@/components/shared/notifications"
import { ProfileSection } from "@/components/shared/profile-section"
import { getCurrentUser } from "@/lib/auth"
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Area,
} from "recharts"

interface TPPApplication {
  id: string
  tppId: string
  name: string
  jurisdiction: string
  scopes: string[]
  status: "pending" | "approved" | "rejected"
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  riskScore: number
  kycDocuments: number
}

interface AnomalyAlert {
  id: string
  type: "unusual_transaction" | "suspicious_pattern" | "rate_limit_exceeded" | "unauthorized_access"
  severity: "low" | "medium" | "high" | "critical"
  description: string
  affectedEntity: string
  detectedAt: string
  status: "open" | "investigating" | "resolved" | "false_positive"
}

interface UserConsent {
  id: string
  userId: string
  userName: string
  tppName: string
  dataType: string
  grantedAt: string
  expiresAt: string
  status: "active" | "expired" | "revoked"
  lastAccessed?: string
}

const mockTPPApplications: TPPApplication[] = [
  {
    id: "1",
    tppId: "TPP_UK_PAYTEC_001",
    name: "PayTech Solutions Ltd",
    jurisdiction: "United Kingdom",
    scopes: ["account_info", "transaction_history", "payment_initiation"],
    status: "pending",
    submittedAt: "2024-01-15T10:00:00Z",
    riskScore: 75,
    kycDocuments: 3,
  },
  {
    id: "2",
    tppId: "TPP_EU_FINFLOW_002",
    name: "FinanceFlow Inc",
    jurisdiction: "European Union",
    scopes: ["account_info", "balance_inquiry"],
    status: "pending",
    submittedAt: "2024-01-14T14:30:00Z",
    riskScore: 85,
    kycDocuments: 2,
  },
  {
    id: "3",
    tppId: "TPP_US_CRYPTO_003",
    name: "CryptoGate Ltd",
    jurisdiction: "United States",
    scopes: ["payment_initiation", "transaction_history"],
    status: "approved",
    submittedAt: "2024-01-10T09:15:00Z",
    reviewedAt: "2024-01-12T11:30:00Z",
    reviewedBy: "admin@bank.com",
    riskScore: 90,
    kycDocuments: 4,
  },
]

const mockAnomalyAlerts: AnomalyAlert[] = [
  {
    id: "1",
    type: "unusual_transaction",
    severity: "high",
    description: "Large transaction volume detected outside normal business hours",
    affectedEntity: "User ID: 12345",
    detectedAt: "2024-01-15T02:30:00Z",
    status: "open",
  },
  {
    id: "2",
    type: "suspicious_pattern",
    severity: "medium",
    description: "Multiple failed login attempts from different IP addresses",
    affectedEntity: "PayTech Solutions Ltd",
    detectedAt: "2024-01-15T01:15:00Z",
    status: "investigating",
  },
  {
    id: "3",
    type: "rate_limit_exceeded",
    severity: "low",
    description: "API rate limit exceeded by 150%",
    affectedEntity: "FinanceFlow Inc",
    detectedAt: "2024-01-14T23:45:00Z",
    status: "resolved",
  },
]

const mockUserConsents: UserConsent[] = [
  {
    id: "1",
    userId: "user123",
    userName: "Alice Johnson",
    tppName: "PayTech Solutions Ltd",
    dataType: "transaction_history",
    grantedAt: "2024-01-15T09:00:00Z",
    expiresAt: "2024-04-15T09:00:00Z",
    status: "active",
    lastAccessed: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    userId: "user456",
    userName: "Bob Smith",
    tppName: "CryptoGate Ltd",
    dataType: "account_info",
    grantedAt: "2024-01-10T14:30:00Z",
    expiresAt: "2024-01-20T14:30:00Z",
    status: "expired",
  },
  {
    id: "3",
    userId: "user789",
    userName: "Charlie Brown",
    tppName: "FinanceFlow Inc",
    dataType: "payment_initiation",
    grantedAt: "2024-01-12T11:15:00Z",
    expiresAt: "2024-04-12T11:15:00Z",
    status: "active",
    lastAccessed: "2024-01-14T16:20:00Z",
  },
]

const geoDistributionData = [
  { country: "United Kingdom", tpps: 45, color: "#3b82f6" },
  { country: "European Union", tpps: 38, color: "#10b981" },
  { country: "United States", tpps: 32, color: "#f59e0b" },
  { country: "Canada", tpps: 18, color: "#ef4444" },
  { country: "Australia", tpps: 12, color: "#8b5cf6" },
  { country: "Others", tpps: 25, color: "#6b7280" },
]

const tppGrowthData = [
  { month: "Jul", active: 120, pending: 15, rejected: 8 },
  { month: "Aug", active: 135, pending: 18, rejected: 12 },
  { month: "Sep", active: 152, pending: 22, rejected: 9 },
  { month: "Oct", active: 168, pending: 19, rejected: 14 },
  { month: "Nov", active: 185, pending: 25, rejected: 11 },
  { month: "Dec", active: 203, pending: 28, rejected: 16 },
]

const chartConfig = {
  active: {
    label: "Active TPPs",
    color: "#10b981",
  },
  pending: {
    label: "Pending",
    color: "#f59e0b",
  },
  rejected: {
    label: "Rejected",
    color: "#ef4444",
  },
} satisfies ChartConfig

export default function AdminDashboard() {
  const [applications, setApplications] = useState<TPPApplication[]>([])
  const [alerts, setAlerts] = useState<AnomalyAlert[]>(mockAnomalyAlerts)
  const [consents, setConsents] = useState<UserConsent[]>(mockUserConsents)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isLoadingPending, setIsLoadingPending] = useState(false)
  const [isApproving, setIsApproving] = useState<string | null>(null)

  // Fetch pending TPPs from backend
  const fetchPendingTPPs = async () => {
    setIsLoadingPending(true)
    try {
      const response = await fetch("http://localhost:8081/api/admin/pending-tpps", {
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
        
        // Transform backend data to match our interface
        const transformedApplications: TPPApplication[] = data.map((tpp: any, index: number) => ({
          id: (index + 1).toString(),
          tppId: tpp.tppId,
          name: tpp.name,
          jurisdiction: tpp.jurisdiction,
          scopes: tpp.requestedScopes,
          status: "pending" as const,
          submittedAt: tpp.submittedAt,
          riskScore: Math.floor(Math.random() * 30) + 70, // Mock risk score
          kycDocuments: Math.floor(Math.random() * 3) + 1, // Mock KYC count
        }))

        setApplications(transformedApplications)
        console.log("Pending TPPs fetched:", data)
      } else {
        console.error("Failed to fetch pending TPPs")
        // Fallback to mock data if backend fails
        setApplications(mockTPPApplications)
      }
    } catch (error) {
      console.error("Error fetching pending TPPs:", error)
      // Fallback to mock data on error
      setApplications(mockTPPApplications)
    } finally {
      setIsLoadingPending(false)
    }
  }

  // Load pending TPPs when component mounts
  useEffect(() => {
    fetchPendingTPPs()
  }, [])

  const handleApproveApplication = async (applicationId: string) => {
    const application = applications.find(app => app.id === applicationId)
    if (!application) return

    setIsApproving(applicationId)
    try {
      // Get current user for adminId
      const currentUser = getCurrentUser()
      const adminId = currentUser?.email || "admin@bank.com"

      const response = await fetch("http://localhost:8081/api/admin/approve-tpp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          "Authorization-Refresh": `Bearer ${localStorage.getItem("refresh_token")}`
        },
        body: JSON.stringify({
          tppId: application.tppId,
          adminId: adminId,
          approved: true,
          expiryDays: 365
        }),
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
        // Update local state
        setApplications((prev) =>
          prev.map((app) =>
            app.id === applicationId
              ? {
                  ...app,
                  status: "approved" as const,
                  reviewedAt: new Date().toISOString(),
                  reviewedBy: adminId,
                }
              : app,
          ),
        )
        console.log("TPP approved successfully")
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || "Approval failed")
      }
    } catch (error) {
      console.error("Approval failed:", error)
      // You could add error state handling here
    } finally {
      setIsApproving(null)
    }
  }

  const handleRejectApplication = async (applicationId: string) => {
    const application = applications.find(app => app.id === applicationId)
    if (!application) return

    setIsApproving(applicationId)
    try {
      // Get current user for adminId
      const currentUser = getCurrentUser()
      const adminId = currentUser?.email || "admin@bank.com"

      const response = await fetch("http://localhost:8081/api/admin/approve-tpp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          "Authorization-Refresh": `Bearer ${localStorage.getItem("refresh_token")}`
        },
        body: JSON.stringify({
          tppId: application.tppId,
          adminId: adminId,
          approved: false,
          expiryDays: 0
        }),
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
        // Update local state
        setApplications((prev) =>
          prev.map((app) =>
            app.id === applicationId
              ? {
                  ...app,
                  status: "rejected" as const,
                  reviewedAt: new Date().toISOString(),
                  reviewedBy: adminId,
                }
              : app,
          ),
        )
        console.log("TPP rejected successfully")
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || "Rejection failed")
      }
    } catch (error) {
      console.error("Rejection failed:", error)
    } finally {
      setIsApproving(null)
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
      case "open":
        return <Badge className="bg-red-100 text-red-800">Open</Badge>
      case "investigating":
        return <Badge className="bg-yellow-100 text-yellow-800">Investigating</Badge>
      case "resolved":
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>
      case "false_positive":
        return <Badge className="bg-gray-100 text-gray-800">False Positive</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge className="bg-red-600 text-white">Critical</Badge>
      case "high":
        return <Badge className="bg-red-100 text-red-800">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
      case "low":
        return <Badge className="bg-blue-100 text-blue-800">Low</Badge>
      default:
        return <Badge variant="secondary">{severity}</Badge>
    }
  }

  const getRiskScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jurisdiction.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || app.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const pendingApplications = applications.filter((app) => app.status === "pending").length
  const openAlerts = alerts.filter((alert) => alert.status === "open").length
  const activeConsents = consents.filter((consent) => consent.status === "active").length
  const totalTPPs = geoDistributionData.reduce((sum, item) => sum + item.tpps, 0)

  return (
    <RoleGuard allowedRoles={["ROLE_BANK_ADMIN"]}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Link href="/home">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Bank Admin Dashboard</h1>
              </div>
              <div className="flex items-center space-x-4">
                <NotificationSystem />
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Reports
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{pendingApplications}</div>
                <p className="text-xs text-muted-foreground">Requiring review</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{openAlerts}</div>
                <p className="text-xs text-muted-foreground">Security incidents</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Consents</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{activeConsents}</div>
                <p className="text-xs text-muted-foreground">User permissions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total TPPs</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{totalTPPs}</div>
                <p className="text-xs text-muted-foreground">Registered providers</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="applications">Approval Queue</TabsTrigger>
              <TabsTrigger value="alerts">Anomaly Alerts</TabsTrigger>
              <TabsTrigger value="consents">User Consents</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* TPP Growth Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>TPP Growth Trends</CardTitle>
                    <CardDescription>Monthly TPP registration and approval trends</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig}>
                      <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={tppGrowthData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Area dataKey="active" fill="var(--color-active)" fillOpacity={0.3} />
                          <Bar dataKey="pending" fill="var(--color-pending)" />
                          <Bar dataKey="rejected" fill="var(--color-rejected)" />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Geo Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Geographic Distribution</CardTitle>
                    <CardDescription>TPPs by jurisdiction</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={geoDistributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="tpps"
                        >
                          {geoDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload
                              return (
                                <div className="bg-white p-2 border rounded shadow">
                                  <p className="font-medium">{data.country}</p>
                                  <p className="text-sm text-gray-600">{data.tpps} TPPs</p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {geoDistributionData.map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-xs text-gray-600">{item.country}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Latest system events and administrative actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-3 border rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">TPP Application Approved</p>
                        <p className="text-xs text-gray-500">CryptoGate Ltd registration approved</p>
                      </div>
                      <span className="text-xs text-gray-400">2 hours ago</span>
                    </div>

                    <div className="flex items-center space-x-4 p-3 border rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Anomaly Detected</p>
                        <p className="text-xs text-gray-500">Unusual transaction pattern flagged</p>
                      </div>
                      <span className="text-xs text-gray-400">4 hours ago</span>
                    </div>

                    <div className="flex items-center space-x-4 p-3 border rounded-lg">
                      <Users className="h-5 w-5 text-blue-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">New User Consent</p>
                        <p className="text-xs text-gray-500">User granted data access to PayTech Solutions</p>
                      </div>
                      <span className="text-xs text-gray-400">6 hours ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Audit Logs */}
              <AuditLogs />
            </TabsContent>

            <TabsContent value="applications" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <Clock className="h-5 w-5 mr-2" />
                        TPP Approval Queue
                      </CardTitle>
                      <CardDescription>Review and approve pending TPP applications</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={fetchPendingTPPs}
                      disabled={isLoadingPending}
                      size="sm"
                    >
                      {isLoadingPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                          Loading...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Refresh
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
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
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Applications Table */}
                  <div className="space-y-4">
                    {filteredApplications.map((application) => (
                      <div key={application.id} className="border rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-medium">{application.name}</h3>
                            <p className="text-sm text-gray-500">Jurisdiction: {application.jurisdiction}</p>
                            <p className="text-xs text-gray-400">
                              Submitted: {new Date(application.submittedAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <p className="text-sm font-medium">Risk Score</p>
                              <p className={`text-lg font-bold ${getRiskScoreColor(application.riskScore)}`}>
                                {application.riskScore}%
                              </p>
                            </div>
                            {getStatusBadge(application.status)}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium mb-2">Requested Scopes:</p>
                            <div className="flex flex-wrap gap-2">
                              {application.scopes.map((scope) => (
                                <Badge key={scope} variant="outline">
                                  {scope.replace("_", " ")}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium">KYC Documents: {application.kycDocuments}</p>
                            {application.reviewedAt && (
                              <p className="text-xs text-gray-500">
                                Reviewed: {new Date(application.reviewedAt).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>

                        {application.status === "pending" && (
                          <div className="flex space-x-3">
                            <Button
                              onClick={() => handleApproveApplication(application.id)}
                              disabled={isApproving === application.id}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {isApproving === application.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Approving...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleRejectApplication(application.id)}
                              disabled={isApproving === application.id}
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              {isApproving === application.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                                  Rejecting...
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </>
                              )}
                            </Button>
                            <Button variant="outline">
                              <FileText className="h-4 w-4 mr-2" />
                              View KYC
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {filteredApplications.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No applications found matching your criteria</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Anomaly Detection Alerts
                  </CardTitle>
                  <CardDescription>
                    Monitor and investigate security anomalies and suspicious activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {alerts.map((alert) => (
                      <div key={alert.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start space-x-3">
                            <AlertTriangle
                              className={`h-5 w-5 mt-0.5 ${
                                alert.severity === "critical"
                                  ? "text-red-600"
                                  : alert.severity === "high"
                                    ? "text-red-500"
                                    : alert.severity === "medium"
                                      ? "text-yellow-500"
                                      : "text-blue-500"
                              }`}
                            />
                            <div>
                              <p className="font-medium">{alert.description}</p>
                              <p className="text-sm text-gray-500">Affected: {alert.affectedEntity}</p>
                              <p className="text-xs text-gray-400">
                                Detected: {new Date(alert.detectedAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getSeverityBadge(alert.severity)}
                            {getStatusBadge(alert.status)}
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Search className="h-4 w-4 mr-1" />
                            Investigate
                          </Button>
                          <Button size="sm" variant="outline">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Resolved
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="outline">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Assign to Team</DropdownMenuItem>
                              <DropdownMenuItem>Mark as False Positive</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>

                  {alerts.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No anomaly alerts detected</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="consents" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    User Consent Oversight
                  </CardTitle>
                  <CardDescription>Monitor and manage user consent permissions across all TPPs</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <Input placeholder="Search by user or TPP name..." className="flex-1" />
                    <Select defaultValue="all">
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="revoked">Revoked</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by expiry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Dates</SelectItem>
                        <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Consents Table */}
                  <div className="space-y-4">
                    {consents.map((consent) => (
                      <div key={consent.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-medium">{consent.userName}</p>
                            <p className="text-sm text-gray-500">User ID: {consent.userId}</p>
                            <p className="text-sm text-gray-600">TPP: {consent.tppName}</p>
                          </div>
                          {getStatusBadge(consent.status)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div>
                            <p className="text-sm font-medium">Data Type</p>
                            <p className="text-sm text-gray-600">{consent.dataType.replace("_", " ")}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Granted</p>
                            <p className="text-sm text-gray-600">{new Date(consent.grantedAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Expires</p>
                            <p className="text-sm text-gray-600">{new Date(consent.expiresAt).toLocaleDateString()}</p>
                          </div>
                        </div>

                        {consent.lastAccessed && (
                          <p className="text-xs text-gray-500 mb-3">
                            Last accessed: {new Date(consent.lastAccessed).toLocaleString()}
                          </p>
                        )}

                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <FileText className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                          {consent.status === "active" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Revoke Consent
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {consents.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No user consents found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <ProfileSection />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </RoleGuard>
  )
}

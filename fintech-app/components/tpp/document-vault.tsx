"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FileText, Upload, Download, RefreshCw, AlertTriangle, CheckCircle, Clock, Archive, Eye } from "lucide-react"
import { ipfsService } from "@/lib/ipfs"
import { contractService } from "@/lib/contracts"
import { ContractTimer } from "@/components/shared/contract-timer"

interface Document {
  id: number
  name: string
  type: "KYC" | "License" | "Certificate" | "Other"
  ipfsHash: string
  uploadDate: number
  expiryDate: number
  status: "active" | "expiring" | "expired"
  size: number
  gdprTags: string[]
}

const mockDocuments: Document[] = [
  {
    id: 1,
    name: "Company Registration Certificate",
    type: "Certificate",
    ipfsHash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
    uploadDate: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
    expiryDate: Date.now() + 335 * 24 * 60 * 60 * 1000, // 335 days from now
    status: "active",
    size: 2048576,
    gdprTags: ["Article 6(1)(c) - Legal obligation"],
  },
  {
    id: 2,
    name: "Financial Services License",
    type: "License",
    ipfsHash: "QmPChd2hVbrJ1bfo2WecTSudb8iSAKEiYLtV4MSTDwCEIP",
    uploadDate: Date.now() - 340 * 24 * 60 * 60 * 1000, // 340 days ago
    expiryDate: Date.now() + 25 * 24 * 60 * 60 * 1000, // 25 days from now
    status: "expiring",
    size: 1536000,
    gdprTags: ["Article 6(1)(c) - Legal obligation", "Article 9(2)(g) - Substantial public interest"],
  },
  {
    id: 3,
    name: "KYC Documentation",
    type: "KYC",
    ipfsHash: "QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn",
    uploadDate: Date.now() - 370 * 24 * 60 * 60 * 1000, // 370 days ago
    expiryDate: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago (expired)
    status: "expired",
    size: 3072000,
    gdprTags: ["Article 6(1)(c) - Legal obligation", "Article 9(2)(a) - Explicit consent"],
  },
]

const DOCUMENT_TYPES = [
  { value: "KYC", label: "KYC Documentation" },
  { value: "License", label: "License/Permit" },
  { value: "Certificate", label: "Certificate" },
  { value: "Other", label: "Other" },
]

const EXPIRY_PERIODS = [
  { value: "90", label: "90 days" },
  { value: "180", label: "6 months" },
  { value: "365", label: "1 year" },
  { value: "730", label: "2 years" },
  { value: "1095", label: "3 years" },
]

export function DocumentVault() {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments)
  const [historicalDocuments, setHistoricalDocuments] = useState<Document[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    name: "",
    type: "KYC" as Document["type"],
    expiryDays: "365",
    file: null as File | null,
  })
  const [renewalDialog, setRenewalDialog] = useState<{
    open: boolean
    document: Document | null
  }>({ open: false, document: null })

  useEffect(() => {
    // Auto-archive expired documents
    const activeDocuments = documents.filter((doc) => doc.status !== "expired")
    const expiredDocuments = documents.filter((doc) => doc.status === "expired")

    if (expiredDocuments.length > 0) {
      setHistoricalDocuments((prev) => [...prev, ...expiredDocuments])
      setDocuments(activeDocuments)
    }

    // Update document statuses based on expiry
    const updatedDocuments = activeDocuments.map((doc) => {
      const daysUntilExpiry = Math.floor((doc.expiryDate - Date.now()) / (24 * 60 * 60 * 1000))

      if (daysUntilExpiry < 0) {
        return { ...doc, status: "expired" as const }
      } else if (daysUntilExpiry <= 30) {
        return { ...doc, status: "expiring" as const }
      } else {
        return { ...doc, status: "active" as const }
      }
    })

    setDocuments(updatedDocuments)
  }, [])

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadForm.file) return

    setIsUploading(true)
    try {
      // Upload to IPFS
      const ipfsResult = await ipfsService.uploadFile(uploadForm.file)

      // Upload to smart contract
      await contractService.connect()
      const docId = await contractService.uploadDocument(
        ipfsResult.hash,
        uploadForm.type,
        Number.parseInt(uploadForm.expiryDays),
      )

      // Create new document record
      const newDocument: Document = {
        id: docId,
        name: uploadForm.name,
        type: uploadForm.type,
        ipfsHash: ipfsResult.hash,
        uploadDate: Date.now(),
        expiryDate: Date.now() + Number.parseInt(uploadForm.expiryDays) * 24 * 60 * 60 * 1000,
        status: "active",
        size: uploadForm.file.size,
        gdprTags: ["Article 6(1)(c) - Legal obligation"],
      }

      setDocuments((prev) => [...prev, newDocument])

      // Reset form
      setUploadForm({
        name: "",
        type: "KYC",
        expiryDays: "365",
        file: null,
      })
    } catch (error) {
      console.error("Upload failed:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRenewal = async (document: Document, newFile: File, expiryDays: number) => {
    try {
      // Upload new file to IPFS
      const ipfsResult = await ipfsService.uploadFile(newFile)

      // Renew document in smart contract
      await contractService.connect()
      await contractService.renewDocument(document.id, ipfsResult.hash, expiryDays)

      // Update document record
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === document.id
            ? {
                ...doc,
                ipfsHash: ipfsResult.hash,
                uploadDate: Date.now(),
                expiryDate: Date.now() + expiryDays * 24 * 60 * 60 * 1000,
                status: "active" as const,
                size: newFile.size,
              }
            : doc,
        ),
      )

      setRenewalDialog({ open: false, document: null })
    } catch (error) {
      console.error("Renewal failed:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "expiring":
        return <Badge className="bg-yellow-100 text-yellow-800">Expiring Soon</Badge>
      case "expired":
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>
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
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getDaysUntilExpiry = (expiryDate: number) => {
    return Math.floor((expiryDate - Date.now()) / (24 * 60 * 60 * 1000))
  }

  return (
    <div className="space-y-6">
      {/* Upload New Document */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Upload New Document
          </CardTitle>
          <CardDescription>
            Upload documents to IPFS with automatic expiry management and GDPR compliance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="docName">Document Name</Label>
                <Input
                  id="docName"
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter document name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="docType">Document Type</Label>
                <Select
                  value={uploadForm.type}
                  onValueChange={(value: any) => setUploadForm((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDays">Expiry Period</Label>
                <Select
                  value={uploadForm.expiryDays}
                  onValueChange={(value) => setUploadForm((prev) => ({ ...prev, expiryDays: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPIRY_PERIODS.map((period) => (
                      <SelectItem key={period.value} value={period.value}>
                        {period.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="docFile">File Upload</Label>
                <Input
                  id="docFile"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setUploadForm((prev) => ({ ...prev, file: e.target.files?.[0] || null }))}
                  required
                />
                <p className="text-xs text-gray-500">Supported: PDF, PNG, JPG (Max 10MB)</p>
              </div>
            </div>

            <Button type="submit" disabled={isUploading || !uploadForm.file}>
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading to IPFS...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Document Management Tabs */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active Documents</TabsTrigger>
          <TabsTrigger value="historical">Historical</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {documents.map((document) => (
            <Card
              key={document.id}
              className={`${document.status === "expiring" ? "border-yellow-300 bg-yellow-50" : ""} ${document.status === "expired" ? "border-red-300 bg-red-50" : ""}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getStatusIcon(document.status)}
                    <div>
                      <CardTitle className="text-base">{document.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">{document.type}</Badge>
                        {getStatusBadge(document.status)}
                        <span className="text-xs text-gray-500">{formatFileSize(document.size)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {document.status === "expired"
                        ? "Expired"
                        : `${getDaysUntilExpiry(document.expiryDate)} days left`}
                    </p>
                    <p className="text-xs text-gray-500">
                      Expires: {new Date(document.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium">IPFS Hash</p>
                    <p className="text-xs font-mono text-gray-600 break-all">{document.ipfsHash}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Upload Date</p>
                    <p className="text-xs text-gray-600">{new Date(document.uploadDate).toLocaleString()}</p>
                  </div>
                </div>

                {/* GDPR Compliance Tags */}
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">GDPR/DPDP Compliance</p>
                  <div className="flex flex-wrap gap-2">
                    {document.gdprTags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Expiry Timer */}
                {document.status !== "expired" && (
                  <div className="mb-4">
                    <ContractTimer
                      title="Document Expiry"
                      expiryTimestamp={Math.floor(document.expiryDate / 1000)}
                      criticalThreshold={7}
                      warningThreshold={30}
                    />
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://ipfs.io/ipfs/${document.ipfsHash}`, "_blank")}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://ipfs.io/ipfs/${document.ipfsHash}`, "_blank")}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  {(document.status === "expiring" || document.status === "expired") && (
                    <Dialog
                      open={renewalDialog.open && renewalDialog.document?.id === document.id}
                      onOpenChange={(open) => setRenewalDialog({ open, document: open ? document : null })}
                    >
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          className={document.status === "expired" ? "bg-red-600 hover:bg-red-700" : ""}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          {document.status === "expired" ? "Renew Required" : "Renew"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Renew Document</DialogTitle>
                          <DialogDescription>
                            Upload a new version of {document.name} to extend its validity period.
                          </DialogDescription>
                        </DialogHeader>
                        <RenewalForm
                          document={document}
                          onRenew={handleRenewal}
                          onCancel={() => setRenewalDialog({ open: false, document: null })}
                        />
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {documents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No active documents found</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="historical" className="space-y-4">
          {historicalDocuments.map((document) => (
            <Card key={document.id} className="opacity-75">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Archive className="h-4 w-4 text-gray-500" />
                    <div>
                      <CardTitle className="text-base text-gray-700">{document.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">{document.type}</Badge>
                        <Badge className="bg-gray-100 text-gray-800">Archived</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      Expired: {new Date(document.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://ipfs.io/ipfs/${document.ipfsHash}`, "_blank")}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Archive
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {historicalDocuments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Archive className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No historical documents found</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Renewal Form Component
function RenewalForm({
  document,
  onRenew,
  onCancel,
}: {
  document: Document
  onRenew: (document: Document, file: File, expiryDays: number) => void
  onCancel: () => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [expiryDays, setExpiryDays] = useState("365")
  const [isRenewing, setIsRenewing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setIsRenewing(true)
    try {
      await onRenew(document, file, Number.parseInt(expiryDays))
    } finally {
      setIsRenewing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="renewalFile">New Document File</Label>
        <Input
          id="renewalFile"
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="renewalExpiry">New Expiry Period</Label>
        <Select value={expiryDays} onValueChange={setExpiryDays}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EXPIRY_PERIODS.map((period) => (
              <SelectItem key={period.value} value={period.value}>
                {period.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex space-x-2">
        <Button type="submit" disabled={isRenewing || !file}>
          {isRenewing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Renewing...
            </>
          ) : (
            "Renew Document"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

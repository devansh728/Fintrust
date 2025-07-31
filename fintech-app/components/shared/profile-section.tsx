"use client"

import { useState } from "react"
import { User, Mail, Phone, MapPin, Calendar, Shield, Edit, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getCurrentUser } from "@/lib/auth"

interface ProfileData {
  name: string
  email: string
  phone: string
  address: string
  bio: string
  company?: string
  jurisdiction?: string
  registrationDate: string
}

export function ProfileSection() {
  const user = getCurrentUser()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData>({
    name: user?.name || "John Doe",
    email: user?.email || "john@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Financial District, New York, NY 10004",
    bio: "Experienced financial technology professional with expertise in payment systems and regulatory compliance.",
    company: user?.role === "ROLE_TPP" ? "PayTech Solutions Ltd" : undefined,
    jurisdiction: user?.role === "ROLE_TPP" ? "United Kingdom" : undefined,
    registrationDate: "2024-01-01",
  })

  const [editData, setEditData] = useState<ProfileData>(profileData)

  const handleSave = () => {
    setProfileData(editData)
    setIsEditing(false)
    // In a real app, save to backend
  }

  const handleCancel = () => {
    setEditData(profileData)
    setIsEditing(false)
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ROLE_TPP":
        return <Badge className="bg-blue-100 text-blue-800">Third-Party Provider</Badge>
      case "ROLE_BANK_ADMIN":
        return <Badge className="bg-green-100 text-green-800">Bank Administrator</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">User</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="/placeholder.svg?height=80&width=80" alt={profileData.name} />
                <AvatarFallback className="text-lg">
                  {profileData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{profileData.name}</CardTitle>
                <CardDescription className="text-base">{profileData.email}</CardDescription>
                <div className="mt-2">{user && getRoleBadge(user.role)}</div>
              </div>
            </div>
            <Button
              variant={isEditing ? "destructive" : "outline"}
              onClick={isEditing ? handleCancel : () => setIsEditing(true)}
            >
              {isEditing ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Profile Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Profile Information
          </CardTitle>
          <CardDescription>Manage your personal and professional information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={editData.name}
                  onChange={(e) => setEditData((prev) => ({ ...prev, name: e.target.value }))}
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>{profileData.name}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData((prev) => ({ ...prev, email: e.target.value }))}
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{profileData.email}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={editData.phone}
                  onChange={(e) => setEditData((prev) => ({ ...prev, phone: e.target.value }))}
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{profileData.phone}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrationDate">Registration Date</Label>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{new Date(profileData.registrationDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {user?.role === "ROLE_TPP" && (
            <>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  {isEditing ? (
                    <Input
                      id="company"
                      value={editData.company || ""}
                      onChange={(e) => setEditData((prev) => ({ ...prev, company: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-gray-500" />
                      <span>{profileData.company}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jurisdiction">Jurisdiction</Label>
                  {isEditing ? (
                    <Input
                      id="jurisdiction"
                      value={editData.jurisdiction || ""}
                      onChange={(e) => setEditData((prev) => ({ ...prev, jurisdiction: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{profileData.jurisdiction}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            {isEditing ? (
              <Input
                id="address"
                value={editData.address}
                onChange={(e) => setEditData((prev) => ({ ...prev, address: e.target.value }))}
              />
            ) : (
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{profileData.address}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            {isEditing ? (
              <Textarea
                id="bio"
                value={editData.bio}
                onChange={(e) => setEditData((prev) => ({ ...prev, bio: e.target.value }))}
                rows={3}
              />
            ) : (
              <p className="text-gray-600">{profileData.bio}</p>
            )}
          </div>

          {isEditing && (
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Security Settings
          </CardTitle>
          <CardDescription>Manage your account security and authentication preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
            </div>
            <Button variant="outline" size="sm">
              Enable 2FA
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Change Password</p>
              <p className="text-sm text-gray-500">Update your account password</p>
            </div>
            <Button variant="outline" size="sm">
              Change Password
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">API Keys</p>
              <p className="text-sm text-gray-500">Manage your API access keys</p>
            </div>
            <Button variant="outline" size="sm">
              Manage Keys
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

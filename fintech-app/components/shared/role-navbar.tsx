"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  UserIcon,
  LogOutIcon,
  ShieldIcon,
  UsersIcon,
  FileTextIcon,
  SettingsIcon,
  BarChart3Icon,
  Building2Icon,
  WalletIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NotificationSystem } from "./notifications"
import { getCurrentUser } from "@/lib/auth"
import type { User } from "@/lib/types" // Import User type from the correct location

export function RoleNavbar() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      try {
        const currentUser = getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error("Auth check failed:", error)
        setUser(null)
      }
    }

    checkAuth()
    const timeoutId = setTimeout(checkAuth, 100)

    return () => clearTimeout(timeoutId)
  }, [])

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem("auth_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user_data")
    router.push("/")
  }

  const getNavigationLinks = () => {
    if (!user) return []

    const baseLinks = [{ href: "/home", label: "Home", icon: <Building2Icon className="w-4 h-4" /> }]

    switch (user.role) {
      case "ROLE_TPP":
        return [
          ...baseLinks,
          { href: "/tpp/dashboard", label: "TPP Dashboard", icon: <ShieldIcon className="w-4 h-4" /> },
          { href: "/tpp/documents", label: "Document Vault", icon: <FileTextIcon className="w-4 h-4" /> },
          { href: "/tpp/consents", label: "Consent Management", icon: <UsersIcon className="w-4 h-4" /> },
        ]
      case "ROLE_BANK_ADMIN":
        return [
          ...baseLinks,
          { href: "/admin/dashboard", label: "Admin Dashboard", icon: <BarChart3Icon className="w-4 h-4" /> },
          { href: "/admin/approvals", label: "TPP Approvals", icon: <ShieldIcon className="w-4 h-4" /> },
          { href: "/admin/monitoring", label: "Active Monitor", icon: <UsersIcon className="w-4 h-4" /> },
          { href: "/admin/contracts", label: "Contract Timers", icon: <SettingsIcon className="w-4 h-4" /> },
        ]
      default:
        return [...baseLinks, { href: "/dashboard", label: "Dashboard", icon: <BarChart3Icon className="w-4 h-4" /> }]
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ROLE_TPP":
        return "TPP"
      case "ROLE_BANK_ADMIN":
        return "Admin"
      default:
        return "User"
    }
  }

  if (!user) return null

  const navigationLinks = getNavigationLinks()

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/home" className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">FinTech Pro</h1>
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {getRoleBadge(user.role)}
              </span>
            </Link>

            <nav className="hidden md:flex space-x-6">
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <NotificationSystem />

            {/* MetaMask Status */}
            {(user.role === "ROLE_TPP" || user.role === "ROLE_BANK_ADMIN") && (
              <Button variant="ghost" size="sm" className="text-gray-600">
                <WalletIcon className="h-4 w-4" />
              </Button>
            )}

            {/* Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt={user.name} />
                    <AvatarFallback>
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    <p className="text-xs leading-none text-blue-600">{getRoleBadge(user.role)}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  <span>Account Settings</span>
                </DropdownMenuItem>
                {user.role === "ROLE_TPP" && (
                  <DropdownMenuItem>
                    <FileTextIcon className="mr-2 h-4 w-4" />
                    <span>API Documentation</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}

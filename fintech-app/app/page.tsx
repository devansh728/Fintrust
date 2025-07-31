"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCurrentUser } from "@/lib/auth"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState("")
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    role: "ROLE_USER" as const,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }

    if (!isLogin) {
      if (!formData.username) newErrors.username = "Username is required"
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // // Fix the demo login functionality
  // const handleDemoLogin = async (role: "ROLE_USER" | "ROLE_TPP" | "ROLE_BANK_ADMIN") => {
  //   const demoCredentials = {
  //     ROLE_USER: { email: "user@demo.com", password: "password123" },
  //     ROLE_TPP: { email: "tpp@demo.com", password: "password123" },
  //     ROLE_BANK_ADMIN: { email: "admin@demo.com", password: "password123" },
  //   }

  //   const creds = demoCredentials[role]
  //   setFormData((prev) => ({ ...prev, email: creds.email, password: creds.password }))

  //   setIsLoading(true)
  //   try {
  //     const user = await login(creds.email, creds.password)

  //     // Add a small delay to ensure token is set
  //     await new Promise((resolve) => setTimeout(resolve, 100))

  //     // Navigate based on role
  //     switch (user.role) {
  //       case "ROLE_TPP":
  //         window.location.href = "/tpp/dashboard"
  //         break
  //       case "ROLE_BANK_ADMIN":
  //         window.location.href = "/admin/dashboard"
  //         break
  //       default:
  //         window.location.href = "/home"
  //     }
  //   } catch (error) {
  //     console.error("Demo login error:", error)
  //     setErrors({ general: "Demo login failed. Please try again." })
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  // // Also update the regular form submit
  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault()
  //   if (!validateForm()) return

  //   setIsLoading(true)
  //   try {
  //     const user = await login(formData.email, formData.password)

  //     // Add a small delay to ensure token is set
  //     await new Promise((resolve) => setTimeout(resolve, 100))

  //     // Redirect based on role
  //     switch (user.role) {
  //       case "ROLE_TPP":
  //         window.location.href = "/tpp/dashboard"
  //         break
  //       case "ROLE_BANK_ADMIN":
  //         window.location.href = "/admin/dashboard"
  //         break
  //       default:
  //         window.location.href = "/home"
  //     }
  //   } catch (error) {
  //     console.error("Login error:", error)
  //     setErrors({ general: "Login failed. Please try again." })
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  // Placeholder: Replace with your backend API endpoints
  const LOGIN_API_URL = "http://localhost:8080/api/auth/login"
  const SIGNUP_API_URL = "http://localhost:8080/api/auth/register"

  // Async function to call login API
  const loginUser = async (email: string, password: string) => {
    try {
      setLoading(true)
      setApiError("")
      const res = await fetch(LOGIN_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || "Login failed")
      }
      
      // On success, save tokens with consistent naming
      if (data && data.accessToken && data.refreshToken) {
        localStorage.setItem("auth_token", data.accessToken)
        localStorage.setItem("refresh_token", data.refreshToken)
        
        // Also save user data for immediate access
        const userData = {
          id: data.user.id || "1",
          email: data.user.email,
          name: data.user.name || data.user.username || "User",
          role: data.user.authorities[0].authority,
          avatar: data.user.avatar
        }
        localStorage.setItem("user_data", JSON.stringify(userData))
      }
      
      // Redirect based on role
      const userRole = data.user.authorities[0].authority
      switch (userRole) {
        case "ROLE_TPP":
          window.location.href = "/tpp/dashboard"
          break
        case "ROLE_BANK_ADMIN":
          window.location.href = "/admin/dashboard"
          break
        default:
          window.location.href = "/home"
      }
    } catch (err: any) {
      setApiError(err.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  // Async function to call signup API
  const signupUser = async (payload: typeof formData) => {
    try {
      setLoading(true)
      setApiError("")
      const res = await fetch(SIGNUP_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: payload.email,
          password: payload.password,
          userName: payload.username,
          role: payload.role
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Signup failed")
      }
      // On success, redirect to login page
      setIsLogin(true)
      setApiError("") // Clear any previous errors
    } catch (err: any) {
      setApiError(err.message || "Signup failed")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    if (isLogin) {
      await loginUser(formData.email, formData.password)
    } else {
      await signupUser(formData)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">FinTech Pro</h1>
          <p className="text-gray-600">Secure financial management platform with RBAC</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-center">
              {isLogin ? "Welcome back" : "Create account"}
            </CardTitle>
            <CardDescription className="text-center">
              {isLogin
                ? "Sign in to your account to continue"
                : "Join thousands of users managing their finances securely"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Demo Login Buttons */}
            {/* <div className="space-y-2">
              <p className="text-sm font-medium text-center text-gray-700">Quick Demo Access:</p>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin("ROLE_USER")}
                  disabled={isLoading}
                  className="w-full"
                >
                  Demo as User
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin("ROLE_TPP")}
                  disabled={isLoading}
                  className="w-full"
                >
                  Demo as TPP
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin("ROLE_BANK_ADMIN")}
                  disabled={isLoading}
                  className="w-full"
                >
                  Demo as Bank Admin
                </Button>
              </div>
            </div> */}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
              )}

              {!isLogin && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={formData.username}
                        onChange={(e) => handleInputChange("username", e.target.value)}
                        className={errors.username ? "border-red-500" : ""}
                      />
                      {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Account Type</Label>
                    <Select value={formData.role} onValueChange={(value: any) => handleInputChange("role", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ROLE_USER">Regular User</SelectItem>
                        <SelectItem value="ROLE_TPP">Third-Party Provider</SelectItem>
                        <SelectItem value="ROLE_BANK_ADMIN">Bank Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className={errors.confirmPassword ? "border-red-500" : ""}
                  />
                  {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                </div>
              )}

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </>
                ) : isLogin ? (
                  "Sign in"
                ) : (
                  "Create account"
                )}
              </Button>
            </form>

            {isLogin && (
              <div className="text-center">
                <Link href="#" className="text-sm text-blue-600 hover:underline">
                  Forgot your password?
                </Link>
              </div>
            )}
          </CardContent>

          <CardFooter>
            <div className="text-center w-full">
              <p className="text-sm text-gray-600">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-blue-600 hover:underline font-medium"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center text-xs text-gray-500">
          <p>Protected by industry-standard encryption</p>
          <p className="mt-1">© 2024 FinTech Pro. All rights reserved.</p>
        </div>

        {/* Debug Section - Remove in production */}
        <div className="mt-4 text-center text-xs text-gray-400">
          <p>Debug: Check browser console for auth details</p>
          <button 
            onClick={() => {
              console.log("Auth Token:", localStorage.getItem("auth_token"))
              console.log("User Data:", localStorage.getItem("user_data"))
              console.log("Current User:", getCurrentUser())
            }}
            className="text-blue-500 hover:underline"
          >
            Debug Auth
          </button>
        </div>
      </div>
    </div>
  )
}

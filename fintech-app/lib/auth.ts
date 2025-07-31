export interface User {
  id: string
  email: string
  name: string
  role: "ROLE_USER" | "ROLE_TPP" | "ROLE_BANK_ADMIN"
  avatar?: string
}

export interface JWTPayload {
  sub: string
  email: string
  name: string
  role: string
  iat: number
  exp: number
}

// JWT decode function for real backend tokens
export function decodeJWT(token: string): JWTPayload | null {
  try {
    // In a real app, use a proper JWT library
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload
  } catch {
    return null
  }
}

// Real authentication functions for backend integration
export function getCurrentUser(): User | null {
  // Check if we're on the client side
  if (typeof window === "undefined") return null

  try {
    // First try to get user data from localStorage (faster)
    const userData = localStorage.getItem("user_data")
    if (userData) {
      const user = JSON.parse(userData)
      return user
    }

    // Fallback to JWT token parsing
    const token = localStorage.getItem("auth_token")
    if (!token) return null

    const payload = decodeJWT(token)
    if (!payload) return null

    // Check if token is expired
    if (payload.exp < Date.now() / 1000) {
      clearAuthToken()
      return null
    }

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role as User["role"],
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    clearAuthToken()
    return null
  }
}

export function setAuthToken(token: string) {
  localStorage.setItem("auth_token", token)
}

export function clearAuthToken() {
  localStorage.removeItem("auth_token")
  localStorage.removeItem("refresh_token")
  localStorage.removeItem("user_data")
}

// Real login function for backend integration
export async function login(email: string, password: string): Promise<User> {
  const LOGIN_API_URL = "http://localhost:8080/api/auth/login"
  
  const response = await fetch(LOGIN_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Login failed")
  }

  const data = await response.json()
  
  // Save tokens
  if (data.accessToken && data.refreshToken) {
    localStorage.setItem("auth_token", data.accessToken)
    localStorage.setItem("refresh_token", data.refreshToken)
  }

  // Create user object
  const user: User = {
    id: data.user.id || "1",
    email: data.user.email,
    name: data.user.name || data.user.username || "User",
    role: data.user.authorities[0].authority as User["role"],
    avatar: data.user.avatar
  }

  // Save user data for immediate access
  localStorage.setItem("user_data", JSON.stringify(user))

  return user
}

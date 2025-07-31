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

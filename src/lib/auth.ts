const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

interface JwtPayload {
  exp?: number
  iat?: number
  sub?: string
  username?: string
}

const decodeBase64Url = (value: string) => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
  return atob(padded)
}

export const parseJwtPayload = (token: string): JwtPayload | null => {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const payload = decodeBase64Url(parts[1])
    return JSON.parse(payload) as JwtPayload
  } catch {
    return null
  }
}

export const isTokenExpired = (token: string): boolean => {
  const payload = parseJwtPayload(token)
  if (!payload?.exp) return true
  const now = Math.floor(Date.now() / 1000)
  return payload.exp <= now
}

export const getAuthToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export const getAuthUser = () => {
  try {
    return localStorage.getItem(USER_KEY)
  } catch {
    return null
  }
}

export const setAuth = (token: string, username: string) => {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, username)
}

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export const isAuthenticated = () => {
  const token = getAuthToken()
  if (!token) return false
  if (isTokenExpired(token)) {
    clearAuth()
    return false
  }
  return true
}

import React, { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material'
import LoginIcon from '@mui/icons-material/Login'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { useLocation, useNavigate } from 'react-router-dom'
import { isAuthenticated, setAuth } from '../lib/auth'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const expectedUsername = import.meta.env.VITE_APP_USERNAME || ''
  const expectedPassword = import.meta.env.VITE_APP_PASSWORD || ''

  const jwtSecret = useMemo(() => __JWT_SECRET__ || '', [])
  const jwtExpiresIn = useMemo(() => __JWT_EXPIRES_IN__ || '1h', [])

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])

  const base64UrlEncode = (value: Uint8Array) => {
    let binary = ''
    value.forEach((byte) => {
      binary += String.fromCharCode(byte)
    })
    const base64 = btoa(binary)
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }

  const base64UrlEncodeString = (value: string) => {
    const bytes = new TextEncoder().encode(value)
    return base64UrlEncode(bytes)
  }

  const parseExpiresIn = (value: string) => {
    const match = /^(\d+)([smhd])$/i.exec(value.trim())
    if (!match) return 60 * 60
    const amount = Number(match[1])
    const unit = match[2].toLowerCase()
    switch (unit) {
      case 's':
        return amount
      case 'm':
        return amount * 60
      case 'h':
        return amount * 60 * 60
      case 'd':
        return amount * 60 * 60 * 24
      default:
        return 60 * 60
    }
  }

  const createJwt = async (payload: Record<string, unknown>) => {
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured.')
    }

    const header = { alg: 'HS256', typ: 'JWT' }
    const encodedHeader = base64UrlEncodeString(JSON.stringify(header))
    const encodedPayload = base64UrlEncodeString(JSON.stringify(payload))
    const data = `${encodedHeader}.${encodedPayload}`

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(jwtSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    )
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(data),
    )
    const encodedSignature = base64UrlEncode(new Uint8Array(signature))
    return `${data}.${encodedSignature}`
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!expectedUsername || !expectedPassword) {
      setError('Missing login credentials in environment variables.')
      return
    }

    if (username !== expectedUsername || password !== expectedPassword) {
      setError('Username or password is incorrect.')
      return
    }

    setIsSubmitting(true)
    try {
      const now = Math.floor(Date.now() / 1000)
      const exp = now + parseExpiresIn(jwtExpiresIn)
      const token = await createJwt({
        sub: username,
        username,
        iat: now,
        exp,
      })
      setAuth(token, username)
      const redirectPath =
        (location.state as { from?: { pathname?: string } })?.from?.pathname ||
        '/dashboard'
      navigate(redirectPath, { replace: true })
    } catch (err) {
      console.error(err)
      setError('Failed to create login token.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 440 }}>
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                mb: 2,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'primary.contrastText',
                bgcolor: 'primary.main',
                fontWeight: 800,
                fontSize: 24,
                boxShadow: (t) => t.customShadows.primary,
              }}
            >
              C
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Sign in to CMS Admin
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Enter your credentials to access the dashboard.
            </Typography>
          </Box>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              id="username"
              name="username"
              label="Username"
              placeholder="your-username"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              fullWidth
            />
            <TextField
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              placeholder="********"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              fullWidth
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            {error && (
              <Alert severity="error" role="alert">
                {error}
              </Alert>
            )}
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={isSubmitting}
              startIcon={
                isSubmitting ? <CircularProgress size={18} color="inherit" /> : <LoginIcon />
              }
              sx={{ mt: 1 }}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default LoginPage

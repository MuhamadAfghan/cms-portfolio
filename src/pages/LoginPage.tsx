import React, { useEffect, useMemo, useState } from 'react'
import { FaSignInAlt } from 'react-icons/fa' // Import an icon from react-icons
import { useLocation, useNavigate } from 'react-router-dom'
import { isAuthenticated, setAuth } from '../lib/auth'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4">
      <div className="card w-full max-w-md bg-base-200 shadow-xl shadow-black/30 border border-base-content/20">
        <div className="card-body">
          <h2 className="card-title text-3xl font-bold text-white mb-6 justify-center">Login</h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="form-control">
              <label htmlFor="username" className="label">
                <span className="label-text text-slate-300">Username</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                className="input input-bordered w-full bg-slate-800 border-slate-700 text-white"
                placeholder="your-username"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />
            </div>
            <div className="form-control">
              <label htmlFor="password" className="label">
                <span className="label-text text-slate-300">Password</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="input input-bordered w-full bg-slate-800 border-slate-700 text-white"
                placeholder="********"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            {error && (
              <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                {error}
              </div>
            )}
            <div className="form-control mt-6">
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isSubmitting}
              >
                <FaSignInAlt className="mr-2" />
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

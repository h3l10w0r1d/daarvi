import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Github, Eye, EyeOff, GalleryVerticalEnd } from 'lucide-react'
import { useApp } from '../context/AppContext'

const G = { fontFamily: 'Geist, sans-serif' }
const BLUE = '#2563eb'
const C_DARK = '#0a0a0a'
const C_MID  = '#737373'

export default function Login() {
  const [mode, setMode]           = useState('login') // 'login' | 'signup'
  const [showPass, setShowPass]   = useState(false)
  const [email, setEmail]         = useState('')
  const [name, setName]           = useState('')
  const [password, setPassword]   = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState(null)
  const navigate = useNavigate()
  const { login, register } = useApp()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (mode === 'signup' && password !== confirmPass) {
      setError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    try {
      if (mode === 'signup') {
        await register(email, name || email.split('@')[0], password)
        navigate('/onboarding')
      } else {
        await login(email, password)
        navigate('/shop')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ ...G, display: 'flex', minHeight: '100vh', background: '#fff' }}>
      {/* ── Left: form panel ── */}
      <div
        className="flex flex-col w-full md:w-1/2"
        style={{ background: '#ffffff', padding: '40px 80px', justifyContent: 'space-between', minHeight: '100vh' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div style={{ width: 24, height: 24, background: C_DARK, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GalleryVerticalEnd size={14} color="#fff" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: C_DARK }}>DAARVI</span>
        </div>

        {/* Form */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 48, paddingBottom: 48 }}>
          <div style={{ width: '100%', maxWidth: 374 }}>
            {/* Heading */}
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 24, fontWeight: mode === 'signup' ? 700 : 600, color: C_DARK, margin: '0 0 8px' }}>
                {mode === 'login' ? 'Login to your account' : 'Create your account'}
              </h1>
              <p style={{ fontSize: 14, fontWeight: 400, color: C_MID, margin: 0 }}>
                {mode === 'login'
                  ? 'Enter your email below to login to your account.'
                  : 'Fill in the form below to create your account'}
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Full name — signup only */}
              {mode === 'signup' && (
                <Field
                  label="Full name"
                  type="text"
                  value={name}
                  onChange={setName}
                  placeholder="John Doe"
                />
              )}

              {/* Email */}
              <Field
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="m@example.com"
                description={mode === 'signup' ? "We'll use this to contact you. We will not share your email with anyone else." : undefined}
                required
              />

              {/* Password */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 14, fontWeight: 500, color: C_DARK }}>Password</label>
                  {mode === 'login' && (
                    <button type="button" style={{ fontSize: 14, fontWeight: 400, color: C_DARK, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      Forgot your password?
                    </button>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    style={{
                      width: '100%', height: 36, padding: '0 36px 0 12px',
                      border: '1px solid #e5e7eb', borderRadius: 6,
                      fontSize: 14, fontWeight: 400, color: C_DARK,
                      background: '#fff', outline: 'none', boxSizing: 'border-box',
                      fontFamily: 'Geist, sans-serif',
                    }}
                    onFocus={e => e.target.style.borderColor = BLUE}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C_MID, display: 'flex', alignItems: 'center' }}
                  >
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {mode === 'signup' && (
                  <p style={{ fontSize: 14, fontWeight: 400, color: C_MID, marginTop: 6, marginBottom: 0 }}>
                    Must be at least 8 characters long.
                  </p>
                )}
              </div>

              {/* Confirm Password — signup only */}
              {mode === 'signup' && (
                <Field
                  label="Confirm Password"
                  type="password"
                  value={confirmPass}
                  onChange={setConfirmPass}
                  placeholder=""
                  description="Please confirm your password."
                  required
                />
              )}

              {error && (
                <p style={{ fontSize: 14, color: '#dc2626', margin: 0 }}>{error}</p>
              )}

              {/* Primary button */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%', height: 36, background: submitting ? '#93c5fd' : BLUE,
                  color: '#fff', border: 'none', borderRadius: 6,
                  fontSize: 14, fontWeight: 500, cursor: submitting ? 'not-allowed' : 'pointer',
                  fontFamily: 'Geist, sans-serif', transition: 'background 0.15s',
                  marginTop: 4,
                }}
                onMouseEnter={e => { if (!submitting) e.target.style.background = '#1d4ed8' }}
                onMouseLeave={e => { if (!submitting) e.target.style.background = BLUE }}
              >
                {submitting ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create Account'}
              </button>

              {/* Separator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
                <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                <span style={{ fontSize: 12, fontWeight: 400, color: C_MID, whiteSpace: 'nowrap' }}>Or continue with</span>
                <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
              </div>

              {/* Secondary button */}
              <button
                type="button"
                style={{
                  width: '100%', height: 36, background: '#fff',
                  color: C_DARK, border: '1px solid #e5e7eb', borderRadius: 6,
                  fontSize: 14, fontWeight: 500, cursor: 'pointer',
                  fontFamily: 'Geist, sans-serif', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'border-color 0.15s, background 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = '#d1d5db' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e5e7eb' }}
              >
                <Github size={16} />
                {mode === 'login' ? 'Login with GitHub' : 'Sign up with GitHub'}
              </button>
            </form>

            {/* Toggle link */}
            <p style={{ fontSize: 14, fontWeight: 400, color: C_MID, marginTop: 24, textAlign: 'center' }}>
              {mode === 'login' ? (
                <>Don't have an account?{' '}
                  <button onClick={() => { setMode('signup'); setError(null) }} style={{ color: BLUE, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, padding: 0, fontFamily: 'Geist, sans-serif' }}>
                    Sign up
                  </button>
                </>
              ) : (
                <>Already have an account?{' '}
                  <button onClick={() => { setMode('login'); setError(null) }} style={{ color: BLUE, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, padding: 0, fontFamily: 'Geist, sans-serif' }}>
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Footer */}
        <p style={{ fontSize: 14, fontWeight: 400, color: C_MID, textAlign: 'center' }}>
          By continuing, you agree to our{' '}
          <Link to="/" style={{ color: C_DARK, textDecoration: 'underline' }}>Terms of Service</Link>
          {' '}and{' '}
          <Link to="/" style={{ color: C_DARK, textDecoration: 'underline' }}>Privacy Policy</Link>.
        </p>
      </div>

      {/* ── Right: decorative panel ── */}
      <div
        className="hidden md:block w-1/2"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Pattern overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.08) 0%, transparent 50%),
                            radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%)`,
        }} />
        {/* Grid decoration */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }} />
        {/* Center content */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
          <div style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.15)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, backdropFilter: 'blur(8px)' }}>
            <GalleryVerticalEnd size={28} color="#fff" />
          </div>
          <h2 style={{ ...G, fontSize: 28, fontWeight: 700, color: '#fff', textAlign: 'center', margin: '0 0 12px', letterSpacing: '-0.5px' }}>
            Your style,<br />curated for you.
          </h2>
          <p style={{ ...G, fontSize: 15, fontWeight: 400, color: 'rgba(255,255,255,0.7)', textAlign: 'center', maxWidth: 280, lineHeight: 1.6, margin: 0 }}>
            AI-powered outfit recommendations tailored to your personal taste.
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Reusable field ──────────────────────────────────────────────────
function Field({ label, type, value, onChange, placeholder, description, required }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: C_DARK, marginBottom: 6 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        style={{
          width: '100%', height: 36, padding: '0 12px',
          border: '1px solid #e5e7eb', borderRadius: 6,
          fontSize: 14, fontWeight: 400, color: C_DARK,
          background: '#fff', outline: 'none', boxSizing: 'border-box',
          fontFamily: 'Geist, sans-serif',
        }}
        onFocus={e => e.target.style.borderColor = BLUE}
        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
      />
      {description && (
        <p style={{ fontSize: 14, fontWeight: 400, color: C_MID, marginTop: 6, marginBottom: 0 }}>
          {description}
        </p>
      )}
    </div>
  )
}

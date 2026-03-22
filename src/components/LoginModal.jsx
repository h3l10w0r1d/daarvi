import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Eye, EyeOff, X, Check } from 'lucide-react'
import { useApp } from '../context/AppContext'

const EASE = [0.76, 0, 0.24, 1]

// Password rules checked in real time
const PW_RULES = [
  { id: 'len',    label: 'At least 8 characters',         test: (v) => v.length >= 8 },
  { id: 'letter', label: 'At least one letter',            test: (v) => /[a-zA-Z]/.test(v) },
  { id: 'digit',  label: 'At least one number',            test: (v) => /\d/.test(v) },
]

export default function LoginModal({ isOpen, onClose, defaultMode = 'login' }) {
  const [mode, setMode]         = useState(defaultMode)
  const [showPass, setShowPass] = useState(false)
  const [email, setEmail]       = useState('')
  const [name, setName]         = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]       = useState(null)
  const [pwFocused, setPwFocused] = useState(false)
  const navigate = useNavigate()
  const { login, register } = useApp()

  // Sync mode when defaultMode changes (e.g. JOIN NOW vs SIGN IN)
  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode)
      setError(null)
      setEmail('')
      setName('')
      setPassword('')
      setShowPass(false)
      setPwFocused(false)
    }
  }, [isOpen, defaultMode])

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    if (isOpen) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  const pwValid = mode === 'signup' ? PW_RULES.every(r => r.test(password)) : true

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (mode === 'signup' && !pwValid) {
      setError('Please meet all password requirements')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      if (mode === 'signup') {
        await register(email, name || email.split('@')[0], password)
        onClose()
        navigate('/onboarding')
      } else {
        await login(email, password)
        onClose()
        navigate('/home')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[90] bg-black/75 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          {/* Modal panel */}
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="relative w-full max-w-md bg-black border border-white/10 overflow-hidden"
              initial={{ clipPath: 'inset(0 0 100% 0)', y: -20 }}
              animate={{ clipPath: 'inset(0 0 0% 0)', y: 0 }}
              exit={{ clipPath: 'inset(100% 0 0 0)', y: 20 }}
              transition={{ duration: 0.5, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top bar */}
              <div className="flex items-center justify-between px-8 pt-8 pb-0">
                <span className="font-serif text-lg tracking-widest text-cream">DAARVI</span>
                <button
                  onClick={onClose}
                  className="text-gray hover:text-cream transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Decorative line */}
              <motion.div
                className="absolute top-0 left-0 w-full h-px bg-gold"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
                style={{ transformOrigin: 'left' }}
              />

              <div className="px-8 pb-10 pt-8">
                {/* Mode toggle */}
                <div className="flex gap-0 mb-8 border border-white/10">
                  {['login', 'signup'].map((m) => (
                    <button
                      key={m}
                      onClick={() => { setMode(m); setError(null) }}
                      className={`flex-1 py-2.5 text-[10px] tracking-widest font-sans transition-all duration-300 ${
                        mode === m ? 'bg-gold text-black' : 'text-gray hover:text-cream'
                      }`}
                    >
                      {m === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={mode}
                    initial={{ clipPath: 'inset(0 100% 0 0)', opacity: 0 }}
                    animate={{ clipPath: 'inset(0 0% 0 0)', opacity: 1 }}
                    exit={{ clipPath: 'inset(0 0 0 100%)', opacity: 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                  >
                    <h2 className="font-serif text-2xl text-cream mb-1">
                      {mode === 'login' ? 'Welcome back' : 'Join Daarvi'}
                    </h2>
                    <p className="text-xs text-gray font-body mb-7 leading-relaxed">
                      {mode === 'login'
                        ? 'Sign in to your curated wardrobe'
                        : 'Create your account and take the DNA test'}
                    </p>
                  </motion.div>
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <ModalField label="EMAIL" type="email" value={email} onChange={setEmail} required />

                  {mode === 'signup' && (
                    <ModalField label="NAME (optional)" type="text" value={name} onChange={setName} />
                  )}

                  <div className="relative">
                    <ModalField
                      label="PASSWORD"
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={setPassword}
                      required
                      onFocus={() => setPwFocused(true)}
                      onBlur={() => setPwFocused(false)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 mt-2.5 text-gray hover:text-cream transition-colors"
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  {/* Password strength checklist — signup only */}
                  <AnimatePresence>
                    {mode === 'signup' && (pwFocused || password.length > 0) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-col gap-1.5 pt-1 pb-0.5">
                          {PW_RULES.map(rule => {
                            const ok = rule.test(password)
                            return (
                              <div key={rule.id} className="flex items-center gap-2">
                                <div className={`w-3.5 h-3.5 flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                                  ok ? 'text-gold' : 'text-gray/30'
                                }`}>
                                  {ok
                                    ? <Check size={11} strokeWidth={3} />
                                    : <span className="w-1 h-1 rounded-full bg-current block" />
                                  }
                                </div>
                                <span className={`text-[10px] font-sans transition-colors duration-300 ${
                                  ok ? 'text-gold/80' : 'text-gray/40'
                                }`}>
                                  {rule.label}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {mode === 'login' && (
                    <div className="text-right">
                      <button type="button" className="text-[10px] tracking-widest text-gray hover:text-gold transition-colors font-sans">
                        FORGOT PASSWORD?
                      </button>
                    </div>
                  )}

                  {error && (
                    <p className="text-[10px] tracking-widest font-sans py-1" style={{ color: '#af0000' }}>
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || (mode === 'signup' && !pwValid)}
                    className="w-full mt-2 flex items-center justify-center gap-3 bg-cream text-black py-4 text-xs tracking-widest font-sans hover:bg-gold transition-colors duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting
                      ? 'PLEASE WAIT...'
                      : mode === 'login'
                        ? 'SIGN IN'
                        : 'CREATE ACCOUNT'}
                    {!submitting && <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform duration-300" />}
                  </button>
                </form>

                <div className="mt-5 flex items-center gap-4">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-[10px] text-gray font-sans">OR</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <button className="w-full mt-4 flex items-center justify-center gap-3 border border-white/10 py-3.5 text-[10px] tracking-widest text-gray font-sans hover:text-cream hover:border-white/30 transition-all duration-300">
                  CONTINUE WITH GOOGLE
                </button>

                <p className="mt-6 text-[10px] text-gray font-sans text-center">
                  {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null) }}
                    className="text-gold hover:text-cream transition-colors"
                  >
                    {mode === 'login' ? 'Create one' : 'Sign in'}
                  </button>
                </p>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function ModalField({ label, type, value, onChange, required, onFocus, onBlur }) {
  return (
    <div className="group">
      <label className="block text-[10px] tracking-widest text-gray font-sans mb-2 group-focus-within:text-gold transition-colors">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        required={required}
        className="w-full bg-transparent border border-white/10 px-4 py-3 text-sm text-cream font-body focus:outline-none focus:border-gold transition-colors placeholder-white/20"
        placeholder={`Enter your ${label.toLowerCase().replace(' (optional)', '')}`}
      />
    </div>
  )
}

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useApp } from '../context/AppContext'

const EASE = [0.76, 0, 0.24, 1]

export default function Login() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [showPass, setShowPass] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { login, register } = useApp()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (mode === 'signup') {
        await register(email, name || email.split('@')[0], password)
        navigate('/onboarding')
      } else {
        await login(email, password)
        navigate('/home')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left panel */}
      <motion.div
        className="hidden md:flex flex-col justify-between w-1/2 bg-black p-16 relative overflow-hidden border-r border-white/10"
        initial={{ clipPath: 'inset(0 0 100% 0)' }}
        animate={{ clipPath: 'inset(0 0 0% 0)' }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        {/* Animated geometric background */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <div
            className="absolute top-0 right-0 w-64 h-64 border border-gold/20"
            style={{ transform: 'translate(30%, -30%) rotate(45deg)' }}
          />
          <div
            className="absolute bottom-0 left-0 w-96 h-96 border border-gold/10"
            style={{ transform: 'translate(-30%, 30%) rotate(45deg)' }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-px h-40 bg-gold/30"
            style={{ transform: 'translate(-50%, -50%)' }}
            animate={{ scaleY: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        {/* Brand */}
        <div className="relative z-10">
          <Link to="/" className="font-serif text-2xl tracking-widest text-cream">
            DAARVI
          </Link>
        </div>

        {/* Featured image */}
        <motion.div
          className="relative z-10 aspect-[3/4] w-48 mx-auto overflow-hidden"
          initial={{ clipPath: 'inset(100% 0 0 0)' }}
          animate={{ clipPath: 'inset(0% 0 0 0)' }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.4 }}
        >
          <img
            src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80"
            alt="Fashion"
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Quote */}
        <div className="relative z-10">
          <p className="font-serif text-lg text-cream/80 italic leading-relaxed">
            "Style is a way to say who you are without having to speak."
          </p>
          <p className="mt-2 text-[10px] tracking-widest text-gold font-sans">— RACHEL ZOE</p>
        </div>
      </motion.div>

      {/* Right panel — form */}
      <motion.div
        className="flex-1 flex flex-col justify-center px-8 md:px-16 py-12"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.3 }}
      >
        <div className="max-w-sm w-full mx-auto">
          {/* Mobile logo */}
          <Link to="/" className="md:hidden font-serif text-xl tracking-widest text-cream block mb-12">
            DAARVI
          </Link>

          {/* Mode toggle */}
          <div className="flex gap-0 mb-10 border border-white/10">
            {['login', 'signup'].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
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
              transition={{ duration: 0.4, ease: EASE }}
            >
              <h1 className="font-serif text-3xl text-cream mb-2">
                {mode === 'login' ? 'Welcome back' : 'Join Daarvi'}
              </h1>
              <p className="text-sm text-gray font-body mb-10">
                {mode === 'login'
                  ? 'Sign in to your curated wardrobe'
                  : 'Create your account and take the DNA test'}
              </p>
            </motion.div>
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="EMAIL" type="email" value={email} onChange={setEmail} required />
            {mode === 'signup' && (
              <FormField label="NAME" type="text" value={name} onChange={setName} />
            )}
            <div className="relative">
              <FormField
                label="PASSWORD"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={setPassword}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 mt-2.5 text-gray hover:text-cream transition-colors"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {mode === 'login' && (
              <div className="text-right">
                <button type="button" className="text-[10px] tracking-widest text-gray hover:text-gold transition-colors font-sans">
                  FORGOT PASSWORD?
                </button>
              </div>
            )}

            {error && (
              <p className="text-[10px] tracking-widest text-red font-sans py-1">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-6 flex items-center justify-center gap-3 bg-cream text-black py-4 text-xs tracking-widest font-sans hover:bg-gold transition-colors duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'PLEASE WAIT...' : mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT & CONTINUE'}
              {!submitting && <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[10px] text-gray font-sans">OR</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button className="w-full mt-6 flex items-center justify-center gap-3 border border-white/10 py-4 text-xs tracking-widest text-gray font-sans hover:text-cream hover:border-white/30 transition-all duration-300">
            CONTINUE WITH GOOGLE
          </button>

          <p className="mt-10 text-[10px] text-gray font-sans text-center">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-gold hover:text-cream transition-colors"
            >
              {mode === 'login' ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

function FormField({ label, type, value, onChange, required }) {
  return (
    <div className="group">
      <label className="block text-[10px] tracking-widest text-gray font-sans mb-2 group-focus-within:text-gold transition-colors">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full bg-transparent border border-white/10 px-4 py-3 text-sm text-cream font-body focus:outline-none focus:border-gold transition-colors placeholder-white/20"
        placeholder={`Enter your ${label.toLowerCase()}`}
      />
    </div>
  )
}

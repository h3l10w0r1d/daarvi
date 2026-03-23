import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Map, Sparkles, Dna, Store, Globe2, Navigation, ShoppingBag, Settings, X } from 'lucide-react'
import { useApp } from '../context/AppContext'

const EASE = [0.76, 0, 0.24, 1]

const globalNav = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/home?cat=all', icon: Globe2, label: 'Collections' },
  { to: '/try-on', icon: Sparkles, label: 'Try On' },
]

const localNav = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/home?cat=all', icon: Store, label: 'Nearby Stores' },
  { to: '/map', icon: Navigation, label: 'City Map' },
  { to: '/try-on', icon: Sparkles, label: 'Try On' },
]

export default function Sidebar() {
  const location = useLocation()
  const { mode, setMode, user, cartCount, mobileSidebarOpen, setMobileSidebarOpen } = useApp()
  const hide = ['/', '/login', '/onboarding'].includes(location.pathname)

  // Track if mobile
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  )
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [])

  // Close drawer on navigation
  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [location.pathname, setMobileSidebarOpen])

  if (hide) return null

  const nav = mode === 'global' ? globalNav : localNav

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-7 pt-8 pb-6 flex items-center justify-between">
        <Link
          to="/home"
          className="font-serif text-lg tracking-[0.3em] text-cream hover:text-gold transition-colors duration-300"
        >
          DAARVI
        </Link>
        {/* Close button — mobile only */}
        {isMobile && (
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="text-gray/60 hover:text-cream transition-colors duration-200"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Gold hairline */}
      <div className="mx-7 h-px bg-gold/20" />

      {/* Mode toggle */}
      <div className="px-7 py-5">
        <p className="text-[9px] tracking-[0.3em] text-gray/60 font-sans mb-3">MODE</p>
        <div className="flex border border-white/10 overflow-hidden">
          <ModeBtn label="GLOBAL" active={mode === 'global'} color="gold" onClick={() => setMode('global')} />
          <ModeBtn label="LOCAL" active={mode === 'local'} color="red" onClick={() => setMode('local')} />
        </div>
      </div>

      {/* Gold hairline */}
      <div className="mx-7 h-px bg-gold/20" />

      {/* Nav section label */}
      <div className="px-7 pt-6 pb-2">
        <AnimatePresence mode="wait">
          <motion.p
            key={mode}
            initial={{ clipPath: 'inset(0 0 100% 0)', opacity: 0 }}
            animate={{ clipPath: 'inset(0 0 0% 0)', opacity: 1 }}
            exit={{ clipPath: 'inset(0 0 100% 0)', opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="text-[9px] tracking-[0.3em] font-sans"
            style={{ color: mode === 'global' ? '#cca350' : '#af0000' }}
          >
            {mode === 'global' ? 'GLOBAL EDIT' : 'LOCAL EDIT'}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          >
            {nav.map((item) => (
              <NavItem key={item.to + item.label} item={item} location={location} />
            ))}
          </motion.div>
        </AnimatePresence>
      </nav>

      {/* Gold hairline */}
      <div className="mx-7 h-px bg-gold/20" />

      {/* Bottom: cart + DNA + user */}
      <div className="px-4 py-5 flex flex-col gap-1">
        {/* Cart / Checkout link */}
        <Link
          to="/checkout"
          className="group flex items-center justify-between px-3 py-2.5 relative transition-colors duration-200"
        >
          <div className="flex items-center gap-3">
            <ShoppingBag size={13} className="text-gray/60 group-hover:text-gold transition-colors" />
            <span className="text-[11px] tracking-[0.18em] font-sans text-gray/70 group-hover:text-cream/80 transition-colors">
              BAG
            </span>
          </div>
          {cartCount > 0 && (
            <span className="text-[9px] font-sans bg-gold text-black px-1.5 py-0.5 min-w-[18px] text-center">
              {cartCount}
            </span>
          )}
        </Link>

        <NavItem item={{ to: '/account', icon: Settings, label: 'Account' }} location={location} dim />
        <NavItem
          item={{ to: '/onboarding', icon: Dna, label: 'DNA Profile' }}
          location={location}
          dim
        />
        {user && (
          <div className="px-3 pt-3">
            <p className="text-[9px] tracking-widest text-gray/50 font-sans truncate">
              {user.email}
            </p>
          </div>
        )}
      </div>
    </>
  )

  return (
    <>
      {/* ── Mobile backdrop ── */}
      <AnimatePresence>
        {isMobile && mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/70 z-40"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar panel ── */}
      <motion.aside
        initial={isMobile ? { x: '-100%' } : { clipPath: 'inset(0 100% 0 0)' }}
        animate={
          isMobile
            ? { x: mobileSidebarOpen ? 0 : '-100%' }
            : { clipPath: 'inset(0 0% 0 0)' }
        }
        transition={{ duration: isMobile ? 0.32 : 0.7, ease: EASE }}
        className="fixed top-0 left-0 bottom-0 z-50 flex flex-col"
        style={{
          width: '220px',
          background: 'rgba(4,4,4,0.97)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(204,163,80,0.15)',
        }}
      >
        {sidebarContent}
      </motion.aside>
    </>
  )
}

function ModeBtn({ label, active, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 py-2 text-[9px] tracking-[0.25em] font-sans transition-all duration-400 relative overflow-hidden"
      style={{
        color: active ? (color === 'gold' ? '#000' : '#f4ecdc') : '#868686',
        background: active ? (color === 'gold' ? '#cca350' : '#af0000') : 'transparent',
      }}
    >
      {label}
    </button>
  )
}

function NavItem({ item, location, dim = false }) {
  const Icon = item.icon
  // Build path and query from the item's `to`
  const [toPath, toQuery] = item.to.split('?')
  const isActive = (() => {
    if (location.pathname !== toPath) return false
    // If item has a query string, the current URL must also have that exact query param
    if (toQuery) {
      const sp = new URLSearchParams(location.search)
      const tsp = new URLSearchParams(toQuery)
      for (const [k, v] of tsp) { if (sp.get(k) !== v) return false }
      return true
    }
    // Item with no query → only active when current URL has no significant query params
    return !location.search || location.search === ''
  })()
  const EASE = [0.76, 0, 0.24, 1]

  return (
    <motion.div
      variants={{
        hidden: { clipPath: 'inset(0 0 100% 0)', opacity: 0 },
        visible: { clipPath: 'inset(0 0 0% 0)', opacity: 1, transition: { duration: 0.4, ease: EASE } },
      }}
    >
      <Link
        to={item.to}
        className={`group flex items-center gap-3 px-3 py-2.5 relative transition-colors duration-200 ${
          dim ? 'opacity-60 hover:opacity-100' : ''
        }`}
      >
        {/* Active left bar */}
        <motion.span
          className="absolute left-0 top-1 bottom-1 w-[2px]"
          style={{ background: '#cca350' }}
          initial={{ scaleY: isActive ? 1 : 0 }}
          animate={{ scaleY: isActive ? 1 : 0 }}
          transition={{ duration: 0.3, ease: EASE }}
        />

        <Icon
          size={13}
          className={`flex-shrink-0 transition-colors duration-200 ${
            isActive ? 'text-gold' : 'text-gray/60 group-hover:text-gray'
          }`}
        />

        <span
          className={`text-[11px] tracking-[0.18em] font-sans transition-colors duration-200 ${
            isActive ? 'text-cream' : 'text-gray/70 group-hover:text-cream/80'
          }`}
        >
          {item.label.toUpperCase()}
        </span>

        {/* Hover underline */}
        <motion.span
          className="absolute bottom-1.5 left-10 right-3 h-px bg-gold/30"
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          style={{ transformOrigin: 'left' }}
          transition={{ duration: 0.3, ease: EASE }}
        />
      </Link>
    </motion.div>
  )
}

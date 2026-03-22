import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Map, User, Home, Sparkles, ShoppingBag, Menu, X } from 'lucide-react'
import { useApp } from '../context/AppContext'

const EASE = [0.76, 0, 0.24, 1]

export default function Navbar() {
  const location = useLocation()
  const { mode, toggleMode, cartCount, user, mobileSidebarOpen, setMobileSidebarOpen } = useApp()
  const hide = ['/', '/login', '/onboarding'].includes(location.pathname)

  if (hide) return null

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 py-4 border-b border-white/10"
      style={{ background: 'rgba(0,0,0,0.94)', backdropFilter: 'blur(12px)' }}
    >
      {/* Left: Hamburger (mobile) + Logo */}
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          className="md:hidden text-gray hover:text-cream transition-colors duration-200 p-1"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          aria-label="Toggle menu"
        >
          {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link
          to="/home"
          className="font-serif text-xl tracking-widest text-cream hover:text-gold transition-colors"
        >
          DAARVI
        </Link>
      </div>

      {/* Centre: Page nav — hidden on mobile */}
      <div className="hidden md:flex items-center gap-6">
        <NavLink to="/home"   icon={<Home size={15} />}     label="Home"   active={location.pathname === '/home'} />
        <NavLink to="/map"    icon={<Map size={15} />}      label="Map"    active={location.pathname === '/map'} />
        <NavLink to="/try-on" icon={<Sparkles size={15} />} label="Try On" active={location.pathname === '/try-on'} />
      </div>

      {/* Right: Mode toggle + Account + Bag */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* Global / Local toggle — hidden on mobile */}
        <button
          onClick={toggleMode}
          className="hidden md:flex items-center gap-0 text-xs font-sans tracking-widest border border-white/20 overflow-hidden"
        >
          <span className={`px-3 py-1.5 transition-all duration-300 ${
            mode === 'global' ? 'bg-gold text-black font-medium' : 'text-gray'
          }`}>
            GLOBAL
          </span>
          <span className={`px-3 py-1.5 transition-all duration-300 ${
            mode === 'local' ? 'bg-red text-cream font-medium' : 'text-gray'
          }`}>
            LOCAL
          </span>
        </button>

        {/* Account */}
        <Link to="/account" title={user ? user.name || 'Account' : 'Account'} className="relative group">
          <User size={18} className="text-gray group-hover:text-gold transition-colors duration-300" />
          {user && (
            <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-gold" />
          )}
        </Link>

        {/* Cart / Bag */}
        <Link to="/checkout" title="Bag" className="relative group">
          <ShoppingBag size={18} className="text-gray group-hover:text-gold transition-colors duration-300" />
          {cartCount > 0 && (
            <motion.span
              key={cartCount}
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 min-w-[16px] h-4 bg-gold text-black text-[9px] font-sans font-bold flex items-center justify-center px-0.5 leading-none"
            >
              {cartCount}
            </motion.span>
          )}
        </Link>
      </div>
    </motion.nav>
  )
}

function NavLink({ to, icon, label, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-1.5 text-xs tracking-widest font-sans relative group transition-colors ${
        active ? 'text-gold' : 'text-gray hover:text-cream'
      }`}
    >
      {icon}
      <span>{label.toUpperCase()}</span>
      <motion.span
        className="absolute -bottom-0.5 left-0 h-px bg-gold"
        initial={{ scaleX: active ? 1 : 0 }}
        animate={{ scaleX: active ? 1 : 0 }}
        whileHover={{ scaleX: 1 }}
        style={{ width: '100%', transformOrigin: 'left' }}
        transition={{ duration: 0.3, ease: EASE }}
      />
    </Link>
  )
}

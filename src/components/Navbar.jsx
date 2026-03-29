import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, ShoppingBag, Menu, X } from 'lucide-react'
import { useApp } from '../context/AppContext'

const EASE = [0.76, 0, 0.24, 1]

export default function Navbar() {
  const location = useLocation()
  const { cartCount, user, mobileSidebarOpen, setMobileSidebarOpen } = useApp()
  const hide = ['/', '/login', '/onboarding'].includes(location.pathname) || location.pathname.startsWith('/shop')

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

      {/* Right: Account + Bag */}
      <div className="flex items-center gap-3 md:gap-5">
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

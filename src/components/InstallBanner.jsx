import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Share } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const EASE = [0.76, 0, 0.24, 1]
const DISMISSED_KEY = 'daarvi_install_dismissed'

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}
function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    !!window.navigator.standalone
}

export default function InstallBanner() {
  const [show, setShow] = useState(false)
  const { pathname } = useLocation()

  // Only show on the landing page
  useEffect(() => {
    if (pathname !== '/') { setShow(false); return }
    if (!isIOS() || isStandalone()) return
    if (localStorage.getItem(DISMISSED_KEY)) return

    const timer = setTimeout(() => setShow(true), 30_000)
    return () => clearTimeout(timer)
  }, [pathname])

  const dismiss = () => {
    setShow(false)
    localStorage.setItem(DISMISSED_KEY, '1')
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="fixed bottom-4 left-4 right-4 z-[200] bg-black border border-white/10 px-5 py-4 flex items-start gap-4"
        >
          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 bg-gold flex items-center justify-center">
            <span className="font-serif text-black text-lg font-bold leading-none">D</span>
          </div>

          {/* Copy */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] tracking-widest text-gold font-sans">ADD TO HOME SCREEN</p>
            <p className="text-[11px] text-gray/70 font-body mt-0.5 leading-relaxed">
              Tap the{' '}
              <Share size={11} className="inline -mt-0.5 mx-0.5" />
              {' '}share icon, then &ldquo;Add to Home Screen&rdquo; for the full experience.
            </p>
          </div>

          {/* Dismiss */}
          <button
            onClick={dismiss}
            className="flex-shrink-0 mt-0.5 text-gray/40 hover:text-cream transition-colors"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

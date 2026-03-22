import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Wifi, WifiOff } from 'lucide-react'

const EASE = [0.76, 0, 0.24, 1]

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showBackOnline, setShowBackOnline] = useState(false)

  useEffect(() => {
    const handleOffline = () => setIsOnline(false)
    const handleOnline  = () => {
      setIsOnline(true)
      setShowBackOnline(true)
      setTimeout(() => setShowBackOnline(false), 3000)
    }
    window.addEventListener('offline', handleOffline)
    window.addEventListener('online',  handleOnline)
    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online',  handleOnline)
    }
  }, [])

  const visible = !isOnline || showBackOnline

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.35, ease: EASE }}
          className={`fixed top-0 left-0 right-0 z-[500] py-2 px-6 flex items-center justify-center gap-2 text-[10px] tracking-widest font-sans ${
            isOnline
              ? 'bg-gold text-black'
              : 'bg-black border-b border-white/10 text-gray/70'
          }`}
        >
          {isOnline
            ? <><Wifi size={11} /> BACK ONLINE</>
            : <><WifiOff size={11} /> YOU'RE OFFLINE — SOME FEATURES MAY BE LIMITED</>
          }
        </motion.div>
      )}
    </AnimatePresence>
  )
}

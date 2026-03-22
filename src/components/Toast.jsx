import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'

const EASE = [0.76, 0, 0.24, 1]

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type }].slice(-3)) // max 3
  }, [])

  // Listen for DOM-dispatched toasts (e.g. from AppContext wishlist)
  useEffect(() => {
    const handler = (e) => toast(e.detail.message, e.detail.type ?? 'success')
    window.addEventListener('daarvi:toast', handler)
    return () => window.removeEventListener('daarvi:toast', handler)
  }, [toast])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

function ToastItem({ toast, onDismiss }) {
  const timerRef = useRef(null)
  const isSuccess = toast.type === 'success'

  const startTimer = useCallback(() => {
    timerRef.current = setTimeout(() => onDismiss(toast.id), 4000)
  }, [toast.id, onDismiss])

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  useEffect(() => {
    startTimer()
    return clearTimer
  }, [startTimer, clearTimer])

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.35, ease: EASE }}
      onMouseEnter={clearTimer}
      onMouseLeave={startTimer}
      className={`pointer-events-auto flex items-center gap-3 pl-4 pr-3 py-3 border text-[10px] tracking-widest font-sans min-w-[260px] max-w-[340px] bg-black ${
        isSuccess ? 'border-gold/30' : 'border-red/30'
      }`}
      style={{ borderLeftWidth: '2px', borderLeftColor: isSuccess ? '#cca350' : '#af0000' }}
    >
      {isSuccess
        ? <CheckCircle2 size={14} className="flex-shrink-0 text-gold" />
        : <AlertCircle size={14} className="flex-shrink-0 text-red" />
      }
      <span className={`flex-1 ${isSuccess ? 'text-gold/90' : 'text-red/90'}`}>
        {toast.message}
      </span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="opacity-30 hover:opacity-80 transition-opacity ml-1 text-gray flex-shrink-0"
      >
        <X size={11} />
      </button>
    </motion.div>
  )
}

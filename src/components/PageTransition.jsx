import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'

const EASE = [0.76, 0, 0.24, 1]

const pageVariants = {
  initial: {
    clipPath: 'inset(0 0 0 100%)',
    opacity: 1,
  },
  animate: {
    clipPath: 'inset(0 0 0 0%)',
    opacity: 1,
    transition: { duration: 0.7, ease: EASE },
  },
  exit: {
    clipPath: 'inset(0 100% 0 0)',
    opacity: 1,
    transition: { duration: 0.5, ease: EASE },
  },
}

export default function PageTransition({ children }) {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ position: 'relative', minHeight: '100vh' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

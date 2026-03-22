import { motion } from 'framer-motion'

const EASE = [0.76, 0, 0.24, 1]

export default function TextReveal({ children, delay = 0, className = '' }) {
  return (
    <div style={{ overflow: 'hidden' }} className={className}>
      <motion.div
        initial={{ clipPath: 'inset(0 0 100% 0)', y: 20 }}
        animate={{ clipPath: 'inset(0 0 0% 0)', y: 0 }}
        transition={{ duration: 0.7, ease: EASE, delay }}
      >
        {children}
      </motion.div>
    </div>
  )
}

export function TextRevealGroup({ lines = [], baseDelay = 0, className = '', lineClassName = '' }) {
  return (
    <div className={className}>
      {lines.map((line, i) => (
        <div key={i} style={{ overflow: 'hidden' }}>
          <motion.div
            initial={{ clipPath: 'inset(0 0 100% 0)', y: 24 }}
            animate={{ clipPath: 'inset(0 0 0% 0)', y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: baseDelay + i * 0.12 }}
            className={lineClassName}
          >
            {line}
          </motion.div>
        </div>
      ))}
    </div>
  )
}

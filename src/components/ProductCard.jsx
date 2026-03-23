import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const EASE = [0.76, 0, 0.24, 1]

export default function ProductCard({ product, index = 0 }) {
  const { mode } = useApp()
  const price    = mode === 'local' ? product.price_local  : product.price_global
  const delivery = mode === 'local' ? product.delivery_local : product.delivery_global

  // Primary = images[0] or legacy field; Secondary = image_hover or images[1]
  const primaryImage   = product.images?.[0]?.url ?? product.image ?? ''
  const secondaryImage = product.image_hover ?? product.images?.[1]?.url ?? null
  const brandName      = product.brand?.name ?? product.brand ?? ''

  // Hover (desktop) + swipe (mobile) state
  const [showSecondary, setShowSecondary] = useState(false)
  const touchStart  = useRef({ x: 0, y: 0 })
  const didSwipe    = useRef(false)

  const handleTouchStart = (e) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    didSwipe.current = false
  }
  const handleTouchEnd = (e) => {
    if (!secondaryImage) return
    const dx = touchStart.current.x - e.changedTouches[0].clientX
    const dy = touchStart.current.y - e.changedTouches[0].clientY
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      setShowSecondary(v => !v)
      didSwipe.current = true
    }
  }
  // Prevent navigation when the gesture was a swipe
  const handleClick = (e) => {
    if (didSwipe.current) { e.preventDefault(); e.stopPropagation() }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EASE, delay: index * 0.07 }}
    >
      <Link to={`/product/${product.id}`} className="group block" onClick={handleClick}>

        {/* ── Image container ───────────────────────────── */}
        <div
          className="relative overflow-hidden aspect-[2/3] bg-neutral-950"
          onMouseEnter={() => secondaryImage && setShowSecondary(true)}
          onMouseLeave={() => setShowSecondary(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Primary image */}
          <img
            src={primaryImage}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
            style={{ opacity: showSecondary ? 0 : 1 }}
          />

          {/* Secondary / hover image — only rendered when available */}
          {secondaryImage && (
            <img
              src={secondaryImage}
              alt={`${product.name} — alternate view`}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
              style={{ opacity: showSecondary ? 1 : 0 }}
            />
          )}

          {/* Swipe hint dot indicator — mobile only */}
          {secondaryImage && (
            <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-1.5 md:hidden pointer-events-none">
              <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${!showSecondary ? 'bg-cream' : 'bg-cream/30'}`} />
              <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${showSecondary  ? 'bg-cream' : 'bg-cream/30'}`} />
            </div>
          )}

          {/* Hover price strip — slides up */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 px-4 py-3 flex items-center justify-between"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 100%)',
              clipPath: 'inset(100% 0 0 0)',
            }}
            whileHover={{ clipPath: 'inset(0% 0 0 0)' }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <span className="text-[10px] tracking-[0.25em] text-gold font-sans">VIEW</span>
            <span className="text-sm text-cream font-sans">${price}</span>
          </motion.div>

          {/* Gold bottom border on hover */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold origin-left"
            initial={{ scaleX: 0 }}
            whileHover={{ scaleX: 1 }}
            transition={{ duration: 0.4, ease: EASE }}
          />

          {/* Mode-only badge */}
          {product.available?.length === 1 && (
            <div className="absolute top-3 left-3">
              <span
                className="text-[9px] tracking-[0.2em] px-2 py-0.5 font-sans"
                style={{
                  background: product.available[0] === 'local' ? '#af0000' : '#cca350',
                  color:      product.available[0] === 'local' ? '#f4ecdc' : '#000',
                }}
              >
                {product.available[0].toUpperCase()} ONLY
              </span>
            </div>
          )}
        </div>

        {/* ── Footer ───────────────────────────────────── */}
        <div className="pt-4 pb-1">
          <p className="text-[10px] tracking-[0.35em] text-gray/70 font-sans mb-1.5">
            {brandName.toUpperCase()}
          </p>
          <div className="flex items-baseline justify-between">
            <p className="text-[14px] text-cream/90 font-sans leading-snug pr-2">
              {product.name}
            </p>
            <div className="text-right flex-shrink-0">
              <p className="text-[14px] text-cream font-sans">${price}</p>
              <p className="text-[10px] text-gray/50 font-sans">{delivery}</p>
            </div>
          </div>
        </div>

      </Link>
    </motion.div>
  )
}

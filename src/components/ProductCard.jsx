import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import LazyImage from './LazyImage'

const EASE = [0.76, 0, 0.24, 1]

export default function ProductCard({ product, index = 0 }) {
  const { mode } = useApp()
  const price = mode === 'local' ? product.price_local : product.price_global
  const delivery = mode === 'local' ? product.delivery_local : product.delivery_global
  // API returns images as [{url, position}], mock data as string. Handle both.
  const primaryImage = product.images?.[0]?.url || product.images?.[0] || product.image
  const brandName = product.brand?.name || product.brand || ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EASE, delay: index * 0.07 }}
    >
      <Link to={`/product/${product.id}`} className="group block">
        {/* Image container */}
        <div className="relative overflow-hidden aspect-[2/3] bg-neutral-950">
          <motion.div
            className="w-full h-full"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <LazyImage
              src={primaryImage}
              alt={product.name}
              className="w-full h-full"
              fallbackLetter={brandName[0] || '?'}
            />
          </motion.div>

          {/* Hover price strip — slides up from bottom */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 px-4 py-3 flex items-center justify-between"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
              clipPath: 'inset(100% 0 0 0)',
            }}
            whileHover={{ clipPath: 'inset(0% 0 0 0)' }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <span className="text-[10px] tracking-[0.25em] text-gold font-sans">VIEW</span>
            <span className="text-sm text-cream font-sans">${price}</span>
          </motion.div>

          {/* Gold bottom border — draws in on hover */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold origin-left"
            initial={{ scaleX: 0 }}
            whileHover={{ scaleX: 1 }}
            transition={{ duration: 0.4, ease: EASE }}
          />

          {/* Mode badge */}
          {product.available.length === 1 && (
            <div className="absolute top-3 left-3">
              <span
                className="text-[9px] tracking-[0.2em] px-2 py-0.5 font-sans"
                style={{
                  background: product.available[0] === 'local' ? '#af0000' : '#cca350',
                  color: product.available[0] === 'local' ? '#f4ecdc' : '#000',
                }}
              >
                {product.available[0].toUpperCase()} ONLY
              </span>
            </div>
          )}
        </div>

        {/* Card footer */}
        <div className="pt-4 pb-1">
          <p className="text-[9px] tracking-[0.35em] text-gray/70 font-sans mb-1.5">
            {brandName}
          </p>
          <div className="flex items-baseline justify-between">
            <p className="text-[13px] text-cream/90 font-sans leading-snug pr-2">
              {product.name}
            </p>
            <div className="text-right flex-shrink-0">
              <p className="text-[13px] text-cream font-sans">${price}</p>
              <p className="text-[9px] text-gray/50 font-sans">{delivery}</p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

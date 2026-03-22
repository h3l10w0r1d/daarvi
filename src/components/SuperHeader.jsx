import { useState, useRef, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { brands } from '../data/mockData'

const EASE = [0.76, 0, 0.24, 1]

const CATEGORIES = [
  {
    id: 'new',
    label: 'NEW IN',
    highlight: 'gold',
    sections: null,
  },
  {
    id: 'women',
    label: 'WOMEN',
    sections: {
      CLOTHING: ['Dresses', 'Tops & T-Shirts', 'Shirts & Blouses', 'Knitwear', 'Coats & Jackets', 'Trousers', 'Skirts', 'Jeans', 'Lingerie'],
      SHOES: ['Sandals', 'Heels & Pumps', 'Flats', 'Sneakers', 'Boots', 'Mules'],
      BAGS: ['Shoulder Bags', 'Tote Bags', 'Clutches', 'Backpacks', 'Mini Bags'],
      ACCESSORIES: ['Jewellery', 'Sunglasses', 'Scarves & Wraps', 'Belts', 'Hats'],
    },
  },
  {
    id: 'men',
    label: 'MEN',
    sections: {
      CLOTHING: ['T-Shirts & Vests', 'Shirts', 'Knitwear', 'Coats & Jackets', 'Trousers', 'Jeans', 'Shorts', 'Suits'],
      SHOES: ['Sneakers', 'Boots', 'Loafers', 'Sandals', 'Derby & Formal'],
      BAGS: ['Backpacks', 'Messenger Bags', 'Tote Bags', 'Belt Bags'],
      ACCESSORIES: ['Watches', 'Sunglasses', 'Scarves', 'Belts', 'Hats & Caps'],
    },
  },
  {
    id: 'kids',
    label: 'KIDS',
    sections: {
      GIRLS: ['Dresses', 'Tops', 'Coats & Jackets', 'Trousers', 'Accessories'],
      BOYS: ['T-Shirts', 'Shirts', 'Outerwear', 'Trousers', 'Accessories'],
      BABIES: ['Clothing Sets', 'Bodysuits', 'Outerwear', 'Footwear'],
      SHOES: ['Sneakers', 'Sandals', 'Boots', 'School Shoes'],
    },
  },
  {
    id: 'designers',
    label: 'DESIGNERS',
    isBrands: true,
    sections: null,
  },
  {
    id: 'sale',
    label: 'SALE',
    highlight: 'red',
    sections: null,
  },
]

const BRAND_LIST = Object.values(brands)

export default function SuperHeader() {
  const location = useLocation()
  const hide = ['/', '/login', '/onboarding'].includes(location.pathname)
  if (hide) return null

  return (
    <div
      className="hidden md:block fixed z-40 left-0 right-0 border-b border-white/[0.06]"
      style={{ top: '57px', background: 'rgba(0,0,0,0.97)', backdropFilter: 'blur(16px)' }}
    >
      <nav className="flex items-center gap-0 px-8 h-[46px] overflow-x-auto scrollbar-none md:ml-[220px]">
        {CATEGORIES.map((cat) => (
          <CategoryItem key={cat.id} cat={cat} />
        ))}
      </nav>
    </div>
  )
}

function CategoryItem({ cat }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const closeTimer = useRef(null)

  const handleMouseEnter = useCallback(() => {
    clearTimeout(closeTimer.current)
    if (cat.sections || cat.isBrands) setOpen(true)
  }, [cat])

  const handleMouseLeave = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpen(false), 180)
  }, [])

  const handleClick = () => {
    if (!cat.sections && !cat.isBrands) {
      navigate(`/home?gender=${cat.id}`)
    }
  }

  const labelColor =
    cat.highlight === 'gold' ? '#cca350' :
    cat.highlight === 'red'  ? '#af0000' :
    null

  return (
    <div
      className="relative h-full flex-shrink-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={handleClick}
        className={`h-full flex items-center gap-1 px-4 text-[11px] tracking-widest font-sans transition-colors duration-200 whitespace-nowrap relative group ${
          open ? 'text-cream' : 'text-gray hover:text-cream'
        }`}
        style={labelColor ? { color: labelColor } : {}}
      >
        {cat.label}
        {(cat.sections || cat.isBrands) && (
          <ChevronDown
            size={10}
            className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            style={{ opacity: 0.5 }}
          />
        )}
        {/* Active underline */}
        <span
          className="absolute bottom-0 left-4 right-4 h-px bg-gold transition-all duration-300"
          style={{ opacity: open ? 1 : 0, transform: open ? 'scaleX(1)' : 'scaleX(0)', transformOrigin: 'left' }}
        />
      </button>

      {/* Mega-menu dropdown */}
      <AnimatePresence>
        {open && (
          <MegaMenu
            cat={cat}
            onMouseEnter={() => clearTimeout(closeTimer.current)}
            onMouseLeave={handleMouseLeave}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function MegaMenu({ cat, onMouseEnter, onMouseLeave }) {
  const navigate = useNavigate()

  const go = (params) => navigate(`/home?${new URLSearchParams(params).toString()}`)

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, clipPath: 'inset(0 0 100% 0)' }}
      animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' }}
      exit={{ opacity: 0, y: -4, clipPath: 'inset(0 100% 0 0)' }}
      transition={{ duration: 0.28, ease: EASE }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute left-0 top-full border border-white/[0.08] border-t-0 z-50"
      style={{
        background: 'rgba(4,4,4,0.98)',
        backdropFilter: 'blur(20px)',
        minWidth: cat.isBrands ? '560px' : '640px',
      }}
    >
      {/* Standard category mega-menu */}
      {cat.sections && (
        <div className="p-8">
          <div className="grid gap-8" style={{ gridTemplateColumns: `repeat(${Object.keys(cat.sections).length}, 1fr)` }}>
            {Object.entries(cat.sections).map(([group, items]) => (
              <div key={group}>
                <p className="text-[9px] tracking-[0.2em] text-gold/70 font-sans mb-4">{group}</p>
                <ul className="space-y-2.5">
                  {items.map((item) => (
                    <li key={item}>
                      <button
                        onClick={() => go({ gender: cat.id, category: item.toLowerCase().replace(/[^a-z]/g, '-') })}
                        className="text-[12px] text-gray hover:text-cream font-sans transition-colors duration-200 text-left leading-snug"
                      >
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* View all link */}
          <div className="mt-8 pt-5 border-t border-white/[0.06] flex items-center justify-between">
            <button
              onClick={() => go({ gender: cat.id })}
              className="text-[10px] tracking-widest text-gold font-sans hover:text-cream transition-colors duration-200 flex items-center gap-2"
            >
              VIEW ALL {cat.label} →
            </button>
            <p className="text-[10px] text-gray/30 font-sans">{cat.label} · NEW SEASON</p>
          </div>
        </div>
      )}

      {/* Designers / Brands mega-menu */}
      {cat.isBrands && (
        <div className="p-8">
          <p className="text-[9px] tracking-[0.2em] text-gold/70 font-sans mb-6">OUR BRANDS</p>
          <div className="grid grid-cols-3 gap-4">
            {BRAND_LIST.map((brand) => (
              <Link
                key={brand.id}
                to={`/brand/${brand.id}`}
                className="group flex items-start gap-3 p-3 border border-white/[0.06] hover:border-gold/30 transition-colors duration-300"
              >
                <div
                  className="w-8 h-8 flex-shrink-0 bg-cover bg-center border border-white/10"
                  style={{ backgroundImage: `url(${brand.cover})` }}
                />
                <div>
                  <p className="text-[11px] tracking-widest text-cream font-sans group-hover:text-gold transition-colors duration-200">
                    {brand.name}
                  </p>
                  <p className="text-[10px] text-gray/50 font-body mt-0.5">{brand.location}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-white/[0.06]">
            <Link
              to="/home"
              className="text-[10px] tracking-widest text-gold font-sans hover:text-cream transition-colors duration-200"
            >
              VIEW ALL DESIGNERS →
            </Link>
          </div>
        </div>
      )}
    </motion.div>
  )
}

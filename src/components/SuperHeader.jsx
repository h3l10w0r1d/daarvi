import { useState, useRef, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Sparkles } from 'lucide-react'
import { brands } from '../data/mockData'

const EASE = [0.76, 0, 0.24, 1]

const CATEGORIES = [
  {
    id: 'new',
    label: 'NEW IN',
    highlight: 'gold',
    sections: {
      'JUST DROPPED': ['New Arrivals', 'Trending Now', "Editor's Pick", 'Back in Stock'],
      WOMEN:          ['Dresses', 'Tops', 'Outerwear', 'Accessories'],
      MEN:            ['Shirts', 'Knitwear', 'Outerwear', 'Shoes'],
    },
  },
  {
    id: 'women',
    label: 'WOMEN',
    sections: {
      CLOTHING:    ['Dresses', 'Tops & T-Shirts', 'Shirts & Blouses', 'Knitwear', 'Coats & Jackets', 'Trousers', 'Skirts', 'Jeans', 'Lingerie'],
      SHOES:       ['Sandals', 'Heels & Pumps', 'Flats', 'Sneakers', 'Boots', 'Mules'],
      BAGS:        ['Shoulder Bags', 'Tote Bags', 'Clutches', 'Backpacks', 'Mini Bags'],
      ACCESSORIES: ['Jewellery', 'Sunglasses', 'Scarves & Wraps', 'Belts', 'Hats'],
    },
  },
  {
    id: 'men',
    label: 'MEN',
    sections: {
      CLOTHING:    ['T-Shirts & Vests', 'Shirts', 'Knitwear', 'Coats & Jackets', 'Trousers', 'Jeans', 'Shorts', 'Suits'],
      SHOES:       ['Sneakers', 'Boots', 'Loafers', 'Sandals', 'Derby & Formal'],
      BAGS:        ['Backpacks', 'Messenger Bags', 'Tote Bags', 'Belt Bags'],
      ACCESSORIES: ['Watches', 'Sunglasses', 'Scarves', 'Belts', 'Hats & Caps'],
    },
  },
  {
    id: 'kids',
    label: 'KIDS',
    sections: {
      GIRLS:  ['Dresses', 'Tops', 'Coats & Jackets', 'Trousers', 'Accessories'],
      BOYS:   ['T-Shirts', 'Shirts', 'Outerwear', 'Trousers', 'Accessories'],
      BABIES: ['Clothing Sets', 'Bodysuits', 'Outerwear', 'Footwear'],
      SHOES:  ['Sneakers', 'Sandals', 'Boots', 'School Shoes'],
    },
  },
  {
    id: 'sport',
    label: 'SPORT',
    sections: {
      SKIING:      ['Ski Jackets', 'Ski Pants', 'Base Layers', 'Gloves & Mitts', 'Ski Helmets', 'Goggles', 'Ski Boots'],
      SNOWBOARD:   ['Snowboard Jackets', 'Snowboard Pants', 'Boots', 'Bindings', 'Helmets'],
      ACTIVEWEAR:  ['Gym Wear', 'Running', 'Yoga', 'Cycling', 'Swimming', 'Compression'],
      FOOTWEAR:    ['Trainers', 'Trail Running', 'Hiking Boots', 'Football Boots', 'Water Shoes'],
    },
  },
  {
    id: 'designers',
    label: 'DESIGNERS',
    isBrands: true,
    sections: null,
  },
  {
    id: 'try-on',
    label: 'TRY ON',
    isLink: '/try-on',
    highlight: null,
    sections: null,
    icon: Sparkles,
  },
  {
    id: 'sale',
    label: 'SALE',
    highlight: 'red',
    sections: {
      WOMEN: ['Dresses', 'Tops', 'Shoes', 'Bags', 'Accessories'],
      MEN:   ['Shirts', 'Trousers', 'Shoes', 'Accessories'],
      KIDS:  ['Clothing', 'Shoes', 'Accessories'],
      SPORT: ['Ski Wear', 'Activewear', 'Footwear'],
    },
  },
]

const BRAND_LIST = Object.values(brands)

export default function SuperHeader() {
  const location = useLocation()
  const hide = ['/', '/login', '/onboarding'].includes(location.pathname)
  if (hide) return null

  return (
    <div
      className="hidden md:block fixed z-40 left-0 right-0 border-b border-white/[0.08]"
      style={{ top: '57px', background: 'rgba(0,0,0,0.97)', backdropFilter: 'blur(16px)' }}
    >
      <nav className="flex items-center gap-0 px-8 h-[58px] md:ml-[220px]">
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
    if (cat.isLink) { navigate(cat.isLink); return }
    if (!cat.sections && !cat.isBrands) navigate(`/home?gender=${cat.id}`)
  }

  const labelColor =
    cat.highlight === 'gold' ? '#cca350' :
    cat.highlight === 'red'  ? '#af0000' :
    null

  const Icon = cat.icon || null

  return (
    <div
      className="relative h-full flex-shrink-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={handleClick}
        className={`h-full flex items-center gap-2 px-5 text-[13px] tracking-[0.12em] font-sans transition-colors duration-200 whitespace-nowrap relative group ${
          open ? 'text-cream' : 'text-gray hover:text-cream'
        }`}
        style={labelColor ? { color: labelColor } : {}}
      >
        {Icon && <Icon size={13} style={{ opacity: 0.75 }} />}
        {cat.label}
        {(cat.sections || cat.isBrands) && (
          <ChevronDown
            size={11}
            className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            style={{ opacity: 0.5 }}
          />
        )}
        {/* Active underline */}
        <span
          className="absolute bottom-0 left-5 right-5 h-[2px] bg-gold transition-all duration-300"
          style={{ opacity: open ? 1 : 0, transform: open ? 'scaleX(1)' : 'scaleX(0)', transformOrigin: 'left' }}
        />
      </button>

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
  const toSlug = (str) => str.toLowerCase().replace(/[^a-z]/g, '-').replace(/-+/g, '-')

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
        background: 'rgba(4,4,4,0.99)',
        backdropFilter: 'blur(20px)',
        minWidth: cat.isBrands ? '600px' : '700px',
      }}
    >
      {/* Standard category mega-menu */}
      {cat.sections && (
        <div className="p-10">
          <div
            className="grid gap-10"
            style={{ gridTemplateColumns: `repeat(${Object.keys(cat.sections).length}, 1fr)` }}
          >
            {Object.entries(cat.sections).map(([group, items]) => (
              <div key={group}>
                <p className="text-[11px] tracking-[0.2em] text-gold/80 font-sans mb-5 uppercase">{group}</p>
                <ul className="space-y-3">
                  {items.map((item) => (
                    <li key={item}>
                      <button
                        onClick={() => go({ gender: cat.id, category: toSlug(item) })}
                        className="text-[14px] text-gray/80 hover:text-cream font-sans transition-colors duration-200 text-left leading-snug"
                      >
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-5 border-t border-white/[0.06] flex items-center justify-between">
            <button
              onClick={() => go({ gender: cat.id })}
              className="text-[12px] tracking-widest text-gold font-sans hover:text-cream transition-colors duration-200 flex items-center gap-2"
            >
              VIEW ALL {cat.label} →
            </button>
            <p className="text-[10px] text-gray/30 font-sans">{cat.label} · NEW SEASON</p>
          </div>
        </div>
      )}

      {/* Designers / Brands mega-menu */}
      {cat.isBrands && (
        <div className="p-10">
          <p className="text-[11px] tracking-[0.2em] text-gold/80 font-sans mb-6 uppercase">Our Brands</p>
          <div className="grid grid-cols-3 gap-4">
            {BRAND_LIST.map((brand) => (
              <Link
                key={brand.id}
                to={`/brand/${brand.id}`}
                className="group flex items-start gap-3 p-3 border border-white/[0.06] hover:border-gold/30 transition-colors duration-300"
              >
                <div
                  className="w-10 h-10 flex-shrink-0 bg-cover bg-center border border-white/10"
                  style={{ backgroundImage: `url(${brand.cover})` }}
                />
                <div>
                  <p className="text-[13px] tracking-widest text-cream font-sans group-hover:text-gold transition-colors duration-200">
                    {brand.name}
                  </p>
                  <p className="text-[11px] text-gray/50 font-body mt-0.5">{brand.location}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-white/[0.06]">
            <Link
              to="/home"
              className="text-[12px] tracking-widest text-gold font-sans hover:text-cream transition-colors duration-200"
            >
              VIEW ALL DESIGNERS →
            </Link>
          </div>
        </div>
      )}
    </motion.div>
  )
}

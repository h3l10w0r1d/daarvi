import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Layers } from 'lucide-react'
import { productsApi } from '../api/products'
import { brandsApi } from '../api/brands'

const EASE = [0.76, 0, 0.24, 1]

const EDITORIALS = [
  { tag: 'THE SPRING EDIT',   headline: 'Lightness\nReconsidered',  sub: 'Effortless silhouettes for a new season.' },
  { tag: 'AFTER DARK',        headline: 'Dressed for\nEverything',   sub: 'From dusk to dawn — one outfit, infinite presence.' },
  { tag: 'ARCHITECT OF SELF', headline: 'Structure\nas Expression', sub: 'Tailoring that speaks before you do.' },
]

// ─────────────────────────────────────────────────────────────────────────────
export default function Featured() {
  const navigate = useNavigate()
  const [products, setProducts]   = useState([])
  const [brands, setBrands]       = useState([])
  const [heroIdx, setHeroIdx]     = useState(0)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([
      productsApi.list({ limit: 8 }),
      brandsApi.list(),
    ])
      .then(([prods, brnds]) => {
        setProducts(prods.slice(0, 8))
        setBrands(brnds.slice(0, 6))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Rotate editorial headline every 5s
  useEffect(() => {
    const id = setInterval(() => setHeroIdx(i => (i + 1) % EDITORIALS.length), 5000)
    return () => clearInterval(id)
  }, [])

  const ed = EDITORIALS[heroIdx]

  return (
    <div className="min-h-screen bg-black pb-20">

      {/* ── Hero editorial ──────────────────────────────────────────────────── */}
      <div className="relative px-6 md:px-14 pt-14 pb-16 overflow-hidden border-b border-white/[0.06]">
        {/* Subtle background texture */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, #cca350 0px, #cca350 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, #cca350 0px, #cca350 1px, transparent 1px, transparent 60px)',
          }} />

        <div className="relative max-w-2xl">
          <motion.p
            key={ed.tag}
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-[9px] tracking-[0.45em] font-sans text-gold/70 mb-5">
            {ed.tag}
          </motion.p>

          <motion.h1
            key={ed.headline}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="font-serif leading-none mb-5"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', whiteSpace: 'pre-line', color: '#f4ecdc' }}>
            {ed.headline}
          </motion.h1>

          <motion.p
            key={ed.sub}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[14px] font-body text-gray/60 leading-relaxed mb-8 max-w-sm">
            {ed.sub}
          </motion.p>

          {/* Editorial nav dots */}
          <div className="flex gap-2 mb-8">
            {EDITORIALS.map((_, i) => (
              <button key={i} onClick={() => setHeroIdx(i)}
                className="transition-all duration-300"
                style={{
                  width: i === heroIdx ? '24px' : '6px',
                  height: '2px',
                  background: i === heroIdx ? '#cca350' : 'rgba(255,255,255,0.2)',
                }} />
            ))}
          </div>

          <Link to="/look-picker"
            className="inline-flex items-center gap-2 px-7 py-3.5 text-[11px] tracking-[0.22em] font-sans transition-all duration-300 group"
            style={{ background: '#cca350', color: '#000' }}>
            BUILD YOUR LOOK
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* ── New in ──────────────────────────────────────────────────────────── */}
      <section className="px-6 md:px-14 pt-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[9px] tracking-[0.4em] text-gold/60 font-sans mb-2">SELECTION</p>
            <h2 className="font-serif text-2xl md:text-3xl text-cream">New Arrivals</h2>
          </div>
          <Link to="/home?cat=all"
            className="text-[10px] tracking-[0.2em] font-sans text-gray/50 hover:text-gold transition-colors flex items-center gap-1.5">
            VIEW ALL <ArrowRight size={10} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1,2,3,4].map(n => (
              <div key={n} className="animate-pulse">
                <div className="aspect-[3/4] bg-white/[0.04]" />
                <div className="mt-3 space-y-1.5">
                  <div className="h-2 bg-white/[0.04] rounded w-1/3" />
                  <div className="h-3 bg-white/[0.04] rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {products.map((p, i) => (
              <ProductTile key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* ── Look Picker CTA ─────────────────────────────────────────────────── */}
      <section className="mx-6 md:mx-14 mt-16 border border-gold/20 p-10 md:p-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        style={{ background: 'rgba(204,163,80,0.03)' }}>
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Layers size={14} className="text-gold/60" />
            <p className="text-[9px] tracking-[0.4em] font-sans text-gold/60">LOOK PICKER</p>
          </div>
          <h3 className="font-serif text-2xl md:text-3xl text-cream mb-2">
            Build a complete look
          </h3>
          <p className="text-[13px] font-body text-gray/50 max-w-sm leading-relaxed">
            Pick an outfit, swap items, get AI styling advice from Aria, and checkout in one place.
          </p>
        </div>
        <Link to="/look-picker"
          className="flex-shrink-0 flex items-center gap-2 px-8 py-4 text-[11px] tracking-[0.22em] font-sans group transition-all duration-300 hover:bg-cream"
          style={{ background: '#cca350', color: '#000' }}>
          OPEN LOOK PICKER
          <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </section>

      {/* ── Brand strip ─────────────────────────────────────────────────────── */}
      {brands.length > 0 && (
        <section className="px-6 md:px-14 mt-16">
          <p className="text-[9px] tracking-[0.4em] text-gold/60 font-sans mb-6">BRANDS IN THIS EDIT</p>
          <div className="flex flex-wrap gap-3">
            {brands.map(brand => (
              <Link key={brand.id} to={`/brand/${brand.id}`}
                className="px-5 py-2.5 border border-white/[0.08] text-[10px] tracking-[0.2em] font-sans text-gray/60 hover:border-gold/40 hover:text-cream transition-all duration-200">
                {brand.name.toUpperCase()}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
function ProductTile({ product, index }) {
  const navigate = useNavigate()
  const image     = product.images?.[0]?.url ?? product.image ?? ''
  const brandName = product.brand?.name ?? ''
  const price     = product.price_global ?? product.price_local ?? 0

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE, delay: index * 0.06 }}
      onClick={() => navigate(`/product/${product.id}`)}
      className="group text-left w-full"
    >
      <div className="aspect-[3/4] overflow-hidden bg-neutral-900 relative">
        {image && (
          <img src={image} alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
      </div>
      <div className="mt-3">
        <p className="text-[9px] tracking-[0.2em] font-sans text-gray/40">{brandName.toUpperCase()}</p>
        <p className="text-[13px] font-sans text-cream mt-0.5 leading-snug line-clamp-2 group-hover:text-gold transition-colors duration-200">
          {product.name}
        </p>
        <p className="text-[12px] font-sans text-gray/60 mt-1">${price}</p>
      </div>
    </motion.button>
  )
}

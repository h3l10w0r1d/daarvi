import { useParams, Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ArrowLeft, MapPin } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useBrand } from '../hooks/useBrands'
import ProductCard from '../components/ProductCard'

const EASE = [0.76, 0, 0.24, 1]

export default function BrandPage() {
  const { brandId } = useParams()
  const { mode } = useApp()

  const { data, isLoading } = useBrand(brandId)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black pt-10 flex items-center justify-center">
        <div className="w-6 h-6 border border-gold/40 border-t-gold animate-spin" />
      </div>
    )
  }

  const brand = data?.brand
  const brandProducts = data?.products || []
  const brandStores = data?.stores || []

  if (!brand) {
    return (
      <div className="min-h-screen bg-black pt-10 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray font-sans text-sm mb-4">Brand not found</p>
          <Link to="/home" className="text-xs tracking-widest text-gold font-sans">← BACK TO HOME</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-10">
      {/* Back */}
      <div className="px-8 md:px-12 pt-6 mb-0">
        <Link
          to="/home"
          className="inline-flex items-center gap-2 text-[10px] tracking-widest text-gray hover:text-cream font-sans transition-colors group"
        >
          <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
          COLLECTION
        </Link>
      </div>

      {/* Hero */}
      <motion.div
        className="relative h-[55vh] overflow-hidden mt-6"
        initial={{ clipPath: 'inset(0 0 100% 0)' }}
        animate={{ clipPath: 'inset(0 0 0% 0)' }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        <img
          src={brand.cover_url}
          alt={brand.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 px-8 md:px-12 pb-12">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5, ease: EASE }}
            className="text-[9px] tracking-[0.4em] text-gold font-sans mb-3"
          >
            EST. {brand.founded} · {brand.origin}
          </motion.p>

          <div style={{ overflow: 'hidden' }}>
            <motion.h1
              className="font-serif text-[clamp(3rem,7vw,6rem)] text-cream leading-none mb-4"
              initial={{ y: 60, clipPath: 'inset(0 0 100% 0)' }}
              animate={{ y: 0, clipPath: 'inset(0 0 0% 0)' }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.3 }}
            >
              {brand.name}
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="font-serif text-xl text-cream/60 italic"
          >
            "{brand.tagline}"
          </motion.p>
        </div>

        {/* Stats strip */}
        <div className="absolute top-6 right-8 md:right-12 flex gap-6">
          {[
            { label: 'PRODUCTS', value: brandProducts.length },
            { label: 'STORES', value: brandStores.length },
          ].map(stat => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4, ease: EASE }}
              className="text-right"
            >
              <p className="text-2xl font-serif text-cream">{stat.value}</p>
              <p className="text-[9px] tracking-[0.3em] text-gray/60 font-sans">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* About */}
      <AboutSection brand={brand} />

      {/* Stores */}
      {brandStores.length > 0 && <StoresSection stores={brandStores} />}

      {/* Products */}
      <ProductsSection products={brandProducts} mode={mode} />
    </div>
  )
}

function AboutSection({ brand }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="px-8 md:px-12 py-16 border-b border-white/8">
      <div className="max-w-2xl">
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="text-[9px] tracking-[0.4em] text-gold/80 font-sans mb-6"
        >
          ABOUT
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
          className="text-base text-cream/80 font-body leading-relaxed"
        >
          {brand.description}
        </motion.p>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
          className="mt-8 h-px bg-gold/20 origin-left"
        />
      </div>
    </section>
  )
}

function StoresSection({ stores: brandStores }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section ref={ref} className="px-8 md:px-12 py-12 border-b border-white/8">
      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        className="text-[9px] tracking-[0.4em] text-gray/60 font-sans mb-8"
      >
        LOCATIONS
      </motion.p>
      <div className="flex gap-4 flex-wrap">
        {brandStores.map((store, i) => (
          <motion.div
            key={store.id}
            initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            animate={inView ? { opacity: 1, clipPath: 'inset(0 0 0% 0)' } : {}}
            transition={{ duration: 0.5, ease: EASE, delay: i * 0.1 }}
            className="border border-white/10 px-6 py-4 min-w-[180px]"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 ${store.type === 'local' ? 'bg-red' : 'bg-gold'}`} />
              <span className={`text-[9px] tracking-widest font-sans ${store.type === 'local' ? 'text-red' : 'text-gold'}`}>
                {store.type.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-cream font-sans">{store.city}</p>
            <div className="flex items-center gap-1 mt-1">
              <MapPin size={10} className="text-gray/50" />
              <p className="text-[10px] text-gray/60 font-sans">{store.distance}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function ProductsSection({ products: brandProducts }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section ref={ref} className="px-8 md:px-12 py-14 pb-24">
      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        className="text-[9px] tracking-[0.4em] text-gray/60 font-sans mb-8"
      >
        THE COLLECTION — {brandProducts.length} PIECES
      </motion.p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {brandProducts.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </section>
  )
}

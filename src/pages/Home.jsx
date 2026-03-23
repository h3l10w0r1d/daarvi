import { useState, useRef, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { ArrowRight, SlidersHorizontal } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useProductsInfinite, useRecommended } from '../hooks/useProducts'
import ProductCard from '../components/ProductCard'
import { ProductCardSkeleton } from '../components/Skeleton'

const categories = ['all', 'outerwear', 'tops', 'bottoms', 'dresses', 'accessories']
const EASE = [0.76, 0, 0.24, 1]

// Maps SuperHeader subcategory slugs → Home filter categories
const CATEGORY_MAP = {
  'dresses': 'dresses',
  'tops-t-shirts': 'tops', 'shirts-blouses': 'tops', 'knitwear': 'tops',
  't-shirts-vests': 'tops', 'shirts': 'tops',
  'coats-jackets': 'outerwear', 'outerwear': 'outerwear',
  'trousers': 'bottoms', 'skirts': 'bottoms', 'jeans': 'bottoms',
  'shorts': 'bottoms', 'suits': 'bottoms',
  'sandals': 'accessories', 'heels-pumps': 'accessories', 'flats': 'accessories',
  'sneakers': 'accessories', 'boots': 'accessories', 'mules': 'accessories',
  'loafers': 'accessories', 'derby-formal': 'accessories',
  'shoulder-bags': 'accessories', 'tote-bags': 'accessories', 'clutches': 'accessories',
  'backpacks': 'accessories', 'mini-bags': 'accessories', 'belt-bags': 'accessories',
  'messenger-bags': 'accessories',
  'jewellery': 'accessories', 'sunglasses': 'accessories', 'scarves-wraps': 'accessories',
  'belts': 'accessories', 'hats': 'accessories', 'watches': 'accessories',
  'scarves': 'accessories', 'hats-caps': 'accessories',
}

export default function Home() {
  const { mode, toggleMode, dnaProfile } = useApp()
  const [searchParams] = useSearchParams()
  const [activeCategory, setActiveCategory] = useState('all')

  // Sync category from SuperHeader URL params
  useEffect(() => {
    const cat = searchParams.get('category')
    const gender = searchParams.get('gender')
    if (cat) {
      const mapped = CATEGORY_MAP[cat] || (categories.includes(cat) ? cat : null)
      if (mapped) { setActiveCategory(mapped); return }
    }
    if (gender === 'sale' || gender === 'new') {
      setActiveCategory('all')
      return
    }
    // gender alone (women/men/kids) = show all
    if (gender) setActiveCategory('all')
  }, [searchParams])

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useProductsInfinite({
    mode,
    ...(activeCategory !== 'all' && { category: activeCategory }),
  })

  // Flatten pages into a single array
  const products = data?.pages.flat() ?? []

  // ─── Infinite scroll sentinel ───────────────────────────────────────────────
  const sentinelRef = useRef(null)

  const onIntersect = useCallback(
    (entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  )

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(onIntersect, { rootMargin: '300px' })
    observer.observe(el)
    return () => observer.disconnect()
  }, [onIntersect])

  // Reset to first page on filter change (React Query handles this automatically
  // because the queryKey changes, but we need the UI to scroll back up)
  const prevCategory = useRef(activeCategory)
  useEffect(() => {
    if (activeCategory !== prevCategory.current) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      prevCategory.current = activeCategory
    }
  }, [activeCategory])

  return (
    <div className="min-h-screen bg-black pt-10">
      {/* Mode Hero Strip */}
      <ModeStrip mode={mode} toggleMode={toggleMode} />

      {/* Recommended */}
      {dnaProfile && <RecommendedSection dnaProfile={dnaProfile} />}

      {/* Products */}
      <section className="px-8 md:px-16 pb-32">
        {/* Item count */}
        <div className="flex items-center justify-end py-6 border-b border-white/10 mb-8">
          <div className="flex items-center gap-2 text-[11px] text-gray font-sans">
            <SlidersHorizontal size={13} />
            <span>
              {isLoading
                ? '— ITEMS'
                : `${products.length}${hasNextPage ? '+' : ''} ITEMS`}
            </span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              <ProductCardSkeleton count={8} />
            </motion.div>
          ) : (
            <motion.div
              key={`grid-${mode}-${activeCategory}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {products.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-24 text-center"
                >
                  <p className="text-gray font-sans text-sm">
                    No items available in {mode} mode for this category.
                  </p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {products.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i % 8} />
                  ))}
                </div>
              )}

              {/* Inline skeleton rows while fetching next page */}
              {isFetchingNextPage && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
                  <ProductCardSkeleton count={4} />
                </div>
              )}

              {/* End-of-results indicator */}
              {!hasNextPage && products.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-6 mt-16 mb-4"
                >
                  <div className="flex-1 h-px bg-white/8" />
                  <span className="text-[9px] tracking-[0.35em] text-gray/30 font-sans whitespace-nowrap">
                    END OF COLLECTION
                  </span>
                  <div className="flex-1 h-px bg-white/8" />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Invisible sentinel that triggers next-page fetch */}
        <div ref={sentinelRef} className="h-1" />
      </section>

    </div>
  )
}

function ModeStrip({ mode, toggleMode }) {
  return (
    <div className="relative overflow-hidden border-b border-white/10">
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ clipPath: 'inset(0 0 0 100%)' }}
          animate={{ clipPath: 'inset(0 0 0 0%)' }}
          exit={{ clipPath: 'inset(0 100% 0 0)' }}
          transition={{ duration: 0.5, ease: EASE }}
          className={`px-8 md:px-16 py-10 ${mode === 'local' ? 'bg-red/10' : 'bg-gold/5'}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-[10px] tracking-widest font-sans mb-1 ${mode === 'local' ? 'text-red' : 'text-gold'}`}>
                {mode === 'local' ? '📍 LOCAL MODE' : '🌐 GLOBAL MODE'}
              </p>
              <h1 className="font-serif text-3xl md:text-4xl text-cream">
                {mode === 'local' ? 'Nearby Boutiques' : 'World Brands'}
              </h1>
              <p className="text-sm text-gray font-body mt-2">
                {mode === 'local'
                  ? 'Curated stores in your city — fast delivery, real connections'
                  : 'International collections — exclusive pieces delivered worldwide'}
              </p>
            </div>
            <button
              onClick={toggleMode}
              className={`flex items-center gap-2 px-6 py-3 text-xs tracking-widest font-sans transition-all duration-300 ${
                mode === 'local'
                  ? 'border border-gold text-gold hover:bg-gold hover:text-black'
                  : 'border border-red text-red hover:bg-red hover:text-cream'
              }`}
            >
              SWITCH TO {mode === 'local' ? 'GLOBAL' : 'LOCAL'}
              <ArrowRight size={12} />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function RecommendedSection({ dnaProfile }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  const styleStr = (dnaProfile.style || []).join(',')
  const { data: recommended = [], isLoading } = useRecommended(styleStr, 4)

  if (!isLoading && recommended.length === 0) return null

  return (
    <section ref={ref} className="px-8 md:px-16 py-12 border-b border-white/10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6 }}
        className="mb-6"
      >
        <p className="text-[10px] tracking-widest text-gold font-sans mb-1">BASED ON YOUR DNA TEST</p>
        <h2 className="font-serif text-2xl text-cream">Recommended For You</h2>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading
          ? <ProductCardSkeleton count={4} />
          : recommended.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))
        }
      </div>
    </section>
  )
}


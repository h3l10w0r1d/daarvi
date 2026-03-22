import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Sparkles, Truck, MapPin, Heart, ShoppingBag, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useProduct, useProducts } from '../hooks/useProducts'
import ProductCard from '../components/ProductCard'
import LazyImage from '../components/LazyImage'
import { ProductDetailSkeleton } from '../components/Skeleton'

const EASE = [0.76, 0, 0.24, 1]

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { mode, isWishlisted, toggleWishlist, addToCart } = useApp()
  const { data: product, isLoading } = useProduct(id)

  const [imageIndex, setImageIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [addedToCart, setAddedToCart] = useState(false)

  // Fetch related products (same category)
  const { data: allProducts = [] } = useProducts(product ? { category: product.category } : {})
  const related = allProducts.filter(p => p.id !== id).slice(0, 4)

  if (isLoading) {
    return <ProductDetailSkeleton />
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black pt-10 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray font-sans text-sm mb-4">Product not found</p>
          <Link to="/home" className="text-xs tracking-widest text-gold font-sans">← BACK TO HOME</Link>
        </div>
      </div>
    )
  }

  const price = mode === 'local' ? product.price_local : product.price_global
  const delivery = mode === 'local' ? product.delivery_local : product.delivery_global
  const brand = product.brand
  const wishlisted = isWishlisted(product.id)

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) return
    addToCart(product, selectedSize, selectedColor)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const handleCheckout = () => {
    if (!selectedSize || !selectedColor) return
    addToCart(product, selectedSize, selectedColor)
    navigate('/checkout')
  }

  // images from API are [{url, position}] objects
  const imageUrls = (product.images || []).map(img => img.url || img)
  const prevImage = () => setImageIndex(i => (i - 1 + imageUrls.length) % imageUrls.length)
  const nextImage = () => setImageIndex(i => (i + 1) % imageUrls.length)

  const canBuy = selectedSize && selectedColor

  return (
    <div className="min-h-screen bg-black pt-10">
      {/* Back */}
      <div className="px-8 md:px-12 pt-6 mb-8">
        <Link
          to="/home"
          className="inline-flex items-center gap-2 text-[10px] tracking-widest text-gray hover:text-cream font-sans transition-colors group"
        >
          <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
          COLLECTION
        </Link>
      </div>

      {/* Main grid */}
      <div className="grid md:grid-cols-2 gap-0 px-8 md:px-12 pb-16">

        {/* LEFT — Image gallery */}
        <div className="relative">
          {/* Main image */}
          <div className="relative aspect-[3/4] overflow-hidden bg-neutral-950 group">
            <AnimatePresence mode="wait">
              <motion.div
                key={imageIndex}
                className="w-full h-full"
                initial={{ clipPath: 'inset(0 0 0 100%)' }}
                animate={{ clipPath: 'inset(0 0 0 0%)' }}
                exit={{ clipPath: 'inset(0 100% 0 0)' }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                <LazyImage
                  src={imageUrls[imageIndex]}
                  alt={product.name}
                  className="w-full h-full"
                  eager={imageIndex === 0}
                  fallbackLetter={product.brand?.name?.[0] || '?'}
                />
              </motion.div>
            </AnimatePresence>

            {/* Gallery nav arrows */}
            {imageUrls.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 flex items-center justify-center text-gray hover:text-cream hover:bg-black/90 transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 flex items-center justify-center text-gray hover:text-cream hover:bg-black/90 transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}

            {/* Image counter */}
            <div className="absolute bottom-3 right-3 text-[9px] tracking-widest text-cream/60 font-sans bg-black/50 px-2 py-1">
              {imageIndex + 1} / {imageUrls.length}
            </div>
          </div>

          {/* Thumbnail strip */}
          {imageUrls.length > 1 && (
            <div className="flex gap-2 mt-3">
              {imageUrls.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImageIndex(i)}
                  className={`relative flex-1 aspect-square overflow-hidden transition-all duration-200 ${
                    i === imageIndex ? 'ring-1 ring-gold' : 'opacity-50 hover:opacity-80'
                  }`}
                >
                  <LazyImage src={img} alt="" className="w-full h-full" fallbackLetter="·" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Details */}
        <motion.div
          className="md:pl-12 py-2 flex flex-col"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}
        >
          {/* Brand link */}
          <Link
            to={`/brand/${brand?.slug || brand?.id || ''}`}
            className="group inline-flex items-center gap-2 mb-3"
          >
            <span className="text-[10px] tracking-[0.35em] text-gold font-sans group-hover:text-cream transition-colors">
              {brand?.name || ''}
            </span>
            <motion.span
              className="h-px bg-gold/50 group-hover:bg-cream/50 transition-colors"
              initial={{ width: 0 }}
              animate={{ width: 24 }}
              whileHover={{ width: 40 }}
              transition={{ duration: 0.3, ease: EASE }}
            />
          </Link>

          {/* Product name */}
          <div style={{ overflow: 'hidden' }} className="mb-6">
            <motion.h1
              className="font-serif text-4xl md:text-5xl text-cream leading-tight"
              initial={{ y: 40, clipPath: 'inset(0 0 100% 0)' }}
              animate={{ y: 0, clipPath: 'inset(0 0 0% 0)' }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
            >
              {product.name}
            </motion.h1>
          </div>

          {/* Price block */}
          <div className={`p-4 border mb-6 ${mode === 'local' ? 'border-red/30 bg-red/5' : 'border-gold/30 bg-gold/5'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-[9px] tracking-[0.3em] font-sans mb-1 ${mode === 'local' ? 'text-red' : 'text-gold'}`}>
                  {mode.toUpperCase()} PRICE
                </p>
                <p className="text-3xl font-serif text-cream">${price}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] tracking-widest text-gray font-sans mb-1">DELIVERY</p>
                <div className="flex items-center gap-1 justify-end">
                  <Truck size={11} className="text-gray" />
                  <p className="text-sm text-cream font-sans">{delivery}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Color selector */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] tracking-[0.25em] text-gray font-sans">COLOR</p>
              {selectedColor && (
                <p className="text-[10px] tracking-widest text-cream font-sans">{selectedColor}</p>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  title={color.name}
                  className="relative w-7 h-7 transition-all duration-200"
                  style={{
                    background: color.hex,
                    outline: selectedColor === color.name ? `2px solid #cca350` : '2px solid transparent',
                    outlineOffset: '2px',
                  }}
                >
                  {selectedColor === color.name && (
                    <Check
                      size={10}
                      className="absolute inset-0 m-auto"
                      style={{ color: parseInt(color.hex.replace('#',''), 16) > 0x888888 ? '#000' : '#fff' }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Size selector */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] tracking-[0.25em] text-gray font-sans">SIZE</p>
              {selectedSize && (
                <p className="text-[10px] tracking-widest text-cream font-sans">{selectedSize}</p>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[44px] px-3 py-2 text-[11px] tracking-[0.15em] font-sans border transition-all duration-200 ${
                    selectedSize === size
                      ? 'border-gold bg-gold text-black'
                      : 'border-white/15 text-gray hover:border-white/40 hover:text-cream'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Material / fit */}
          <div className="flex gap-6 mb-8 py-4 border-y border-white/8">
            {product.material && (
              <div>
                <p className="text-[9px] tracking-widest text-gray/60 font-sans mb-1">MATERIAL</p>
                <p className="text-[11px] text-cream/80 font-sans">{product.material}</p>
              </div>
            )}
            {product.fit && (
              <div>
                <p className="text-[9px] tracking-widest text-gray/60 font-sans mb-1">FIT</p>
                <p className="text-[11px] text-cream/80 font-sans">{product.fit}</p>
              </div>
            )}
            <div>
              <p className="text-[9px] tracking-widest text-gray/60 font-sans mb-1">AVAILABILITY</p>
              <div className="flex items-center gap-1">
                <MapPin size={10} className="text-gray/60" />
                <p className="text-[11px] text-cream/80 font-sans">
                  {product.available.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(' & ')}
                </p>
              </div>
            </div>
          </div>

          {/* Validation message */}
          {!canBuy && (
            <p className="text-[10px] tracking-widest text-gray/50 font-sans mb-4">
              Select a {!selectedColor ? 'color' : 'size'} to continue
            </p>
          )}

          {/* CTAs */}
          <div className="flex flex-col gap-2.5 mt-auto">
            {/* Checkout — primary */}
            <button
              onClick={handleCheckout}
              disabled={!canBuy}
              className={`w-full py-4 text-xs tracking-[0.25em] font-sans flex items-center justify-center gap-2 transition-all duration-300 ${
                canBuy
                  ? mode === 'local'
                    ? 'bg-red text-cream hover:bg-cream hover:text-black'
                    : 'bg-gold text-black hover:bg-cream'
                  : 'bg-white/5 text-gray/40 cursor-not-allowed'
              }`}
            >
              <ShoppingBag size={13} />
              CHECKOUT — ${price}
            </button>

            {/* Add to cart — secondary */}
            <button
              onClick={handleAddToCart}
              disabled={!canBuy}
              className={`w-full py-3.5 text-xs tracking-[0.25em] font-sans border flex items-center justify-center gap-2 transition-all duration-300 ${
                addedToCart
                  ? 'border-gold text-gold'
                  : canBuy
                    ? 'border-white/15 text-gray hover:text-cream hover:border-white/40'
                    : 'border-white/5 text-gray/30 cursor-not-allowed'
              }`}
            >
              {addedToCart ? (
                <><Check size={13} /> ADDED TO BAG</>
              ) : (
                <><ShoppingBag size={13} /> ADD TO BAG</>
              )}
            </button>

            {/* Wishlist */}
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`w-full py-3 text-xs tracking-[0.25em] font-sans flex items-center justify-center gap-2 transition-all duration-300 ${
                wishlisted
                  ? 'text-red'
                  : 'text-gray hover:text-cream'
              }`}
            >
              <Heart size={13} fill={wishlisted ? '#af0000' : 'none'} />
              {wishlisted ? 'SAVED TO WISHLIST' : 'SAVE TO WISHLIST'}
            </button>

            {/* Try on */}
            <Link
              to="/try-on"
              className="w-full py-3 text-xs tracking-[0.25em] font-sans border border-white/10 text-gray hover:text-cream hover:border-white/30 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Sparkles size={13} />
              TRY ON WITH AI
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Brand section */}
      {brand && <BrandStrip brand={brand} brandId={brand.id} />}

      {/* Related */}
      {related.length > 0 && (
        <section className="px-8 md:px-12 pb-24 border-t border-white/8 pt-14">
          <p className="text-[10px] tracking-[0.3em] text-gray/60 font-sans mb-8">YOU MAY ALSO LIKE</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function BrandStrip({ brand, brandId }) {
  return (
    <section className="mx-8 md:mx-12 mb-14 relative overflow-hidden">
      {/* Cover image */}
      <div className="relative h-48 overflow-hidden">
        <img src={brand.cover} alt={brand.name} className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 flex items-center px-10 gap-10">
          <div className="flex-1">
            <p className="text-[9px] tracking-[0.4em] text-gold font-sans mb-2">THE BRAND</p>
            <h3 className="font-serif text-2xl text-cream mb-2">{brand.name}</h3>
            <p className="text-xs text-gray font-body max-w-md leading-relaxed line-clamp-2">
              {brand.description}
            </p>
          </div>
          <div className="flex-shrink-0 text-right hidden md:block">
            <p className="text-[9px] tracking-widest text-gray/50 font-sans mb-1">EST.</p>
            <p className="text-lg font-serif text-cream/60">{brand.founded}</p>
            <p className="text-[10px] tracking-widest text-gray/50 font-sans mt-2">{brand.origin}</p>
          </div>
          <Link
            to={`/brand/${brandId}`}
            className="flex-shrink-0 px-6 py-3 border border-gold/40 text-[10px] tracking-[0.25em] text-gold hover:bg-gold hover:text-black transition-all duration-300 font-sans"
          >
            VIEW BRAND →
          </Link>
        </div>
      </div>
    </section>
  )
}

import { useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Star, Heart, Minus, Plus, ShoppingBag, Zap,
  Twitter, Instagram, Youtube, User, Search, Menu, X,
  Truck, RotateCcw, Shield,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useProduct, useProducts } from '../hooks/useProducts'
import { ProductDetailSkeleton } from '../components/Skeleton'
import { products as mockProducts } from '../data/mockData'

// ── Design tokens (exact Figma) ───────────────────────────────────────
const G      = { fontFamily: 'Geist, sans-serif' }
const BLUE   = '#2563eb'
const C_DARK = '#0a0a0a'
const C_MID  = '#737373'
const C_BORDER = '#e8e8e8'
const C_BG   = '#f5f5f5'

// ── Accordion item ────────────────────────────────────────────────────
function Accordion({ items }) {
  const [open, setOpen] = useState(0)
  return (
    <div style={{ border: `1px solid ${C_BORDER}`, borderRadius: 8, overflow: 'hidden' }}>
      {items.map((item, i) => (
        <div key={i} style={{ borderTop: i > 0 ? `1px solid ${C_BORDER}` : 'none' }}>
          <button
            onClick={() => setOpen(open === i ? -1 : i)}
            className="w-full flex items-center justify-between px-4 py-3.5"
            style={{ ...G, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            <span style={{ fontSize: 14, fontWeight: 500, color: C_DARK }}>{item.label}</span>
            {open === i
              ? <ChevronUp size={16} color={C_MID} />
              : <ChevronDown size={16} color={C_MID} />
            }
          </button>
          {open === i && (
            <div className="px-4 pb-4" style={{ ...G, fontSize: 14, fontWeight: 400, color: C_MID, lineHeight: 1.6 }}>
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Stars ─────────────────────────────────────────────────────────────
function Stars({ rating = 4.7, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={size}
          color={i <= Math.round(rating) ? '#f59e0b' : C_BORDER}
          fill={i <= Math.round(rating) ? '#f59e0b' : 'none'}
          strokeWidth={1.5}
        />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { mode, isWishlisted, toggleWishlist, addToCart, cartCount, user } = useApp()

  const { data: apiProduct, isLoading, isError } = useProduct(id)
  // Fall back to mockData when API fails (unauthenticated users or dev mode)
  const product = apiProduct ?? (isError || !isLoading ? mockProducts.find(p => String(p.id) === String(id)) ?? null : undefined)
  const { data: allApiProducts = [] } = useProducts(product ? { category: product.category } : {})
  const allProducts = allApiProducts.length ? allApiProducts : mockProducts
  const related = allProducts.filter(p => String(p.id) !== String(id)).slice(0, 4)

  const [imageIndex, setImageIndex] = useState(0)
  const [selectedSize, setSelectedSize]   = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  if (isLoading && product === undefined) return <ProductDetailSkeleton />

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ ...G, fontSize: 16, color: C_MID, marginBottom: 16 }}>Product not found</p>
          <Link to="/shop" style={{ ...G, fontSize: 14, fontWeight: 500, color: BLUE }}>← Back to shop</Link>
        </div>
      </div>
    )
  }

  const imageUrls = (product.images || []).map(img => img.url || img)
  if (product.image && !imageUrls.length) imageUrls.push(product.image)
  const displayPrice = mode === 'local' ? product.priceLocal ?? product.price_local : product.priceGlobal ?? product.price_global
  const comparePrice = product.priceGlobal ?? product.price_global
  const hasDiscount  = comparePrice && displayPrice && comparePrice > displayPrice
  const discountPct  = hasDiscount ? Math.round((1 - displayPrice / comparePrice) * 100) : 0
  const wishlisted   = isWishlisted?.(product.id) ?? false

  const prevImage = () => setImageIndex(i => (i - 1 + imageUrls.length) % imageUrls.length)
  const nextImage = () => setImageIndex(i => (i + 1) % imageUrls.length)

  const handleTouchStart = e => { touchStartX.current = e.touches[0].clientX; touchStartY.current = e.touches[0].clientY }
  const handleTouchEnd   = e => {
    const dx = touchStartX.current - e.changedTouches[0].clientX
    const dy = touchStartY.current - e.changedTouches[0].clientY
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) dx > 0 ? nextImage() : prevImage()
  }

  const handleAddToCart = () => {
    addToCart?.(product, selectedSize, selectedColor, quantity)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const handleBuyNow = () => {
    addToCart?.(product, selectedSize, selectedColor, quantity)
    navigate('/account')
  }

  const sizes  = product.sizes ?? ['XS','S','M','L','XL','XXL']
  const colors = product.colors ?? [{ name: 'Black', hex: '#0a0a0a' }, { name: 'White', hex: '#f5f5f5' }, { name: 'Navy', hex: '#1e3a5f' }]
  const brand  = product.brand?.name ?? product.brand ?? ''

  const ACCORDION = [
    { label: 'Details', content: product.details || 'Made from premium 100% cotton fabric. Features a modern slim fit, button-down collar, and reinforced seams for durability. Pre-shrunk fabric ensures lasting quality wash after wash.' },
    { label: 'Shipping', content: 'Free standard shipping on orders over $75. Express shipping available at checkout. Orders are typically processed within 1–2 business days and delivered within 5–7 business days.' },
    { label: 'Returns', content: 'We offer free returns within 30 days of purchase. Items must be unworn, unwashed, and in original condition with tags attached. Refunds are processed within 5–10 business days.' },
    { label: 'Others', content: product.description || 'Here you can include detailed information about your product — from materials and sizing to care instructions and shipping details.' },
  ]

  const REVIEWS = [
    { name: 'Robert Lee', date: 'February 20, 2024', rating: 5, text: "Excellent product! The fabric is soft, the construction is solid, and it fits perfectly. I've received many compliments when wearing it. Highly recommend!" },
    { name: 'James Anderson', date: 'February 8, 2024', rating: 5, text: 'Perfect quality! The fabric feels premium and it fits exactly as described. It\'s become a staple in my wardrobe. Worth every penny!' },
  ]

  return (
    <div style={{ ...G, minHeight: '100vh', background: '#fff' }}>

      {/* ── Announcement banner ── */}
      <div style={{ background: BLUE, height: 48 }} className="flex items-center">
        <div className="max-w-[1440px] w-full mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Twitter size={16} color="#f5f5f5" strokeWidth={1.5} className="cursor-pointer opacity-90 hover:opacity-100" />
            <Instagram size={16} color="#f5f5f5" strokeWidth={1.5} className="cursor-pointer opacity-90 hover:opacity-100" />
            <Youtube size={16} color="#f5f5f5" strokeWidth={1.5} className="cursor-pointer opacity-90 hover:opacity-100" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#f5f5f5' }}>Free shipping on orders over $75</span>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1" style={{ fontSize: 14, fontWeight: 500, color: '#f5f5f5' }}>
              USD <ChevronDown size={14} color="#f5f5f5" />
            </button>
            <button className="flex items-center gap-1" style={{ fontSize: 14, fontWeight: 500, color: '#f5f5f5' }}>
              English <ChevronDown size={14} color="#f5f5f5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Store navbar ── */}
      <header style={{ background: '#fff', borderBottom: `1px solid ${C_BORDER}`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="max-w-[1440px] mx-auto px-8 flex items-center justify-between" style={{ height: 64 }}>
          <Link to="/shop" style={{ ...G, fontSize: 20, fontWeight: 700, letterSpacing: '0.1em', color: C_DARK, textDecoration: 'none' }}>
            DAARVI
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {['Women','Men','Kids','Accessories','Store Locator'].map(label => (
              <Link key={label} to={`/shop/${label.toLowerCase()}`}
                style={{ ...G, fontSize: 14, fontWeight: 500, color: C_DARK, padding: '8px 14px', textDecoration: 'none', borderRadius: 6 }}
                className="hover:bg-gray-50 transition-colors"
              >{label}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button className="hidden md:flex w-9 h-9 items-center justify-center rounded-md hover:bg-gray-50">
              <Search size={18} color={C_DARK} strokeWidth={1.5} />
            </button>
            <Link to={user ? '/account' : '/login'} className="flex w-9 h-9 items-center justify-center rounded-md hover:bg-gray-50">
              <User size={18} color={C_DARK} strokeWidth={1.5} />
            </Link>
            <Link to={user ? '/account' : '/login'} className="relative flex w-9 h-9 items-center justify-center rounded-md hover:bg-gray-50">
              <ShoppingBag size={18} color={C_DARK} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: BLUE, color: '#fff', fontSize: 10, fontWeight: 700 }}>{cartCount}</span>
              )}
            </Link>
            <button className="md:hidden w-9 h-9 flex items-center justify-center" onClick={() => setMobileNavOpen(!mobileNavOpen)}>
              <Menu size={20} color={C_DARK} />
            </button>
          </div>
        </div>
        {mobileNavOpen && (
          <div style={{ background: '#fff', borderTop: `1px solid ${C_BORDER}` }} className="md:hidden px-6 py-4 flex flex-col gap-3">
            {['Women','Men','Kids','Accessories','Store Locator'].map(label => (
              <Link key={label} to={`/shop/${label.toLowerCase()}`} onClick={() => setMobileNavOpen(false)}
                style={{ ...G, fontSize: 14, fontWeight: 500, color: C_DARK, textDecoration: 'none', paddingBottom: 8, borderBottom: `1px solid ${C_BORDER}` }}
              >{label}</Link>
            ))}
          </div>
        )}
      </header>

      {/* ── Page body ── */}
      <div className="max-w-[1440px] mx-auto px-8 py-10">

        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-2 mb-8" style={{ ...G, fontSize: 14, fontWeight: 400, color: C_MID }}>
          <Link to="/shop" style={{ color: C_MID, textDecoration: 'none' }} className="hover:text-blue-600 transition-colors">Home</Link>
          <ChevronRight size={14} color={C_BORDER} />
          <Link to="/shop" style={{ color: C_MID, textDecoration: 'none' }} className="hover:text-blue-600 transition-colors">Clothing</Link>
          <ChevronRight size={14} color={C_BORDER} />
          <Link to={`/shop/${product.category}`} style={{ color: C_MID, textDecoration: 'none' }} className="hover:text-blue-600 transition-colors capitalize">
            {product.category}
          </Link>
          <ChevronRight size={14} color={C_BORDER} />
          <span style={{ color: C_DARK }}>{product.name}</span>
        </nav>

        {/* ── Two-column layout ── */}
        <div className="flex flex-col lg:flex-row gap-16">

          {/* ── LEFT: Image gallery ── */}
          <div className="flex-1 min-w-0" style={{ maxWidth: 656 }}>
            {/* Main image */}
            <div
              className="relative overflow-hidden group"
              style={{ aspectRatio: '3/4', background: C_BG, borderRadius: 8, userSelect: 'none', touchAction: 'pan-y' }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={imageUrls[imageIndex]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
              {/* Arrows */}
              {imageUrls.length > 1 && (
                <>
                  <button onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                    style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)' }}>
                    <ChevronLeft size={18} color={C_DARK} />
                  </button>
                  <button onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                    style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)' }}>
                    <ChevronRight size={18} color={C_DARK} />
                  </button>
                </>
              )}
              {/* Image counter */}
              <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md"
                style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', fontSize: 12, fontWeight: 400, color: '#fff' }}>
                Image {imageIndex + 1} of {imageUrls.length}
              </div>
              {/* Wishlist */}
              <button
                onClick={() => toggleWishlist?.(product.id)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all"
                style={{ background: wishlisted ? BLUE : 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)' }}>
                <Heart size={16} color={wishlisted ? '#fff' : C_DARK} fill={wishlisted ? '#fff' : 'none'} />
              </button>
            </div>

            {/* Thumbnail strip */}
            {imageUrls.length > 1 && (
              <div className="flex gap-2 mt-3">
                {imageUrls.map((img, i) => (
                  <button key={i} onClick={() => setImageIndex(i)}
                    className="flex-1 overflow-hidden transition-all"
                    style={{ aspectRatio: '1', borderRadius: 6, border: `2px solid ${i === imageIndex ? BLUE : C_BORDER}`, outline: 'none' }}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Product info ── */}
          <div className="flex flex-col gap-6" style={{ width: 512, maxWidth: '100%', flexShrink: 0 }}>

            {/* Brand + Name + Rating */}
            <div className="flex flex-col gap-3">
              {brand && (
                <Link to={`/shop/${brand.toLowerCase().replace(/\s/g,'-')}`}
                  style={{ ...G, fontSize: 12, fontWeight: 500, color: C_MID, textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' }}
                  className="hover:text-blue-600 transition-colors"
                >{brand}</Link>
              )}
              <h1 style={{ ...G, fontSize: 36, fontWeight: 600, color: C_DARK, lineHeight: 1.2, letterSpacing: '-0.5px', margin: 0 }}>
                {product.name}
              </h1>
              <div className="flex items-center gap-3">
                <Stars rating={4.7} />
                <span style={{ ...G, fontSize: 14, fontWeight: 500, color: C_MID }}>(12 reviews)</span>
              </div>
              <p style={{ ...G, fontSize: 16, fontWeight: 400, color: C_MID, lineHeight: 1.6, margin: 0 }}>
                {product.description ?? 'Premium cotton shirt with modern fit. Perfect for both casual and formal occasions. Made from high-quality fabric that ensures comfort and durability throughout the day.'}
              </p>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span style={{ ...G, fontSize: 30, fontWeight: 600, color: C_DARK }}>${displayPrice}</span>
              {hasDiscount && (
                <>
                  <span style={{ ...G, fontSize: 20, fontWeight: 500, color: C_MID, textDecoration: 'line-through' }}>${comparePrice}</span>
                  <span className="px-2 py-0.5 rounded-md" style={{ ...G, background: '#dcfce7', color: '#16a34a', fontSize: 12, fontWeight: 500 }}>
                    -{discountPct}%
                  </span>
                </>
              )}
            </div>

            {/* Color */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span style={{ ...G, fontSize: 14, fontWeight: 500, color: C_DARK }}>Color</span>
                {selectedColor && <span style={{ ...G, fontSize: 14, fontWeight: 400, color: C_MID }}>{selectedColor}</span>}
              </div>
              <div className="flex items-center gap-2">
                {colors.map(c => (
                  <button key={c.name} onClick={() => setSelectedColor(c.name)}
                    title={c.name}
                    className="transition-transform hover:scale-110"
                    style={{
                      width: 28, height: 28, borderRadius: '50%', background: c.hex,
                      border: `2px solid ${selectedColor === c.name ? BLUE : 'transparent'}`,
                      outline: `2px solid ${selectedColor === c.name ? BLUE : C_BORDER}`,
                      outlineOffset: 2, cursor: 'pointer',
                    }} />
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span style={{ ...G, fontSize: 14, fontWeight: 500, color: C_DARK }}>Size</span>
                <button style={{ ...G, fontSize: 14, fontWeight: 400, color: BLUE, background: 'none', border: 'none', cursor: 'pointer' }}>
                  View size guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map(s => (
                  <button key={s} onClick={() => setSelectedSize(s)}
                    style={{
                      ...G, fontSize: 14, fontWeight: 500, minWidth: 44, height: 36, padding: '0 12px',
                      borderRadius: 6, border: `1px solid ${selectedSize === s ? BLUE : C_BORDER}`,
                      background: selectedSize === s ? BLUE : '#fff',
                      color: selectedSize === s ? '#fff' : C_DARK,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}>{s}</button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="flex flex-col gap-3">
              <span style={{ ...G, fontSize: 14, fontWeight: 500, color: C_DARK }}>Quantity</span>
              <div className="flex items-center gap-0" style={{ border: `1px solid ${C_BORDER}`, borderRadius: 8, width: 'fit-content', overflow: 'hidden' }}>
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="flex items-center justify-center hover:bg-gray-50 transition-colors"
                  style={{ width: 40, height: 40, border: 'none', background: 'none', cursor: 'pointer' }}>
                  <Minus size={16} color={C_DARK} />
                </button>
                <span style={{ ...G, fontSize: 14, fontWeight: 500, color: C_DARK, width: 48, textAlign: 'center', borderLeft: `1px solid ${C_BORDER}`, borderRight: `1px solid ${C_BORDER}`, lineHeight: '40px' }}>
                  {quantity}
                </span>
                <button onClick={() => setQuantity(q => q + 1)}
                  className="flex items-center justify-center hover:bg-gray-50 transition-colors"
                  style={{ width: 40, height: 40, border: 'none', background: 'none', cursor: 'pointer' }}>
                  <Plus size={16} color={C_DARK} />
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3">
              <button onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-2 transition-all"
                style={{
                  ...G, height: 48, borderRadius: 8, fontSize: 14, fontWeight: 500,
                  background: addedToCart ? '#16a34a' : C_DARK,
                  color: '#fff', border: 'none', cursor: 'pointer',
                }}
                onMouseEnter={e => { if (!addedToCart) e.currentTarget.style.background = '#1a1a1a' }}
                onMouseLeave={e => { if (!addedToCart) e.currentTarget.style.background = C_DARK }}
              >
                <ShoppingBag size={16} />
                {addedToCart ? 'Added to cart!' : 'Add to cart'}
              </button>
              <button onClick={handleBuyNow}
                className="w-full flex items-center justify-center gap-2 transition-all"
                style={{
                  ...G, height: 48, borderRadius: 8, fontSize: 14, fontWeight: 500,
                  background: BLUE, color: '#fff', border: 'none', cursor: 'pointer',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#1d4ed8'}
                onMouseLeave={e => e.currentTarget.style.background = BLUE}
              >
                <Zap size={16} />
                Buy it now
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-4">
              {[{ icon: Truck, text: 'Free shipping over $75' }, { icon: RotateCcw, text: '30-day returns' }, { icon: Shield, text: 'Secure checkout' }].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5">
                  <Icon size={14} color={C_MID} />
                  <span style={{ ...G, fontSize: 12, fontWeight: 400, color: C_MID }}>{text}</span>
                </div>
              ))}
            </div>

            {/* Accordion */}
            <Accordion items={ACCORDION} />
          </div>
        </div>

        {/* ── Reviews ── */}
        <div className="mt-20 pb-16" style={{ borderTop: `1px solid ${C_BORDER}`, paddingTop: 48 }}>
          <div className="flex items-center justify-between mb-8">
            <h2 style={{ ...G, fontSize: 18, fontWeight: 600, color: C_DARK, margin: 0 }}>Reviews</h2>
            <div className="flex items-center gap-3">
              <Stars rating={4.7} size={16} />
              <span style={{ ...G, fontSize: 16, fontWeight: 600, color: C_DARK }}>4.7</span>
              <span style={{ ...G, fontSize: 14, fontWeight: 500, color: C_MID }}>12 reviews</span>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            {REVIEWS.map((r, i) => (
              <div key={i} style={{ paddingBottom: 24, borderBottom: `1px solid ${C_BORDER}` }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: C_BG, fontSize: 13, fontWeight: 600, color: C_DARK }}>
                      {r.name[0]}
                    </div>
                    <span style={{ ...G, fontSize: 14, fontWeight: 600, color: C_DARK }}>{r.name}</span>
                  </div>
                  <span style={{ ...G, fontSize: 14, fontWeight: 400, color: C_MID }}>{r.date}</span>
                </div>
                <Stars rating={r.rating} size={13} />
                <p style={{ ...G, fontSize: 14, fontWeight: 400, color: C_MID, lineHeight: 1.6, marginTop: 8, marginBottom: 0 }}>{r.text}</p>
              </div>
            ))}
          </div>
          <button style={{ ...G, marginTop: 24, fontSize: 14, fontWeight: 500, color: BLUE, background: 'none', border: 'none', cursor: 'pointer' }}>
            View all reviews →
          </button>
        </div>

        {/* ── You May Also Like ── */}
        <ProductListSection title="You May Also Like" products={related.slice(0, 4)} />

        {/* ── Best Sellers ── */}
        <ProductListSection title="Best Sellers" products={[...mockProducts].reverse().slice(0, 4)} />
      </div>

      {/* ── CTA Section ── */}
      <CTASection />

      {/* ── Incentives ── */}
      <IncentivesSection />

      {/* ── Footer ── */}
      <SiteFooter />
    </div>
  )
}

// ── Product list section (You May Also Like / Best Sellers) ──────────
function ProductListSection({ title, products: list }) {
  if (!list.length) return null
  return (
    <div style={{ borderTop: `1px solid ${C_BORDER}`, paddingTop: 64, paddingBottom: 64 }}>
      <div className="flex items-center justify-between mb-10">
        <h2 style={{ ...G, fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600, color: C_DARK, letterSpacing: '-1px', margin: 0 }}>
          {title}
        </h2>
        <Link to="/shop" style={{ ...G, fontSize: 14, fontWeight: 500, color: C_DARK, textDecoration: 'none', padding: '8px 16px', border: `1px solid ${C_BORDER}`, borderRadius: 8 }}
          className="hover:bg-gray-50 transition-colors">
          View all
        </Link>
      </div>
      <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
        {list.map((p, i) => (
          <MiniProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </div>
  )
}

function MiniProductCard({ product: p, index }) {
  const [addedToCart, setAddedToCart] = useState(false)
  const { addToCart } = useApp()
  const isSale = p.priceGlobal && p.priceLocal && p.priceGlobal > p.priceLocal

  const handleAdd = (e) => {
    e.preventDefault()
    addToCart?.(p)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 1200)
  }

  return (
    <Link to={`/product/${p.id}`} style={{ textDecoration: 'none' }} className="group flex flex-col"
      style={{ border: `1px solid ${C_BORDER}`, borderRadius: 8, overflow: 'hidden', textDecoration: 'none' }}>
      <div className="relative overflow-hidden" style={{ aspectRatio: '3/4', background: C_BG }}>
        <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        {isSale && (
          <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full"
            style={{ background: BLUE, color: '#fff', fontSize: 12, fontWeight: 500 }}>Sale</div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2">
        <span style={{ ...G, fontSize: 14, fontWeight: 400, color: C_MID }}>{p.category ?? 'Clothing'}</span>
        <span style={{ ...G, fontSize: 14, fontWeight: 500, color: C_DARK, lineHeight: 1.4 }}>{p.name}</span>
        <p style={{ ...G, fontSize: 14, fontWeight: 400, color: C_MID, lineHeight: 1.5, margin: 0 }} className="line-clamp-2">
          {p.description ?? 'Premium quality crafted for everyday style.'}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span style={{ ...G, fontSize: 18, fontWeight: 500, color: C_DARK }}>${p.priceLocal ?? p.priceGlobal}</span>
          {isSale && <span style={{ ...G, fontSize: 18, fontWeight: 400, color: C_MID, textDecoration: 'line-through' }}>${p.priceGlobal}</span>}
        </div>
        <button onClick={handleAdd}
          className="w-full flex items-center justify-center gap-2 mt-1 rounded-lg transition-all"
          style={{
            ...G, height: 36, fontSize: 14, fontWeight: 500,
            background: addedToCart ? '#16a34a' : C_DARK, color: '#fff',
            border: 'none', cursor: 'pointer', borderRadius: 6,
          }}>
          <ShoppingBag size={14} />
          {addedToCart ? 'Added!' : 'Add to cart'}
        </button>
      </div>
    </Link>
  )
}

// ── CTA Section ───────────────────────────────────────────────────────
function CTASection() {
  const [email, setEmail] = useState('')
  return (
    <div style={{ background: BLUE, padding: '80px 0' }}>
      <div className="max-w-[1280px] mx-auto px-8 flex flex-col items-center text-center gap-6">
        <span style={{ ...G, fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Limited Time Offer
        </span>
        <h2 style={{ ...G, fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 600, color: '#fff', letterSpacing: '-1px', margin: 0, lineHeight: 1.15 }}>
          Join Our Awesome Community Today
        </h2>
        <p style={{ ...G, fontSize: 18, fontWeight: 400, color: 'rgba(255,255,255,0.8)', maxWidth: 560, lineHeight: 1.6, margin: 0 }}>
          Sign up for our newsletter and get 15% off your first order. Be the first to know about new arrivals and exclusive deals.
        </p>
        <div className="flex gap-3 w-full" style={{ maxWidth: 440 }}>
          <input
            type="email" placeholder="Enter your email"
            value={email} onChange={e => setEmail(e.target.value)}
            style={{ ...G, flex: 1, height: 44, padding: '0 16px', borderRadius: 8, border: 'none', fontSize: 14, outline: 'none', background: 'rgba(255,255,255,0.15)', color: '#fff' }}
          />
          <button style={{ ...G, height: 44, padding: '0 24px', borderRadius: 8, background: '#fff', color: BLUE, fontSize: 14, fontWeight: 500, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
            className="hover:bg-gray-100 transition-colors">
            Sign Up Now
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Incentives Section ────────────────────────────────────────────────
function IncentivesSection() {
  const items = [
    { icon: Truck,      title: 'Free 2-day shipping',  desc: 'Complimentary express shipping on every order over $75, anywhere in the continental US.' },
    { icon: RotateCcw,  title: '30-day free returns',  desc: 'Send items back within 30 days for a fast refund with no restocking fees.' },
    { icon: Shield,     title: 'Secure checkout',       desc: '256-bit SSL encryption on every purchase keeps your payment info safe.' },
  ]
  return (
    <div style={{ background: '#e8e8e8', padding: '48px 0' }}>
      <div className="max-w-[1280px] mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#fff' }}>
                <Icon size={18} color={C_DARK} strokeWidth={1.5} />
              </div>
              <div>
                <p style={{ ...G, fontSize: 16, fontWeight: 500, color: C_DARK, margin: '0 0 4px' }}>{title}</p>
                <p style={{ ...G, fontSize: 14, fontWeight: 400, color: C_MID, lineHeight: 1.6, margin: 0 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Site Footer ───────────────────────────────────────────────────────
function SiteFooter() {
  const cols = [
    { heading: 'Shop', links: ["Women's Collection", "Men's Collection", 'Accessories', 'New Arrivals'] },
    { heading: 'Customer Service', links: ['Shipping & Returns', 'Size Guide', 'FAQ', 'Contact Us'] },
    { heading: 'About', links: ['Our Story', 'Careers', 'Sustainability', 'Press'] },
    { heading: 'Connect', links: ['Newsletter', 'Instagram', 'Facebook', 'Twitter'] },
  ]
  return (
    <footer style={{ background: '#fff', borderTop: `1px solid ${C_BORDER}` }}>
      <div className="max-w-[1280px] mx-auto px-8 pt-16 pb-8">
        {/* Top: logo + columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          {/* Brand col */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/shop" style={{ ...G, fontSize: 20, fontWeight: 700, letterSpacing: '0.1em', color: C_DARK, textDecoration: 'none' }}>
              DAARVI
            </Link>
            <p style={{ ...G, fontSize: 14, fontWeight: 400, color: C_MID, marginTop: 12, lineHeight: 1.6 }}>
              Premium fashion for those who appreciate quality and style.
            </p>
          </div>
          {/* Link columns */}
          {cols.map(col => (
            <div key={col.heading} className="flex flex-col gap-3">
              <span style={{ ...G, fontSize: 16, fontWeight: 500, color: C_DARK }}>{col.heading}</span>
              {col.links.map(l => (
                <Link key={l} to="/shop" style={{ ...G, fontSize: 14, fontWeight: 400, color: C_MID, textDecoration: 'none' }}
                  className="hover:text-blue-600 transition-colors">{l}</Link>
              ))}
            </div>
          ))}
        </div>
        {/* Bottom bar */}
        <div style={{ borderTop: `1px solid ${C_BORDER}`, paddingTop: 24 }} className="flex flex-col md:flex-row items-center justify-between gap-4">
          <span style={{ ...G, fontSize: 14, fontWeight: 400, color: C_MID }}>
            Copyright © 2025 Daarvi. All rights reserved.
          </span>
          <div className="flex items-center gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookies Settings'].map(l => (
              <Link key={l} to="/shop" style={{ ...G, fontSize: 14, fontWeight: 400, color: C_MID, textDecoration: 'none' }}
                className="hover:text-blue-600 transition-colors">{l}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  ArrowRight, User, ShoppingBag, Truck, RotateCcw,
  Shield, X, Search, Menu, Twitter, Instagram, Youtube,
  ChevronDown,
} from 'lucide-react'
import { brands, products } from '../data/mockData'
import LoginModal from '../components/LoginModal'
import { useApp } from '../context/AppContext'

const EASE = [0.76, 0, 0.24, 1]
const BRAND_VALUES = Object.values(brands)

// ── Figma exact tokens ────────────────────────────────────────────
const BLUE       = '#2563eb'
const BLUE_HOVER = '#1d4ed8'
const GRAY_BG    = '#e8e8e8'
const C_DARK     = '#0a0a0a'   // rgb(10,10,10)  — main text
const C_MID      = '#737373'   // rgb(115,115,115) — secondary text
const C_LIGHT    = '#f5f5f5'   // rgb(245,245,245) — text on dark bg

// Base inline style applied to every element that should be Geist
const G = { fontFamily: 'Geist, sans-serif' }

export default function Landing() {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('login')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const openModal = (mode = 'login') => {
    setModalMode(mode)
    setModalOpen(true)
  }

  return (
    <div style={{ ...G, background: '#ffffff', minHeight: '100vh', maxWidth: '100vw', overflowX: 'clip' }}>
      <LoginModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultMode={modalMode}
      />
      <AnnouncementBanner />
      <StoreNavbar mobileNavOpen={mobileNavOpen} setMobileNavOpen={setMobileNavOpen} />
      <HeroSection openModal={openModal} />
      <FeaturedProducts openModal={openModal} />
      <ShopByCategory openModal={openModal} />
      <FlashSale openModal={openModal} />
      <BestSellers openModal={openModal} />
      <CTASection openModal={openModal} />
      <TrustBadges />
      <SiteFooter />
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════
// ① ANNOUNCEMENT BANNER  (Figma: blue bar, h=48)
// ════════════════════════════════════════════════════════════════════
function AnnouncementBanner() {
  return (
    <div style={{ ...G, background: BLUE, height: 48 }} className="flex items-center">
      <div className="max-w-[1440px] w-full mx-auto px-8 flex items-center justify-between">
        {/* Social icons */}
        <div className="flex items-center gap-4">
          <Twitter size={16} color={C_LIGHT} strokeWidth={1.5} className="opacity-90 hover:opacity-100 cursor-pointer transition-opacity" />
          <Instagram size={16} color={C_LIGHT} strokeWidth={1.5} className="opacity-90 hover:opacity-100 cursor-pointer transition-opacity" />
          <Youtube size={16} color={C_LIGHT} strokeWidth={1.5} className="opacity-90 hover:opacity-100 cursor-pointer transition-opacity" />
        </div>
        {/* Center text */}
        <span style={{ fontSize: 14, fontWeight: 500, lineHeight: '20px', color: C_LIGHT }}>
          Free shipping on orders over $75
        </span>
        {/* Currency / Language dropdowns */}
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1" style={{ fontSize: 14, fontWeight: 500, color: C_LIGHT }}>
            USD <ChevronDown size={14} color={C_LIGHT} />
          </button>
          <button className="flex items-center gap-1" style={{ fontSize: 14, fontWeight: 500, color: C_LIGHT }}>
            English <ChevronDown size={14} color={C_LIGHT} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════
// ② STORE NAVBAR  (Figma: white bar h=64 + megamenu)
// ════════════════════════════════════════════════════════════════════
const NAV_LINKS = [
  { label: 'Women',         mega: true  },
  { label: 'Men',           mega: false },
  { label: 'Kids',          mega: false },
  { label: 'Accessories',   mega: false },
  { label: 'Store Locator', mega: false },
]

const MEGA_MENU = {
  clothing: {
    title: 'Clothing',
    items: ['Tops & Blouses','Dresses','Pants & Jeans','Skirts','Sweaters','Jackets & Coats','Activewear','Shop all'],
  },
  accessories: {
    title: 'Accessories',
    items: ['Handbags','Jewelry','Watches','Sunglasses','Scarves'],
  },
  brands: {
    title: 'Featured Brands',
    items: ['Elegance Co','Style Maven','Chic Boutique','Modern Lady'],
  },
}

function StoreNavbar({ openModal, mobileNavOpen, setMobileNavOpen }) {
  const { cartCount } = useApp()
  const [megaOpen, setMegaOpen] = useState(false)
  const closeTimer = useRef(null)

  const openMega  = () => { clearTimeout(closeTimer.current); setMegaOpen(true) }
  const closeMega = () => { closeTimer.current = setTimeout(() => setMegaOpen(false), 120) }

  return (
    <header
      style={{ background: '#ffffff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 50 }}
      onMouseLeave={closeMega}
    >
      {/* ── Main nav row ── */}
      <div className="max-w-[1440px] mx-auto px-8 flex items-center justify-between" style={{ height: 64 }}>
        {/* Logo */}
        <Link to="/" style={{ ...G, fontSize: 20, fontWeight: 700, letterSpacing: '0.1em', color: C_DARK, textDecoration: 'none', flexShrink: 0 }}>
          DAARVI
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {NAV_LINKS.map(({ label, mega }) => (
            <button
              key={label}
              onMouseEnter={mega ? openMega : closeMega}
              style={{ ...G, fontSize: 14, fontWeight: 500, lineHeight: '20px', color: C_DARK, padding: '8px 16px' }}
              className="flex items-center gap-1 rounded-md hover:bg-gray-50 transition-colors"
            >
              {label}
              {mega && <ChevronDown size={14} color={C_DARK} style={{ opacity: 0.5, transition: 'transform 0.2s', transform: megaOpen ? 'rotate(180deg)' : 'rotate(0)' }} />}
            </button>
          ))}
        </nav>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          <button
            className="hidden md:flex items-center justify-center w-9 h-9 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Search size={18} color={C_DARK} strokeWidth={1.5} />
          </button>
          <Link
            to="/login"
            className="flex items-center justify-center w-9 h-9 rounded-md hover:bg-gray-50 transition-colors"
          >
            <User size={18} color={C_DARK} strokeWidth={1.5} />
          </Link>
          <Link
            to="/login"
            className="relative flex items-center justify-center w-9 h-9 rounded-md hover:bg-gray-50 transition-colors"
          >
            <ShoppingBag size={18} color={C_DARK} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                style={{ ...G, background: BLUE, color: '#fff', fontSize: 10, fontWeight: 700 }}
              >
                {cartCount}
              </span>
            )}
          </Link>
          <button className="md:hidden flex items-center justify-center w-9 h-9" onClick={() => setMobileNavOpen(!mobileNavOpen)}>
            <Menu size={20} color={C_DARK} />
          </button>
        </div>
      </div>

      {/* ── Mobile nav ── */}
      {mobileNavOpen && (
        <div style={{ background: '#fff', borderTop: '1px solid #f3f4f6' }} className="md:hidden px-6 py-4 flex flex-col gap-1">
          {NAV_LINKS.map(({ label }) => (
            <button
              key={label}
              onClick={() => setMobileNavOpen(false)}
              style={{ ...G, fontSize: 14, fontWeight: 500, color: C_DARK, textAlign: 'left', padding: '10px 0' }}
              className="border-b border-gray-50 last:border-0"
            >
              {label}
            </button>
          ))}
          <div className="pt-4 flex gap-3">
            <Link to="/login" style={{ ...G, fontSize: 14, fontWeight: 500, color: '#fff', background: BLUE, padding: '8px 20px', borderRadius: 6, textDecoration: 'none' }}>
              Login
            </Link>
          </div>
        </div>
      )}

      {/* ── Mega menu ── */}
      {megaOpen && (
        <div
          style={{ background: '#ffffff', borderTop: '1px solid #e5e7eb', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
          onMouseEnter={openMega}
          onMouseLeave={closeMega}
        >
          <div className="max-w-[1280px] mx-auto px-8 py-8 grid grid-cols-5 gap-8">
            {/* Clothing */}
            <div className="col-span-1">
              <p style={{ ...G, fontSize: 14, fontWeight: 500, color: C_DARK, marginBottom: 16 }}>{MEGA_MENU.clothing.title}</p>
              <div className="flex flex-col gap-3">
                {MEGA_MENU.clothing.items.map(item => (
                  <span key={item} style={{ ...G, fontSize: 14, fontWeight: 400, color: C_MID, cursor: 'pointer' }} className="hover:text-black transition-colors">{item}</span>
                ))}
              </div>
            </div>
            {/* Accessories */}
            <div className="col-span-1">
              <p style={{ ...G, fontSize: 14, fontWeight: 500, color: C_DARK, marginBottom: 16 }}>{MEGA_MENU.accessories.title}</p>
              <div className="flex flex-col gap-3">
                {MEGA_MENU.accessories.items.map(item => (
                  <span key={item} style={{ ...G, fontSize: 14, fontWeight: 400, color: C_MID, cursor: 'pointer' }} className="hover:text-black transition-colors">{item}</span>
                ))}
              </div>
            </div>
            {/* Featured Brands */}
            <div className="col-span-1">
              <p style={{ ...G, fontSize: 14, fontWeight: 500, color: C_DARK, marginBottom: 16 }}>{MEGA_MENU.brands.title}</p>
              <div className="flex flex-col gap-3">
                {MEGA_MENU.brands.items.map(item => (
                  <span key={item} style={{ ...G, fontSize: 14, fontWeight: 400, color: C_MID, cursor: 'pointer' }} className="hover:text-black transition-colors">{item}</span>
                ))}
              </div>
            </div>
            {/* Featured image card: New Arrivals */}
            <div className="col-span-1 flex flex-col gap-2">
              <div style={{ background: GRAY_BG, borderRadius: 8, aspectRatio: '1/1', overflow: 'hidden' }} className="w-full">
                <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80" alt="New Arrivals" className="w-full h-full object-cover" />
              </div>
              <p style={{ ...G, fontSize: 14, fontWeight: 500, color: C_DARK }}>New Arrivals</p>
              <span style={{ ...G, fontSize: 14, fontWeight: 400, color: C_MID, cursor: 'pointer' }} className="hover:text-black transition-colors">Shop now</span>
            </div>
            {/* Featured image card: Summer Collection */}
            <div className="col-span-1 flex flex-col gap-2">
              <div style={{ background: GRAY_BG, borderRadius: 8, aspectRatio: '1/1', overflow: 'hidden' }} className="w-full">
                <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80" alt="Summer Collection" className="w-full h-full object-cover" />
              </div>
              <p style={{ ...G, fontSize: 14, fontWeight: 500, color: C_DARK }}>Summer Collection</p>
              <span style={{ ...G, fontSize: 14, fontWeight: 400, color: C_MID, cursor: 'pointer' }} className="hover:text-black transition-colors">Shop now</span>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

// ════════════════════════════════════════════════════════════════════
// ③ HERO
// ════════════════════════════════════════════════════════════════════
function HeroSection({ openModal }) {
  const heroBg = BRAND_VALUES[0]?.cover

  return (
    <section
      className="relative flex items-center justify-center overflow-hidden"
      style={{ minHeight: 484, paddingTop: 96, paddingBottom: 96 }}
    >
      {heroBg && (
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroBg})` }} />
      )}
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.80)' }} />

      <div className="relative z-10 max-w-[1280px] mx-auto px-6 w-full flex justify-center">
        <div className="max-w-[672px] flex flex-col items-center text-center" style={{ gap: 24 }}>
          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ ...G, fontSize: 14, fontWeight: 500, lineHeight: '20px', color: '#ffffff' }}
          >
            New Collection
          </motion.p>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
            style={{
              ...G,
              fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
              fontWeight: 600,
              lineHeight: 1,
              letterSpacing: '-1.5px',
              color: '#ffffff',
              margin: 0,
            }}
          >
            Discover Your Style
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.35 }}
            style={{ ...G, fontSize: 18, fontWeight: 400, lineHeight: '32px', color: '#ffffff', maxWidth: 560 }}
          >
            Explore our curated collection of premium fashion and accessories. From everyday essentials to statement pieces, find everything you need to express your unique style.
          </motion.p>

          {/* CTA */}
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.5 }}
            onClick={() => openModal('signup')}
            className="transition-colors"
            style={{ ...G, background: BLUE, color: '#fff', fontSize: 14, fontWeight: 500, lineHeight: '20px', padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = BLUE_HOVER}
            onMouseLeave={e => e.currentTarget.style.background = BLUE}
          >
            Shop now
          </motion.button>
        </div>
      </div>
    </section>
  )
}

// ════════════════════════════════════════════════════════════════════
// ④ FEATURED PRODUCTS
// ════════════════════════════════════════════════════════════════════
function FeaturedProducts({ openModal }) {
  const featured = products.slice(0, 3)
  return (
    <section style={{ background: '#ffffff', padding: '96px 24px' }}>
      <div className="max-w-[1280px] mx-auto">
        <SectionHeader title="Featured products" onViewAll={() => openModal('login')} />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {featured.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} openModal={openModal} showSale={i > 0} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ════════════════════════════════════════════════════════════════════
// ⑤ SHOP BY CATEGORY
// ════════════════════════════════════════════════════════════════════
const CATEGORIES = [
  { label: 'New Collection', title: "Women's Fashion", idx: 0 },
  { label: 'Summer Essentials', title: "Men's Apparel", idx: 1 },
  { label: 'Trending Now', title: 'Accessories', idx: 2 },
]

function ShopByCategory({ openModal }) {
  return (
    <section style={{ background: GRAY_BG, padding: '96px 24px' }}>
      <div className="max-w-[1280px] mx-auto">
        <SectionHeader title="Shop by Category" onViewAll={() => openModal('login')} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {CATEGORIES.map((cat, i) => {
            const bg = BRAND_VALUES[cat.idx]?.cover
            return (
              <motion.button
                key={cat.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: EASE, delay: i * 0.1 }}
                className="relative overflow-hidden group rounded-lg text-left focus:outline-none"
                style={{ aspectRatio: '3/4' }}
                onClick={() => openModal('login')}
              >
                {bg && (
                  <img src={bg} alt={cat.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6" style={{ color: '#ffffff' }}>
                  <p style={{ ...G, fontSize: 14, fontWeight: 500, lineHeight: '20px', color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
                    {cat.label}
                  </p>
                  <h3 style={{ ...G, fontSize: 24, fontWeight: 600, lineHeight: '32px', color: '#ffffff', marginBottom: 12 }}>
                    {cat.title}
                  </h3>
                  <span
                    className="flex items-center gap-1.5 group-hover:opacity-100 transition-opacity"
                    style={{ ...G, fontSize: 14, fontWeight: 500, lineHeight: '20px', color: 'rgba(255,255,255,0.7)', opacity: 0.9 }}
                  >
                    Shop now <ArrowRight size={14} />
                  </span>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ════════════════════════════════════════════════════════════════════
// ⑥ FLASH SALE
// ════════════════════════════════════════════════════════════════════
function FlashSale({ openModal }) {
  const saleBg = BRAND_VALUES[3]?.cover
  const endDate = useRef(new Date(Date.now() + 12 * 86400000 + 23 * 3600000 + 46 * 60000 + 17000))
  const [time, setTime] = useState({ days: 12, hours: 23, min: 46, sec: 17 })

  useEffect(() => {
    const tick = () => {
      const diff = endDate.current - Date.now()
      if (diff <= 0) return
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        min: Math.floor((diff % 3600000) / 60000),
        sec: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const pad = (n) => String(n).padStart(2, '0')
  const units = [
    { v: time.days, l: 'DAYS' },
    { v: time.hours, l: 'HOURS' },
    { v: time.min, l: 'MIN' },
    { v: time.sec, l: 'SEC' },
  ]

  return (
    <section className="relative overflow-hidden" style={{ paddingTop: 80, paddingBottom: 80 }}>
      {saleBg && (
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${saleBg})` }} />
      )}
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.40)' }} />

      <div className="relative z-10 max-w-[1280px] mx-auto px-6">
        <div className="max-w-[576px] bg-white rounded-xl" style={{ padding: '32px' }}>
          {/* Label */}
          <p style={{ ...G, fontSize: 14, fontWeight: 500, lineHeight: '20px', color: C_MID, marginBottom: 8 }}>
            Limited Time
          </p>
          {/* Title */}
          <h2 style={{ ...G, fontSize: 48, fontWeight: 600, lineHeight: '48px', letterSpacing: '-1.2px', color: C_DARK, marginBottom: 16 }}>
            Flash Sale! 33% off!
          </h2>
          {/* Divider */}
          <div style={{ borderTop: '1px solid #e5e7eb', marginBottom: 24 }} />
          {/* Subtitle */}
          <p style={{ ...G, fontSize: 18, fontWeight: 400, lineHeight: '32px', color: C_MID, marginBottom: 16 }}>
            Hurry up! The offer ends soon.
          </p>
          {/* Countdown */}
          <div className="flex items-center gap-3" style={{ marginBottom: 32 }}>
            {units.map(({ v, l }, i) => (
              <div key={l} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <motion.span
                    key={v}
                    initial={{ opacity: 0.6, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ ...G, fontSize: 30, fontWeight: 600, lineHeight: '36px', color: C_DARK, fontVariantNumeric: 'tabular-nums' }}
                  >
                    {pad(v)}
                  </motion.span>
                  <span style={{ ...G, fontSize: 12, fontWeight: 500, lineHeight: '16px', color: C_MID, letterSpacing: '0.1em' }}>
                    {l}
                  </span>
                </div>
                {i < units.length - 1 && (
                  <span style={{ ...G, fontSize: 24, fontWeight: 600, color: C_MID, marginBottom: 16 }}>:</span>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => openModal('login')}
            style={{ ...G, background: BLUE, color: '#fff', fontSize: 14, fontWeight: 500, lineHeight: '20px', padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = BLUE_HOVER}
            onMouseLeave={e => e.currentTarget.style.background = BLUE}
          >
            Shop now
          </button>
        </div>
      </div>
    </section>
  )
}

// ════════════════════════════════════════════════════════════════════
// ⑦ BEST SELLERS
// ════════════════════════════════════════════════════════════════════
function BestSellers({ openModal }) {
  const items = products.length >= 7 ? products.slice(3, 7) : products.slice(0, 4)
  return (
    <section style={{ background: '#ffffff', padding: '96px 24px' }}>
      <div className="max-w-[1280px] mx-auto">
        <SectionHeader title="Best Sellers" onViewAll={() => openModal('login')} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {items.map((product, i) => (
            <ProductCard
              key={product.id + '-bs'}
              product={product}
              index={i}
              openModal={openModal}
              showSale={i % 2 === 0}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// ════════════════════════════════════════════════════════════════════
// ⑧ CTA SECTION
// ════════════════════════════════════════════════════════════════════
function CTASection({ openModal }) {
  const ref    = useRef()
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} style={{ background: BLUE, padding: '96px 24px' }}>
      <div className="max-w-[1280px] mx-auto">
        <div className="max-w-[576px]">
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ ...G, fontSize: 14, fontWeight: 500, lineHeight: '20px', color: 'rgba(255,255,255,0.7)', marginBottom: 16 }}
          >
            Limited Time Offer
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
            style={{ ...G, fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600, lineHeight: 1.1, letterSpacing: '-1.2px', color: '#ffffff', marginBottom: 24 }}
          >
            Join Our Awesome Community Today
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: EASE, delay: 0.35 }}
            style={{ ...G, fontSize: 18, fontWeight: 400, lineHeight: '32px', color: 'rgba(255,255,255,0.85)', marginBottom: 40 }}
          >
            Sign up for our newsletter and get 15% off your first order. Be the first to know about new arrivals and exclusive deals.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: EASE, delay: 0.5 }}
            onClick={() => openModal('signup')}
            style={{ ...G, background: '#ffffff', color: C_DARK, fontSize: 14, fontWeight: 500, lineHeight: '20px', padding: '10px 32px', borderRadius: 8, border: 'none', cursor: 'pointer' }}
            className="hover:bg-gray-100 transition-colors"
          >
            Sign Up Now
          </motion.button>
        </div>
      </div>
    </section>
  )
}

// ════════════════════════════════════════════════════════════════════
// ⑨ TRUST BADGES
// ════════════════════════════════════════════════════════════════════
const TRUST_ITEMS = [
  {
    icon: Truck,
    title: 'Free 2-day shipping',
    desc: 'Complimentary express shipping on every order over $75, anywhere in the continental US.',
  },
  {
    icon: RotateCcw,
    title: '30-day free returns',
    desc: 'Send items back within 30 days for a fast refund with no restocking fees.',
  },
  {
    icon: Shield,
    title: 'Secure checkout',
    desc: '256-bit SSL encryption on every purchase keeps your payment info safe.',
  },
]

function TrustBadges() {
  return (
    <div style={{ background: '#ffffff', borderTop: '1px solid #e5e7eb' }}>
      <div className="max-w-[1280px] mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
        {TRUST_ITEMS.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-4">
            <Icon size={20} color={BLUE} strokeWidth={1.5} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ ...G, fontSize: 16, fontWeight: 500, lineHeight: '24px', color: C_DARK, marginBottom: 4 }}>{title}</p>
              <p style={{ ...G, fontSize: 14, fontWeight: 400, lineHeight: '20px', color: C_MID }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════
// ⑩ FOOTER
// ════════════════════════════════════════════════════════════════════
function SiteFooter() {
  const SHOP    = ["Women's Collection", "Men's Collection", 'Accessories', 'New Arrivals']
  const SERVICE = ['Shipping & Returns', 'Size Guide', 'FAQ', 'Contact Us']
  const ABOUT   = ['Our Story', 'Sustainability', 'Careers', 'Press']

  return (
    <footer style={{ background: '#ffffff', borderTop: '1px solid #e5e7eb' }}>
      <div className="max-w-[1280px] mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <p style={{ ...G, fontSize: 20, fontWeight: 600, letterSpacing: '0.12em', color: C_DARK, marginBottom: 16 }}>DAARVI</p>
          <p style={{ ...G, fontSize: 14, fontWeight: 400, lineHeight: '20px', color: C_MID, maxWidth: 200 }}>
            A curated connection of global and local boutiques — matched to your style.
          </p>
        </div>
        <FooterCol title="Shop" links={SHOP} />
        <FooterCol title="Customer Service" links={SERVICE} />
        <FooterCol title="About" links={ABOUT} />
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb' }} className="px-6 py-5 max-w-[1280px] mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <p style={{ ...G, fontSize: 14, fontWeight: 400, lineHeight: '20px', color: C_MID }}>
          © 2026 Daarvi. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          {['Privacy Policy', 'Terms of Service', 'Contact'].map((link) => (
            <button
              key={link}
              style={{ ...G, fontSize: 14, fontWeight: 400, lineHeight: '20px', color: C_MID }}
              className="hover:opacity-70 transition-opacity"
            >
              {link}
            </button>
          ))}
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }) {
  return (
    <div>
      <p style={{ ...G, fontSize: 16, fontWeight: 500, lineHeight: '24px', color: C_DARK, marginBottom: 16 }}>{title}</p>
      {links.map((link) => (
        <button
          key={link}
          className="block hover:opacity-70 transition-opacity text-left"
          style={{ ...G, fontSize: 14, fontWeight: 400, lineHeight: '20px', color: C_MID, marginBottom: 12 }}
        >
          {link}
        </button>
      ))}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════
// SHARED: PRODUCT CARD
// ════════════════════════════════════════════════════════════════════
function ProductCard({ product, index, openModal, showSale = false }) {
  const price    = Math.min(product.priceLocal || 0, product.priceGlobal || 0)
  const original = Math.max(product.priceLocal || 0, product.priceGlobal || 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: EASE, delay: index * 0.08 }}
      className="group cursor-pointer"
      onClick={() => openModal('login')}
    >
      {/* Image */}
      <div className="relative overflow-hidden rounded-lg" style={{ aspectRatio: '3/4', background: '#f5f5f5' }}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {showSale && (
          <span
            className="absolute top-3 left-3"
            style={{ ...G, background: BLUE, color: '#fff', fontSize: 12, fontWeight: 500, lineHeight: '16px', padding: '4px 8px', borderRadius: 4 }}
          >
            Sale
          </span>
        )}
        {/* Hover add to cart */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <button
            style={{ ...G, background: '#fff', color: C_DARK, fontSize: 14, fontWeight: 500, lineHeight: '20px', padding: '10px 0', borderRadius: 8, border: 'none', cursor: 'pointer', width: '100%' }}
          >
            Add to cart
          </button>
        </div>
      </div>

      {/* Details */}
      <div style={{ paddingTop: 16 }}>
        <p style={{ ...G, fontSize: 14, fontWeight: 400, lineHeight: '20px', color: C_MID, marginBottom: 4 }}>
          {product.brand}
        </p>
        <p style={{ ...G, fontSize: 14, fontWeight: 500, lineHeight: '20px', color: C_DARK, marginBottom: 8 }}>
          {product.name}
        </p>
        <p
          style={{ ...G, fontSize: 14, fontWeight: 400, lineHeight: '20px', color: C_MID, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          Premium quality piece, crafted for everyday elegance.
        </p>
        <div className="flex items-center gap-3">
          <span style={{ ...G, fontSize: 18, fontWeight: 500, lineHeight: '28px', color: C_DARK }}>${price}</span>
          {showSale && price !== original && (
            <span style={{ ...G, fontSize: 14, fontWeight: 400, lineHeight: '20px', color: C_MID, textDecoration: 'line-through' }}>${original}</span>
          )}
        </div>
        <button
          className="transition-colors"
          style={{ ...G, background: BLUE, color: '#fff', fontSize: 14, fontWeight: 500, lineHeight: '20px', padding: '10px 0', borderRadius: 8, border: 'none', cursor: 'pointer', width: '100%', marginTop: 12 }}
          onMouseEnter={e => e.currentTarget.style.background = BLUE_HOVER}
          onMouseLeave={e => e.currentTarget.style.background = BLUE}
        >
          Add to cart
        </button>
      </div>
    </motion.div>
  )
}

// ════════════════════════════════════════════════════════════════════
// SHARED: SECTION HEADER
// ════════════════════════════════════════════════════════════════════
function SectionHeader({ title, onViewAll }) {
  return (
    <div className="flex items-end justify-between" style={{ marginBottom: 40 }}>
      <h2 style={{ ...G, fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600, lineHeight: 1, letterSpacing: '-1.2px', color: C_DARK, margin: 0 }}>
        {title}
      </h2>
      {onViewAll && (
        <button
          onClick={onViewAll}
          className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
          style={{ ...G, fontSize: 14, fontWeight: 500, lineHeight: '20px', color: BLUE }}
        >
          View all <ArrowRight size={15} />
        </button>
      )}
    </div>
  )
}

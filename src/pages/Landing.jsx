import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  ArrowRight, User, ShoppingBag, Truck, RotateCcw,
  Shield, X, Search, Menu,
} from 'lucide-react'
import { brands, products } from '../data/mockData'
import LoginModal from '../components/LoginModal'
import { useApp } from '../context/AppContext'

const EASE = [0.76, 0, 0.24, 1]
const BRAND_VALUES = Object.values(brands)

// Figma exact colors
const BLUE = '#2563eb'
const BLUE_HOVER = '#1d4ed8'
const GRAY_BG = '#e8e8e8'

export default function Landing() {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('login')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const openModal = (mode = 'login') => {
    setModalMode(mode)
    setModalOpen(true)
  }

  return (
    <div className="bg-white min-h-screen" style={{ maxWidth: '100vw', overflowX: 'clip' }}>
      <LoginModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultMode={modalMode}
      />

      {/* ① Announcement banner — blue */}
      <AnnouncementBanner />

      {/* ② Store navbar */}
      <StoreNavbar openModal={openModal} mobileNavOpen={mobileNavOpen} setMobileNavOpen={setMobileNavOpen} />

      {/* ③ Hero */}
      <HeroSection openModal={openModal} />

      {/* ④ Featured products — white */}
      <FeaturedProducts openModal={openModal} />

      {/* ⑤ Shop by category — gray */}
      <ShopByCategory openModal={openModal} />

      {/* ⑥ Flash sale countdown */}
      <FlashSale openModal={openModal} />

      {/* ⑦ Best sellers — white */}
      <BestSellers openModal={openModal} />

      {/* ⑧ CTA — blue */}
      <CTASection openModal={openModal} />

      {/* ⑨ Trust badges */}
      <TrustBadges />

      {/* ⑩ Footer */}
      <SiteFooter />
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════
// ① ANNOUNCEMENT BANNER — blue, exactly as Figma
// ════════════════════════════════════════════════════════════════════
function AnnouncementBanner() {
  const [visible, setVisible] = useState(true)
  if (!visible) return null
  return (
    <div className="relative flex items-center justify-center gap-2 py-3 px-10 text-white text-sm" style={{ background: BLUE }}>
      <Truck size={14} />
      <span>Free shipping on orders over $75</span>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition-opacity"
      >
        <X size={14} />
      </button>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════
// ② STORE NAVBAR — white, exactly as Figma
// ════════════════════════════════════════════════════════════════════
const NAV_LINKS = ['Women', 'Men', 'Kids', 'About Us', 'Store Locator']

function StoreNavbar({ openModal, mobileNavOpen, setMobileNavOpen }) {
  const { cartCount } = useApp()

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Logo */}
        <span className="font-serif text-xl tracking-widest text-gray-900 flex-shrink-0">DAARVI</span>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 flex-1">
          {NAV_LINKS.map((label) => (
            <button
              key={label}
              onClick={() => openModal('login')}
              className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className="hidden md:block" onClick={() => openModal('login')}>
            <Search size={20} className="text-gray-600 hover:text-gray-900 transition-colors" />
          </button>
          <button onClick={() => openModal('login')} className="relative">
            <User size={20} className="text-gray-600 hover:text-gray-900 transition-colors" />
          </button>
          <button onClick={() => openModal('login')} className="relative">
            <ShoppingBag size={20} className="text-gray-600 hover:text-gray-900 transition-colors" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center" style={{ background: BLUE }}>
                {cartCount}
              </span>
            )}
          </button>
          <button className="md:hidden" onClick={() => setMobileNavOpen(!mobileNavOpen)}>
            <Menu size={20} className="text-gray-700" />
          </button>
        </div>
      </div>

      {/* Mobile nav dropdown */}
      {mobileNavOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-4">
          {NAV_LINKS.map((label) => (
            <button
              key={label}
              onClick={() => { openModal('login'); setMobileNavOpen(false) }}
              className="text-sm text-gray-700 text-left"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </header>
  )
}

// ════════════════════════════════════════════════════════════════════
// ③ HERO — image bg + dark overlay, exactly as Figma
// ════════════════════════════════════════════════════════════════════
function HeroSection({ openModal }) {
  const heroBg = BRAND_VALUES[0]?.cover

  return (
    <section
      className="relative flex items-center justify-center overflow-hidden"
      style={{ minHeight: 484, paddingTop: 96, paddingBottom: 96 }}
    >
      {/* Background image */}
      {heroBg && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
      )}
      {/* 80% black overlay — exact Figma value */}
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.80)' }} />

      <div className="relative z-10 max-w-[1280px] mx-auto px-6 w-full flex justify-center">
        <div className="max-w-[672px] flex flex-col items-center text-center gap-8">
          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-sm text-gray-300"
          >
            New Collection
          </motion.p>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
            className="text-white font-bold leading-tight"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 3.75rem)' }}
          >
            Discover Your Style
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.35 }}
            className="text-lg text-gray-300 leading-relaxed max-w-[560px]"
          >
            Explore our curated collection of premium fashion and accessories. From everyday essentials to statement pieces, find everything you need to express your unique style.
          </motion.p>

          {/* CTA */}
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.5 }}
            onClick={() => openModal('signup')}
            className="px-6 py-2.5 text-white text-sm font-medium rounded-lg transition-colors"
            style={{ background: BLUE }}
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
// ④ FEATURED PRODUCTS — white bg
// ════════════════════════════════════════════════════════════════════
function FeaturedProducts({ openModal }) {
  const featured = products.slice(0, 3)
  return (
    <section className="bg-white py-24 px-6">
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
// ⑤ SHOP BY CATEGORY — gray bg, exactly as Figma
// ════════════════════════════════════════════════════════════════════
const CATEGORIES = [
  { label: 'New Collection', title: "Women's Fashion", idx: 0 },
  { label: 'Summer Essentials', title: "Men's Apparel", idx: 1 },
  { label: 'Trending Now', title: 'Accessories', idx: 2 },
]

function ShopByCategory({ openModal }) {
  return (
    <section className="py-24 px-6" style={{ background: GRAY_BG }}>
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
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <p className="text-xs text-gray-300 mb-1">{cat.label}</p>
                  <h3 className="text-xl font-semibold leading-snug mb-3">{cat.title}</h3>
                  <span className="flex items-center gap-1.5 text-sm text-gray-300 group-hover:text-white transition-colors">
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
// ⑥ FLASH SALE — white card on image bg, exactly as Figma
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
    <section className="relative bg-white overflow-hidden" style={{ paddingTop: 192, paddingBottom: 24 }}>
      {/* Background image */}
      {saleBg && (
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${saleBg})` }} />
      )}
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 max-w-[1280px] mx-auto px-6">
        {/* White card — exact Figma structure */}
        <div className="max-w-[576px] bg-white rounded-xl p-6 md:p-8">
          {/* Title + subtitle */}
          <div className="mb-5 pb-3 border-b border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Limited Time</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Flash Sale! 33% off!</h2>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-2 mb-8">
            <p className="text-base text-gray-600 mr-2">Hurry up! The offer ends soon.</p>
          </div>
          <div className="flex items-center gap-3 mb-8">
            {units.map(({ v, l }, i) => (
              <div key={l} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <motion.span
                    key={v}
                    initial={{ opacity: 0.6, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-3xl font-bold text-gray-900 tabular-nums"
                  >
                    {pad(v)}
                  </motion.span>
                  <span className="text-[11px] text-gray-400 tracking-widest font-medium">{l}</span>
                </div>
                {i < units.length - 1 && (
                  <span className="text-2xl font-bold text-gray-400 mb-4">:</span>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => openModal('login')}
            className="px-6 py-2.5 text-white text-sm font-medium rounded-lg transition-colors"
            style={{ background: BLUE }}
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
// ⑦ BEST SELLERS — white bg
// ════════════════════════════════════════════════════════════════════
function BestSellers({ openModal }) {
  const items = products.length >= 7 ? products.slice(3, 7) : products.slice(0, 4)
  return (
    <section className="bg-white py-24 px-6">
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
// ⑧ CTA SECTION — blue bg, exactly as Figma
// ════════════════════════════════════════════════════════════════════
function CTASection({ openModal }) {
  const ref    = useRef()
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-24 px-6 text-white" style={{ background: BLUE }}>
      <div className="max-w-[1280px] mx-auto">
        <div className="max-w-[576px]">
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-sm text-blue-200 mb-4"
          >
            Limited Time Offer
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold leading-tight mb-6"
          >
            Join Our Awesome Community Today
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: EASE, delay: 0.35 }}
            className="text-lg text-blue-100 leading-relaxed mb-10"
          >
            Sign up for our newsletter and get 15% off your first order. Be the first to know about new arrivals and exclusive deals.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: EASE, delay: 0.5 }}
            onClick={() => openModal('signup')}
            className="bg-white text-gray-900 font-medium px-8 py-3 rounded-lg text-sm hover:bg-gray-100 transition-colors"
          >
            Sign Up Now
          </motion.button>
        </div>
      </div>
    </section>
  )
}

// ════════════════════════════════════════════════════════════════════
// ⑨ TRUST BADGES — exactly as Figma
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
    <div className="bg-white border-t border-gray-200">
      <div className="max-w-[1280px] mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
        {TRUST_ITEMS.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-4">
            <Icon size={20} className="flex-shrink-0 mt-0.5" style={{ color: BLUE }} strokeWidth={1.5} />
            <div>
              <p className="text-base font-semibold text-gray-900 mb-1">{title}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════
// ⑩ FOOTER — exactly as Figma
// ════════════════════════════════════════════════════════════════════
function SiteFooter() {
  const SHOP = ["Women's Collection", "Men's Collection", 'Accessories', 'New Arrivals']
  const SERVICE = ['Shipping & Returns', 'Size Guide', 'FAQ', 'Contact Us']
  const ABOUT = ['Our Story', 'Sustainability', 'Careers', 'Press']

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-[1280px] mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <p className="font-serif text-xl tracking-widest text-gray-900 mb-4">DAARVI</p>
          <p className="text-sm text-gray-500 leading-relaxed max-w-[200px]">
            A curated connection of global and local boutiques — matched to your style.
          </p>
        </div>

        <FooterCol title="Shop" links={SHOP} />
        <FooterCol title="Customer Service" links={SERVICE} />
        <FooterCol title="About" links={ABOUT} />
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200 px-6 py-5 max-w-[1280px] mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <p className="text-sm text-gray-400">© 2026 Daarvi. All rights reserved.</p>
        <div className="flex items-center gap-6">
          {['Privacy Policy', 'Terms of Service', 'Contact'].map((link) => (
            <button key={link} className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
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
      <p className="text-base font-semibold text-gray-900 mb-4">{title}</p>
      {links.map((link) => (
        <button key={link} className="block text-sm text-gray-500 mb-3 hover:text-gray-800 transition-colors text-left">
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
      <div className="relative overflow-hidden rounded-lg bg-gray-100" style={{ aspectRatio: '3/4' }}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {showSale && (
          <span className="absolute top-3 left-3 text-white text-xs font-semibold px-2 py-1 rounded" style={{ background: BLUE }}>
            Sale
          </span>
        )}
        {/* Hover CTA */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <button className="w-full bg-white text-gray-900 text-sm font-medium py-2.5 rounded shadow-md hover:bg-gray-50 transition-colors">
            Add to cart
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="pt-4">
        <p className="text-xs text-gray-400 mb-1">{product.brand}</p>
        <p className="text-sm font-medium text-gray-900 leading-snug mb-2">{product.name}</p>
        <p className="text-sm text-gray-600 leading-relaxed mb-3" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          Premium quality piece, crafted for everyday elegance.
        </p>
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-gray-900">${price}</span>
          {showSale && price !== original && (
            <span className="text-sm text-gray-400 line-through">${original}</span>
          )}
        </div>
        <button
          className="mt-3 w-full text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
          style={{ background: BLUE }}
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
    <div className="flex items-end justify-between mb-10">
      <h2 className="text-4xl font-bold text-gray-900">{title}</h2>
      {onViewAll && (
        <button
          onClick={onViewAll}
          className="flex items-center gap-1.5 text-sm font-medium transition-colors"
          style={{ color: BLUE }}
        >
          View all <ArrowRight size={15} />
        </button>
      )}
    </div>
  )
}
